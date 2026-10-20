import gzip
import io
import json
import os
import subprocess
import zipfile
import sqlite3
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import mock

from iptu_cep import __main__ as cli
from iptu_cep import automatico, backup, base, cep, fonte, publicar, web

AMOSTRA = Path(__file__).parent / "fixtures" / "iptu_amostra.csv"
ITANHAEM = Path(__file__).parent / "fixtures" / "itanhaem_amostra.csv"
CNEFE = Path(__file__).parent / "fixtures" / "cnefe_itanhaem.csv"


def _xlsx(caminho: Path, linhas: list[list]) -> None:
    """Gera um .xlsx mínimo (texto em sharedStrings, números como número)."""
    textos, xml_linhas = [], []
    for r, linha in enumerate(linhas, 1):
        celulas = []
        for c, v in enumerate(linha):
            ref = chr(65 + c) + str(r)
            if isinstance(v, (int, float)):
                celulas.append(f'<c r="{ref}"><v>{v}</v></c>')
            elif v != "":
                textos.append(v)
                celulas.append(f'<c r="{ref}" t="s"><v>{len(textos) - 1}</v></c>')
        xml_linhas.append(f'<row r="{r}">{"".join(celulas)}</row>')
    ns = 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"'
    from xml.sax.saxutils import escape
    with zipfile.ZipFile(caminho, "w") as z:
        z.writestr("xl/sharedStrings.xml", f'<sst {ns}>' + "".join(f"<si><t>{escape(t)}</t></si>" for t in textos) + "</sst>")
        z.writestr("xl/worksheets/sheet1.xml", f'<worksheet {ns}><sheetData>{"".join(xml_linhas)}</sheetData></worksheet>')


class TestCep(unittest.TestCase):
    def test_normaliza(self):
        self.assertEqual(cep.normalizar_cep("01310-100"), "01310100")
        self.assertEqual(cep.normalizar_cep("1305000"), "01305000")
        self.assertEqual(cep.formatar_cep("01310100"), "01310-100")

    def test_invalido(self):
        with self.assertRaises(cep.CepInvalido):
            cep.normalizar_cep("123456789")
        with self.assertRaises(cep.CepInvalido):
            cep.normalizar_cep("")

    def test_fallback_brasilapi(self):
        def falso(url):
            if "viacep" in url:
                raise OSError("sem rede")
            return {"street": "Avenida Paulista", "neighborhood": "Bela Vista", "city": "São Paulo", "state": "SP"}

        with mock.patch.object(cep, "_get_json", side_effect=falso):
            e = cep.buscar_endereco("01310-100")
        self.assertEqual(e.fonte, "BrasilAPI")
        self.assertEqual(e.logradouro, "Avenida Paulista")

    def test_nao_encontrado(self):
        with mock.patch.object(cep, "_get_json", return_value={"erro": True}):
            with self.assertRaises(cep.CepNaoEncontrado):
                cep.buscar_endereco("99999999")


class TestBase(unittest.TestCase):
    def setUp(self):
        self.tmp = TemporaryDirectory()
        self.db = Path(self.tmp.name) / "iptu.sqlite"
        self.total = base.importar_csv(AMOSTRA, self.db, cidade="sao-paulo")

    def tearDown(self):
        self.tmp.cleanup()

    def test_importa_e_descarta_linha_sem_cep(self):
        self.assertEqual(self.total, 4)

    def test_nao_guarda_nome_de_pessoa(self):
        con = sqlite3.connect(self.db)
        conteudo = " ".join(str(v) for linha in con.execute("SELECT * FROM imoveis") for v in linha)
        con.close()
        for nome in ("FULANO", "FULANA", "CICLANO", "BELTRANO"):
            self.assertNotIn(nome, conteudo)

    def test_consulta_por_cep_e_numero(self):
        todos = base.consultar(self.db, "01310100")
        self.assertEqual(len(todos), 3)
        so_1000 = base.consultar(self.db, "01310-100", numero="1000")
        self.assertEqual(len(so_1000), 2)  # "01000" e "1000" são o mesmo número
        self.assertEqual(base.consultar(self.db, "01310100", numero="7"), [])

    def test_cep_sem_zero_a_esquerda_e_acentos(self):
        [imovel] = base.consultar(self.db, "01305-000")
        self.assertEqual(imovel.bairro, "CONSOLAÇÃO")
        self.assertEqual(imovel.area_terreno, 300.0)

    def test_valor_venal_estimado(self):
        apto = next(i for i in base.consultar(self.db, "01310100") if i.sql == "0100010001-1")
        # 2000 × 15000 × 0,025 + 120 × 3200,50 × 0,80
        self.assertAlmostEqual(apto.valor_venal_estimado, 750000 + 307248, places=2)

    def test_base_ausente(self):
        with self.assertRaises(FileNotFoundError):
            base.consultar(Path(self.tmp.name) / "nao_existe.sqlite", "01310100")

    def test_csv_sem_cep(self):
        ruim = Path(self.tmp.name) / "ruim.csv"
        ruim.write_text("a;b\n1;2\n", encoding="utf-8")
        with self.assertRaises(ValueError):
            base.importar_csv(ruim, Path(self.tmp.name) / "x.sqlite")


