"""Linha de comando: python -m iptu_cep <comando> ..."""

from __future__ import annotations

import argparse
import csv
import json
import sys
from dataclasses import asdict
from pathlib import Path

from . import automatico, base, cep, publicar, web

DB_PADRAO = Path(__file__).resolve().parent.parent / "dados" / "iptu_sp.sqlite"
# O nome da última pasta vira o nome do projeto na Vercel (iptu-cep.vercel.app).
SITE_PADRAO = Path(__file__).resolve().parent.parent / "site" / "iptu-cep"
CIDADES_SUPORTADAS = web.CIDADES_SUPORTADAS
LINK_2A_VIA = web.LINK_2A_VIA


def _moeda(v: float | None) -> str:
    if v is None:
        return "-"
    return "R$ " + f"{v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def _area(v: float | None) -> str:
    return "-" if v is None else f"{v:,.0f} m²".replace(",", ".")


def cmd_importar(args) -> int:
    if not Path(args.csv).is_file():
        print(f"Arquivo não encontrado: {args.csv}\n"
              "Baixe a base no GeoSampa ou use:  py -m iptu_cep tudo  (o programa procura e baixa sozinho)",
              file=sys.stderr)
        return 1
    destino = Path(args.db)
    destino.parent.mkdir(parents=True, exist_ok=True)
    print(f"Importando {args.csv} -> {destino} ...")
    total = base.importar_csv(args.csv, destino, progresso=lambda n: print(f"  {n:,} imóveis".replace(",", "."), end="\r"))
    print(f"\nPronto: {total:,} imóveis importados.".replace(",", "."))
    return 0


def cmd_consultar(args) -> int:
    try:
        cep_num = cep.normalizar_cep(args.cep)
    except cep.CepInvalido as e:
        print(e, file=sys.stderr)
        return 2

    endereco = None
    if not args.offline:
        try:
            endereco = cep.buscar_endereco(cep_num)
        except cep.CepNaoEncontrado:
            print(f"CEP {cep.formatar_cep(cep_num)} não existe nos Correios.", file=sys.stderr)
            return 1
        except ConnectionError as e:
            print(f"Aviso: {e} Seguindo só com a base local.", file=sys.stderr)
        if endereco and endereco.ibge and endereco.ibge not in CIDADES_SUPORTADAS:
            print(
                f"CEP de {endereco.cidade}/{endereco.uf}. Por enquanto só a base de São Paulo "
                "está integrada; consulte o IPTU no site da prefeitura da sua cidade.",
                file=sys.stderr,
            )
            return 1

    try:
        imoveis = base.consultar(args.db, cep_num, args.numero)
    except FileNotFoundError as e:
        print(e, file=sys.stderr)
        return 1

    if args.formato == "json":
        saida = {
            "cep": cep.formatar_cep(cep_num),
            "endereco": asdict(endereco) if endereco else None,
            "total": len(imoveis),
            "imoveis": [
                {**{k: v for k, v in asdict(i).items() if k != "extras"},
                 "valor_venal_estimado": i.valor_venal_estimado}
                for i in imoveis
            ],
        }
        print(json.dumps(saida, ensure_ascii=False, indent=2))
        return 0 if imoveis else 1

    if args.formato == "csv":
        campos = [c for c in base.COLUNAS] + ["valor_venal_estimado"]
        w = csv.writer(sys.stdout, delimiter=";")
        w.writerow(campos)
        for i in imoveis:
            d = asdict(i)
            w.writerow([d.get(c, "") if c != "valor_venal_estimado" else i.valor_venal_estimado for c in campos])
        return 0 if imoveis else 1

    print(f"CEP {cep.formatar_cep(cep_num)}", end="")
    if endereco:
        print(f" — {endereco.logradouro}, {endereco.bairro}, {endereco.cidade}/{endereco.uf} (via {endereco.fonte})")
    else:
        print()
    if not imoveis:
        print("Nenhum imóvel encontrado na base para esse CEP" + (f" e número {args.numero}." if args.numero else "."))
        return 1

    print(f"{len(imoveis)} imóvel(is) encontrado(s):\n")
    for i in imoveis:
        print(f"• {i.endereco}  [contribuinte/SQL {i.sql or '-'}]")
        print(f"    Uso: {i.uso or '-'} | Padrão: {i.padrao or '-'} | Construção: {i.ano_construcao or '-'}")
        print(f"    Terreno: {_area(i.area_terreno)} × {_moeda(i.valor_m2_terreno)}/m²"
              f" | Construída: {_area(i.area_construida)} × {_moeda(i.valor_m2_construcao)}/m²")
        print(f"    Valor venal estimado: {_moeda(i.valor_venal_estimado)}"
              f"{'  (exercício ' + i.ano_exercicio + ')' if i.ano_exercicio else ''}")
    print(
        "\nO valor venal é uma estimativa simplificada, não o valor oficial do carnê."
        f"\nPara o valor do IPTU e a 2ª via, use o número do contribuinte em {LINK_2A_VIA}"
    )
    return 0


