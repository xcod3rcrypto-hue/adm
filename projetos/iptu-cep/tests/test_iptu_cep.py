import gzip
import io
import json
import sqlite3
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import mock

from iptu_cep import __main__ as cli
from iptu_cep import base, cep, publicar, web

AMOSTRA = Path(__file__).parent / "fixtures" / "iptu_amostra.csv"


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
        self.total = base.importar_csv(AMOSTRA, self.db)

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
        base.importar_csv(AMOSTRA, self.db)

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
        base.importar_csv(AMOSTRA, self.db)

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
            base.importar_csv(AMOSTRA, db)
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


if __name__ == "__main__":
    unittest.main()