class TestCli(unittest.TestCase):
    def setUp(self):
        self.tmp = TemporaryDirectory()
        self.db = str(Path(self.tmp.name) / "iptu.sqlite")
        base.importar_csv(AMOSTRA, self.db, cidade="sao-paulo")

    def tearDown(self):
        self.tmp.cleanup()

    def _rodar(self, *args):
        out = io.StringIO()
        with redirect_stdout(out):
            codigo = cli.main(["--db", self.db, *args])
        return codigo, out.getvalue()

    def test_texto_offline(self):
        codigo, saida = self._rodar("consultar", "01310-100", "--offline")
        self.assertEqual(codigo, 0)
        self.assertIn("3 imóvel(is)", saida)
        self.assertIn("0100010001-1", saida)
        self.assertIn("R$ 1.057.248,00", saida)

    def test_json_com_endereco(self):
        end = cep.Endereco("01310100", "Avenida Paulista", "Bela Vista", "São Paulo", "SP", "3550308", "ViaCEP")
        with mock.patch.object(cep, "buscar_endereco", return_value=end):
            codigo, saida = self._rodar("consultar", "01310100", "-f", "json")
        dados = json.loads(saida)
        self.assertEqual(codigo, 0)
        self.assertEqual(dados["total"], 3)
        self.assertEqual(dados["endereco"]["cidade"], "São Paulo")

    def test_cidade_fora_de_sp(self):
        end = cep.Endereco("20040002", "Rua X", "Centro", "Rio de Janeiro", "RJ", "3304557", "ViaCEP")
        with mock.patch.object(cep, "buscar_endereco", return_value=end):
            codigo, _ = self._rodar("consultar", "20040-002")
        self.assertEqual(codigo, 1)

    def test_sem_resultado(self):
        codigo, saida = self._rodar("consultar", "04538-133", "--offline")
        self.assertEqual(codigo, 1)
        self.assertIn("Nenhum imóvel", saida)


class TestWeb(unittest.TestCase):
    def setUp(self):
        self.tmp = TemporaryDirectory()
        self.db = Path(self.tmp.name) / "iptu.sqlite"
        base.importar_csv(AMOSTRA, self.db, cidade="sao-paulo")

    def tearDown(self):
        self.tmp.cleanup()

    def test_lista_com_categorias_e_sem_numero(self):
        def sem_rede(_):
            raise ConnectionError("offline")

        codigo, dados = web.consultar_cep(self.db, "01310-100", buscar_endereco=sem_rede)
        self.assertEqual(codigo, 200)
        self.assertIsNotNone(dados["aviso"])
        por_sql = {i["sql"]: i for i in dados["imoveis"]}
        self.assertEqual(por_sql["0100010003-7"]["categoria"], "terreno")
        self.assertTrue(por_sql["0100010003-7"]["sem_numero"])
        self.assertEqual(por_sql["0100010001-1"]["categoria"], "apartamento")
        self.assertFalse(por_sql["0100010001-1"]["sem_numero"])
        self.assertIn("debitos", dados["links"])

    def test_erros(self):
        self.assertEqual(web.consultar_cep(self.db, "123")[0], 400)
        rio = cep.Endereco("20040002", "Rua X", "Centro", "Rio de Janeiro", "RJ", "3304557", "ViaCEP")
        self.assertEqual(web.consultar_cep(self.db, "20040002", buscar_endereco=lambda _: rio)[0], 422)
        sem_base = Path(self.tmp.name) / "nada.sqlite"
        self.assertEqual(web.consultar_cep(sem_base, "01310100", buscar_endereco=lambda _: None)[0], 409)

    def test_status(self):
        self.assertEqual(web._status(self.db)["total"], 4)
        self.assertFalse(web._status(Path(self.tmp.name) / "nada.sqlite")["importada"])