def cmd_web(args) -> int:
    web.servir(Path(args.db), porta=args.porta, abrir=not args.sem_navegador)
    return 0


def cmd_publicar(args) -> int:
    destino = Path(args.destino)
    try:
        r = publicar.publicar(args.db, destino, progresso=lambda n: print(f"  {n:,} imóveis".replace(",", "."), end="\r"))
    except FileNotFoundError as e:
        print(e, file=sys.stderr)
        return 1
    print(f"\nSite gerado em {destino}: {r['imoveis']:,} imóveis em {r['arquivos']} arquivos ({r['megabytes']} MB).".replace(",", "."))
    print(f"Para publicar:  cd {destino}  &&  npx vercel --prod")
    return 0


def cmd_tudo(args) -> int:
    try:
        endereco = automatico.tudo(
            Path(args.db), Path(args.destino),
            arquivo=Path(args.arquivo) if args.arquivo else None,
            url=args.url,
            publicar_online=not args.sem_vercel,
        )
    except KeyboardInterrupt:
        print("\nCancelado.", file=sys.stderr)
        return 130
    except (FileNotFoundError, TimeoutError, RuntimeError, ValueError, OSError) as e:
        print(f"\nErro: {e}", file=sys.stderr)
        return 1
    if args.sem_vercel:
        print(f"Pronto. Para publicar depois:  cd {args.destino}  e  npx vercel --prod")
    elif endereco:
        print(f"\n✅ Site publicado: {endereco}")
        print("Se esse endereço pedir login da Vercel, use o domínio que aparece no projeto em vercel.com/dashboard.")
    else:
        print("\nPublicado, mas não identifiquei o endereço na saída. Veja em vercel.com/dashboard.")
    return 0


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="iptu_cep", description="Consulta imóveis e IPTU pelo CEP (São Paulo).")
    p.add_argument("--db", default=str(DB_PADRAO), help=f"arquivo SQLite da base (padrão: {DB_PADRAO})")
    sub = p.add_subparsers(dest="comando", required=True)

    pi = sub.add_parser("importar", help="importa o CSV do IPTU baixado da Prefeitura")
    pi.add_argument("csv", help="caminho do CSV (ex.: IPTU_2026.csv)")
    pi.set_defaults(func=cmd_importar)

    pc = sub.add_parser("consultar", help="lista os imóveis de um CEP")
    pc.add_argument("cep", help="CEP com ou sem traço")
    pc.add_argument("-n", "--numero", help="filtra pelo número do imóvel")
    pc.add_argument("-f", "--formato", choices=["texto", "json", "csv"], default="texto")
    pc.add_argument("--offline", action="store_true", help="não consulta a API de CEP")
    pc.set_defaults(func=cmd_consultar)

    pw = sub.add_parser("web", help="abre a tela no navegador")
    pw.add_argument("--porta", type=int, default=8765)
    pw.add_argument("--sem-navegador", action="store_true", help="não abre o navegador sozinho")
    pw.set_defaults(func=cmd_web)

    pp = sub.add_parser("publicar", help="gera o site estático para a Vercel")
    pp.add_argument("--destino", default=str(SITE_PADRAO), help=f"pasta do site (padrão: {SITE_PADRAO})")
    pp.set_defaults(func=cmd_publicar)

    pt = sub.add_parser("tudo", help="acha/baixa a base, importa, gera o site e publica na Vercel")
    pt.add_argument("--arquivo", help="CSV ou ZIP da base (se não informar, procura na pasta Downloads)")
    pt.add_argument("--url", help="link direto para o ZIP/CSV da base, se você tiver")
    pt.add_argument("--destino", default=str(SITE_PADRAO), help="pasta do site gerado")
    pt.add_argument("--sem-vercel", action="store_true", help="só gera o site, sem publicar")
    pt.set_defaults(func=cmd_tudo)

    args = p.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