class TestPublicar(unittest.TestCase):
    def test_gera_site(self):
        with TemporaryDirectory() as tmp:
            db, site = Path(tmp) / "iptu.sqlite", Path(tmp) / "site"
            base.importar_csv(AMOSTRA, db, cidade="sao-paulo")
            r = publicar.publicar(db, site)
            self.assertEqual(r["imoveis"], 4)
            self.assertEqual(sorted(p.name for p in (site / "dados").iterdir()), ["01305.bin", "01310.bin"])
            for nome in ("index.html", "vercel.json", "meta.json"):
                self.assertTrue((site / nome).is_file())
            meta = json.loads((site / "meta.json").read_text(encoding="utf-8"))
            self.assertEqual((meta["modo"], meta["total"], meta["exercicio"]), ("estatico", 4, "2026"))

            bloco = json.loads(gzip.decompress((site / "dados" / "01310.bin").read_bytes()))
            linhas = bloco["ceps"]["01310100"]
            self.assertEqual(len(linhas), 3)
            terreno = dict(zip(bloco["campos"], next(l for l in linhas if l[0] == "0100010003-7")))
            self.assertEqual(terreno["categoria"], "terreno")
            self.assertTrue(terreno["sem_numero"])
            self.assertNotIn("FULANA", json.dumps(bloco))

    def test_sem_base(self):
        with TemporaryDirectory() as tmp:
            with self.assertRaises(FileNotFoundError):
                publicar.publicar(Path(tmp) / "nada.sqlite", Path(tmp) / "site")


class TestAutomatico(unittest.TestCase):
    def setUp(self):
        self.tmp = TemporaryDirectory()
        self.pasta = Path(self.tmp.name)

    def tearDown(self):
        self.tmp.cleanup()

    def test_procura_o_mais_recente(self):
        velho, novo = self.pasta / "IPTU_2025.zip", self.pasta / "iptu_2026.CSV"
        velho.write_text("x"); novo.write_text("x"); (self.pasta / "outro.csv").write_text("x")
        os.utime(velho, (1000, 1000))
        self.assertEqual(automatico.procurar_base(self.pasta), novo)
        self.assertIsNone(automatico.procurar_base(self.pasta, desde=novo.stat().st_mtime + 10))
        self.assertIsNone(automatico.procurar_base(self.pasta / "nao_existe"))

    def test_prefere_o_ano_mais_novo(self):
        a2026, a2025 = self.pasta / "IPTU_2026.zip", self.pasta / "IPTU_2025.zip"
        a2026.write_text("x"); a2025.write_text("x")
        os.utime(a2026, (1000, 1000))  # 2025 foi baixado depois
        self.assertEqual(automatico.procurar_base(self.pasta), a2026)

    def test_extrai_maior_csv_do_zip(self):
        z = self.pasta / "IPTU_2026.zip"
        with zipfile.ZipFile(z, "w") as zf:
            zf.writestr("leia-me.csv", "a;b\n")
            zf.write(AMOSTRA, "pasta/IPTU_2026.csv")
        csv_path = automatico.preparar_csv(z, self.pasta / "trabalho")
        self.assertEqual(csv_path.name, "IPTU_2026.csv")
        self.assertEqual(base.importar_csv(csv_path, self.pasta / "db.sqlite", cidade="sao-paulo"), 4)

    def test_zip_sem_csv(self):
        z = self.pasta / "IPTU.zip"
        with zipfile.ZipFile(z, "w") as zf:
            zf.writestr("x.txt", "oi")
        with self.assertRaises(ValueError):
            automatico.preparar_csv(z, self.pasta)

    def test_espera_download_terminar(self):
        parcial = self.pasta / "IPTU_2026.zip.crdownload"
        parcial.write_text("x")
        final = self.pasta / "IPTU_2026.zip"
        chamadas = {"n": 0}

        def dormir(_):
            chamadas["n"] += 1
            if chamadas["n"] == 2:  # o navegador termina o download
                parcial.rename(final)

        with mock.patch.object(automatico.time, "sleep", side_effect=dormir):
            self.assertEqual(automatico.esperar_download(self.pasta, desde=0, intervalo_s=0), final)

    def test_url_publica_da_saida_da_vercel(self):
        saida = ("Inspect: https://vercel.com/fulano/iptu-cep/abc\n"
                 "Production: https://iptu-cep-x1y2z3-fulano.vercel.app [3s]\n"
                 "Aliased: https://iptu-cep.vercel.app [3s]\n")
        self.assertEqual(automatico.extrair_url_publica(saida), "https://iptu-cep.vercel.app")
        self.assertEqual(automatico.extrair_url_publica("https://iptu-cep-abc-fulano.vercel.app\n"),
                         "https://iptu-cep-abc-fulano.vercel.app")
        self.assertIsNone(automatico.extrair_url_publica("erro"))

    def test_publicar_vercel_faz_login_se_preciso(self):
        chamadas = []

        def executar(cmd, **kw):
            chamadas.append(cmd[-1])
            return subprocess.CompletedProcess(cmd, 1 if cmd[-1] == "whoami" else 0)

        class Proc:
            stdout = iter(["Production: https://iptu-cep-q-fulano.vercel.app\n", "Aliased: https://iptu-cep.vercel.app\n"])
            def wait(self):
                return 0

        with mock.patch.object(automatico, "_npx", return_value="npx"), redirect_stdout(io.StringIO()):
            url = automatico.publicar_vercel(self.pasta, executar=executar, popen=lambda *a, **k: Proc())
        self.assertEqual(chamadas, ["whoami", "login"])
        self.assertEqual(url, "https://iptu-cep.vercel.app")

    def test_tudo_sem_vercel(self):
        downloads = self.pasta / "Downloads"
        downloads.mkdir()
        shutil_copy = (downloads / "IPTU_2026.csv")
        shutil_copy.write_bytes(AMOSTRA.read_bytes())
        db, site = self.pasta / "dados" / "iptu.sqlite", self.pasta / "site" / "iptu-cep"
        with mock.patch.object(automatico, "pasta_downloads", return_value=downloads), redirect_stdout(io.StringIO()):
            self.assertIsNone(automatico.tudo(db, site, publicar_online=False, cidade="sao-paulo"))
        self.assertTrue((site / "dados" / "01310.bin").is_file())


    def test_local_importa_so_na_primeira_vez(self):
        downloads = self.pasta / "Downloads"
        downloads.mkdir()
        (downloads / "IPTU_2026.csv").write_bytes(AMOSTRA.read_bytes())
        db = self.pasta / "dados" / "iptu.sqlite"
        servidas = []
        servir = lambda db, porta, abrir: servidas.append((db, porta, abrir))
        with mock.patch.object(automatico, "pasta_downloads", return_value=downloads), redirect_stdout(io.StringIO()):
            with mock.patch.object(automatico, "obter_e_importar", wraps=automatico.obter_e_importar) as imp:
                automatico.local(db, abrir_navegador=False, servir=servir, cidade="sao-paulo")
                automatico.local(db, abrir_navegador=False, servir=servir, cidade="sao-paulo")
                self.assertEqual(imp.call_count, 1)
                automatico.local(db, atualizar=True, abrir_navegador=False, servir=servir, cidade="sao-paulo")
                self.assertEqual(imp.call_count, 2)
        self.assertEqual(servidas, [(db, 8765, False)] * 3)
        self.assertEqual(web._status(db)["total"], 4)


class TestFonte(unittest.TestCase):
    def test_links_nas_paginas(self):
        pagina = ('<a href="downloadArquivo.aspx?orig=DownloadCadastro&amp;arq=IPTU%5CIPTU_2025.zip&amp;arqTipo=CADASTRO">2025</a>'
                  '<a href="/x/IPTU_2026.zip">2026</a><a href="/x/outra.zip">x</a>')
        achados = fonte.links_nas_paginas(["https://download.geosampa.prefeitura.sp.gov.br/PaginasPublicas/"], ler=lambda _: pagina)
        self.assertEqual(sorted(a for a, _ in achados), [2025, 2026])
        self.assertIn(("https://download.geosampa.prefeitura.sp.gov.br/PaginasPublicas/downloadArquivo.aspx"
                       "?orig=DownloadCadastro&arq=IPTU%5CIPTU_2025.zip&arqTipo=CADASTRO"), [u for _, u in achados])

    def test_links_nos_metadados(self):
        xml = ("<gmd:linkage><gmd:URL>https://download.geosampa.prefeitura.sp.gov.br/PaginasPublicas/"
               "downloadArquivo.aspx?orig=DownloadIPTU&amp;arq=IPTU_2025.zip</gmd:URL></gmd:linkage>")
        achados = fonte.links_nos_metadados(["abc"], ler=lambda _: xml)
        self.assertEqual(achados, [(2025, "https://download.geosampa.prefeitura.sp.gov.br/PaginasPublicas/"
                                          "downloadArquivo.aspx?orig=DownloadIPTU&arq=IPTU_2025.zip")])

    def test_diagnostico_nao_quebra_sem_rede(self):
        def falha(_):
            raise OSError("sem rede")
        saida = []
        with mock.patch.object(fonte, "candidatos", return_value=[]):
            fonte.diagnostico(ler=falha, avisar=saida.append)
        self.assertTrue(any("falhou" in l for l in saida))

    def test_nao_confunde_parametro_com_ano(self):
        pagina = '<a href="http://www.prefeitura.sp.gov.br/servicos/iptu/index.php?p=2453">IPTU</a>'
        self.assertEqual(fonte.links_nas_paginas(["https://x.sp.gov.br/"], ler=lambda _: pagina), [])

    def test_links_no_ckan(self):
        resposta = json.dumps({"result": {"results": [{"resources": [
            {"name": "IPTU 2025", "format": "ZIP", "url": "https://dados.exemplo/iptu_2025.zip"},
            {"name": "Dicionário", "format": "PDF", "url": "https://dados.exemplo/dic.pdf"},
        ]}]}})
        self.assertEqual(fonte.links_no_ckan(ler=lambda _: resposta), [(2025, "https://dados.exemplo/iptu_2025.zip")])
        self.assertEqual(fonte.links_no_ckan(ler=lambda _: "não é json"), [])

    def test_links_montados(self):
        from datetime import date
        links = fonte.links_montados(date(2026, 3, 1))
        self.assertEqual({a for a, _ in links}, {2024, 2025, 2026})
        self.assertTrue(all(u.startswith(fonte.GEOSAMPA_DL) for _, u in links))

    def test_baixar_aceita_so_a_base(self):
        import threading
        from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w") as zf:
            zf.write(AMOSTRA, "IPTU_2026.csv")
        conteudos = {"/zip": buf.getvalue(), "/html": b"<html>Pagina de erro</html>", "/csv": AMOSTRA.read_bytes()}

        class H(BaseHTTPRequestHandler):
            def log_message(self, *a):
                pass

            def do_GET(self):
                corpo = conteudos.get(self.path)
                self.send_response(200 if corpo else 404)
                self.send_header("Content-Length", str(len(corpo or b"")))
                self.end_headers()
                self.wfile.write(corpo or b"")

        srv = ThreadingHTTPServer(("127.0.0.1", 0), H)
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{srv.server_address[1]}"
        try:
            with TemporaryDirectory() as tmp:
                pasta = Path(tmp)
                self.assertIsNone(fonte.baixar(url + "/html", pasta, "IPTU_2026"))
                self.assertIsNone(fonte.baixar(url + "/nada", pasta, "IPTU_2026"))
                z = fonte.baixar(url + "/zip", pasta, "IPTU_2026")
                self.assertEqual(z.name, "IPTU_2026.zip")
                c = fonte.baixar(url + "/csv", pasta, "IPTU_2025")
                self.assertEqual(c.suffix, ".csv")
                self.assertEqual(sorted(p.name for p in pasta.iterdir()), ["IPTU_2025.csv", "IPTU_2026.zip"])
                with mock.patch.object(fonte, "candidatos", return_value=[(2026, url + "/html"), (2026, url + "/zip")]):
                    self.assertEqual(fonte.baixar_automatico(pasta / "auto", avisar=lambda *_: None).name, "IPTU_2026.zip")
        finally:
            srv.shutdown()
            srv.server_close()


class TestBackup(unittest.TestCase):
    def test_backup_e_restauracao(self):
        with TemporaryDirectory() as tmp:
            tmp = Path(tmp)
            db = tmp / "dados" / "iptu.sqlite"
            db.parent.mkdir()
            base.importar_csv(AMOSTRA, db, cidade="sao-paulo")
            arquivo = backup.fazer_backup(db, tmp / "IPTU-backup")
            self.assertTrue(arquivo.name.startswith("iptu-backup-") and arquivo.suffix == ".zip")
            self.assertEqual([p.suffix for p in arquivo.parent.iterdir()], [".zip"])  # sem cópia solta
            novo = tmp / "outro" / "iptu.sqlite"
            self.assertEqual(backup.restaurar_backup(arquivo, novo), 4)
            self.assertEqual(len(base.consultar(novo, "01310100")), 3)

    def test_erros(self):
        with TemporaryDirectory() as tmp:
            tmp = Path(tmp)
            with self.assertRaises(FileNotFoundError):
                backup.fazer_backup(tmp / "nada.sqlite", tmp)
            falso = tmp / "x.zip"
            with zipfile.ZipFile(falso, "w") as z:
                z.writestr("leia.txt", "oi")
            with self.assertRaises(ValueError):
                backup.restaurar_backup(falso, tmp / "db.sqlite")


class TestItanhaem(unittest.TestCase):
    def setUp(self):
        self.tmp = TemporaryDirectory()
        self.pasta = Path(self.tmp.name)
        self.db = self.pasta / "iptu.sqlite"

    def tearDown(self):
        self.tmp.cleanup()

    def test_importa_planilha_de_itanhaem(self):
        self.assertEqual(base.importar_csv(ITANHAEM, self.db), 3)  # Itanhaém é o padrão
        meta = base.ler_meta(self.db)
        self.assertEqual((meta["cidade"], meta["exercicio"], meta["fora_da_cidade"]), ("itanhaem", "2026", "0"))
        casa, terreno = sorted(base.consultar(self.db, "11740-000"), key=lambda i: i.lote)
        self.assertEqual(casa.endereco, "AV PRESIDENTE VARGAS, 350 (Qd 12 Lt 5)")
        self.assertEqual(terreno.endereco, "AV PRESIDENTE VARGAS, s/n (Qd 12 Lt 6)")
        self.assertEqual(casa.loteamento, "JARDIM SUARAO")
        self.assertEqual(casa.valor_venal_estimado, 185400.0)  # valor da Prefeitura, não estimativa
        self.assertEqual(web.classificar(terreno), "terreno")

    def test_nao_guarda_dados_do_proprietario(self):
        base.importar_csv(ITANHAEM, self.db)
        con = sqlite3.connect(self.db)
        tudo = " ".join(str(v) for l in con.execute("SELECT * FROM imoveis") for v in l)
        con.close()
        for proibido in ("JOSE DA SILVA", "123.456.789-00", "EMPRESA LTDA", "RUA X 10", "01310"):
            self.assertNotIn(proibido, tudo)

    def test_planilha_excel(self):
        xlsx = self.pasta / "cadastro_itanhaem.xlsx"
        _xlsx(xlsx, [
            ["Inscrição", "Proprietário", "Logradouro", "Número", "Loteamento", "Quadra", "Lote", "CEP", "Área do Terreno", "Valor Venal"],
            ["03.001.0001.001", "FULANO", "RUA DAS PALMEIRAS", 45, "BALNEARIO GAIVOTA", "B", "7", 11749000, 250.5, 98000],
            ["03.001.0002.001", "CICLANO", "RUA DAS PALMEIRAS", "", "BALNEARIO GAIVOTA", "B", "8", "11749-000", 250, 52000.75],
        ])
        self.assertEqual(base.importar_csv(xlsx, self.db), 2)
        imoveis = base.consultar(self.db, "11749000")
        self.assertEqual([i.numero for i in imoveis], ["", "45"])
        self.assertEqual(imoveis[0].endereco, "RUA DAS PALMEIRAS, s/n (Qd B Lt 8)")
        self.assertEqual(imoveis[0].valor_venal_estimado, 52000.75)
        self.assertEqual(imoveis[1].area_terreno, 250.5)

    def test_web_usa_cidade_e_links_de_itanhaem(self):
        base.importar_csv(ITANHAEM, self.db)
        itanhaem = cep.Endereco("11740000", "Avenida Presidente Vargas", "Suarão", "Itanhaém", "SP", "3522109", "ViaCEP")
        codigo, dados = web.consultar_cep(self.db, "11740-000", buscar_endereco=lambda _: itanhaem)
        self.assertEqual((codigo, dados["total"], dados["cidade"]["nome"]), (200, 2, "Itanhaém"))
        self.assertIn("itanhaem.sp.gov.br", dados["links"]["debitos"])
        self.assertTrue(dados["imoveis"][0]["valor_venal_oficial"])
        sp = cep.Endereco("01310100", "Av Paulista", "Bela Vista", "São Paulo", "SP", "3550308", "ViaCEP")
        codigo, dados = web.consultar_cep(self.db, "01310-100", buscar_endereco=lambda _: sp)
        self.assertEqual(codigo, 422)
        self.assertIn("Itanhaém", dados["erro"])
        self.assertEqual(web._status(self.db)["cidade"]["rotulo_inscricao"], "Nº do cadastro (inscrição)")

    def test_avisa_planilha_de_outra_cidade(self):
        base.importar_csv(AMOSTRA, self.db)  # dados de São Paulo importados como Itanhaém
        saida = io.StringIO()
        with redirect_stdout(saida):
            automatico.avisar_cidade(self.db)
        self.assertIn("fora de Itanhaém", saida.getvalue())

    def test_sem_planilha_explica_como_obter(self):
        vazia = self.pasta / "Downloads"
        vazia.mkdir()
        with mock.patch.object(automatico, "pasta_downloads", return_value=vazia), \
                mock.patch.object(automatico, "baixar_cnefe", return_value=None), redirect_stdout(io.StringIO()):
            with self.assertRaises(FileNotFoundError) as erro:
                automatico.obter_e_importar(self.db)
        self.assertIn("PEDIDO_SIC_ITANHAEM.md", str(erro.exception))

    def test_ignora_iptu_da_capital_na_pasta(self):
        downloads = self.pasta / "Downloads"
        downloads.mkdir()
        (downloads / "IPTU_2025.zip").write_text("x")  # base da capital
        with mock.patch.object(automatico, "pasta_downloads", return_value=downloads), \
                mock.patch.object(automatico, "baixar_cnefe", return_value=None), redirect_stdout(io.StringIO()):
            with self.assertRaises(FileNotFoundError):
                automatico.obter_e_importar(self.db)
            (downloads / "cadastro_itanhaem.csv").write_bytes(ITANHAEM.read_bytes())
            with redirect_stdout(io.StringIO()):
                self.assertEqual(automatico.obter_e_importar(self.db), 3)

    def test_site_estatico_de_itanhaem(self):
        base.importar_csv(ITANHAEM, self.db)
        site = self.pasta / "site"
        publicar.publicar(self.db, site)
        meta = json.loads((site / "meta.json").read_text(encoding="utf-8"))
        self.assertEqual((meta["cidade"]["nome"], meta["cidade"]["ibge"]), ("Itanhaém", "3522109"))
        bloco = json.loads(gzip.decompress((site / "dados" / "11740.bin").read_bytes()))
        self.assertEqual(sorted(bloco["ceps"]), ["11740000", "11740005"])
        self.assertIn("loteamento", bloco["campos"])


class TestCnefe(unittest.TestCase):
    def setUp(self):
        self.tmp = TemporaryDirectory()
        self.pasta = Path(self.tmp.name)
        self.db = self.pasta / "iptu.sqlite"

    def tearDown(self):
        self.tmp.cleanup()

    def test_importa_enderecos_do_ibge(self):
        self.assertEqual(base.importar_csv(CNEFE, self.db), 4)  # o de São Paulo é descartado
        meta = base.ler_meta(self.db)
        self.assertEqual((meta["fonte"], meta["fora_da_cidade"]), ("cnefe", "1"))
        construcao, casa, apto = base.consultar(self.db, "11740-000")
        self.assertEqual((casa.endereco, casa.uso, casa.sql), ("AVENIDA PRESIDENTE VARGAS, 350", "Casa", ""))
        self.assertEqual(construcao.endereco, "AVENIDA PRESIDENTE VARGAS, s/n")
        self.assertEqual(construcao.uso, "Edificação em construção ou reforma")
        self.assertEqual(apto.endereco, "AVENIDA PRESIDENTE VARGAS, 400 - APARTAMENTO 12 BLOCO B")
        self.assertEqual(web.classificar(apto), "apartamento")
        self.assertEqual(web.classificar(casa), "casa")
        self.assertEqual((casa.latitude, casa.longitude), (-24.1951, -46.7882))
        [loja] = base.consultar(self.db, "11740-005")
        self.assertEqual((loja.uso, web.classificar(loja)), ("Estabelecimento comercial/serviços: PADARIA BOM PAO", "comercial"))
        self.assertIsNone(loja.valor_venal_estimado)

    def test_status_e_consulta_indicam_fonte(self):
        base.importar_csv(CNEFE, self.db)
        self.assertEqual(web._status(self.db)["fonte"], "cnefe")
        itanhaem = cep.Endereco("11740000", "Avenida Presidente Vargas", "Suarão", "Itanhaém", "SP", "3522109", "ViaCEP")
        codigo, dados = web.consultar_cep(self.db, "11740000", buscar_endereco=lambda _: itanhaem)
        self.assertEqual((codigo, dados["total"], dados["fonte"]), (200, 3, "cnefe"))

    def test_zip_do_ibge_na_pasta_downloads(self):
        downloads = self.pasta / "Downloads"
        downloads.mkdir()
        with zipfile.ZipFile(downloads / "3522109_ITANHAEM.zip", "w") as z:
            z.write(CNEFE, "3522109_ITANHAEM.csv")
        with mock.patch.object(automatico, "pasta_downloads", return_value=downloads), \
                mock.patch.object(automatico, "baixar_cnefe", side_effect=AssertionError("não deveria baixar")), \
                redirect_stdout(io.StringIO()):
            self.assertEqual(automatico.obter_e_importar(self.db), 4)
            # a planilha da Prefeitura tem prioridade sobre os endereços do IBGE
            (downloads / "cadastro_itanhaem.csv").write_bytes(ITANHAEM.read_bytes())
            self.assertEqual(automatico.obter_e_importar(self.db), 3)
        self.assertEqual(base.ler_meta(self.db)["fonte"], "prefeitura")

    def test_baixa_do_ibge_quando_nao_ha_nada(self):
        baixado = self.pasta / "dados" / "cnefe_3522109.zip"
        baixado.parent.mkdir()
        with zipfile.ZipFile(baixado, "w") as z:
            z.write(CNEFE, "3522109_ITANHAEM.csv")
        with mock.patch.object(automatico, "procurar_base", return_value=None), \
                mock.patch.object(automatico, "baixar_cnefe", return_value=baixado) as baixar, \
                redirect_stdout(io.StringIO()):
            self.assertEqual(automatico.obter_e_importar(self.pasta / "dados" / "iptu.sqlite"), 4)
        baixar.assert_called_once()

    def test_links_cnefe_pela_listagem(self):
        listagem = '<a href="3522000_ITAI.zip">x</a><a href="3522109_ITANHAEM.zip">3522109_ITANHAEM.zip</a>'
        links = fonte.links_cnefe("3522109", "35_SP", ler=lambda url: listagem if url.endswith("35_SP/") else "")
        self.assertEqual(links, [fonte.CNEFE_RAIZ + "CSV/Municipio/35_SP/3522109_ITANHAEM.zip"])
        self.assertEqual(fonte.links_cnefe("3522109", "35_SP", ler=lambda url: ""), [])


if __name__ == "__main__":
    unittest.main()
