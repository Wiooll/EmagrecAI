#!/usr/bin/env python3
"""Gera data/taco.json a partir dos CSVs do repositório brolesi/taco (MIT).

Fonte dos valores: TACO, 4ª edição (NEPA/UNICAMP, 2011). Medidas caseiras: POF/IBGE.
Não faz parte do app em execução. Uso (na raiz do projeto):

    python scripts/gerar_taco.py

Os CSVs de origem ficam em scripts/fonte/ (veja o README para baixá-los de novo).
"""
import csv
import json
import sys
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
FONTE = RAIZ / "scripts" / "fonte"
SAIDA = RAIZ / "data" / "taco.json"
TRACO = 0.0  # a fonte grava "traço" como 1e-05; no app vira 0


def normaliza(s):
    s = unicodedata.normalize("NFD", s.lower())
    return " ".join("".join(c for c in s if not unicodedata.combining(c)).replace(",", " ").split())


def numero(txt):
    """Devolve float, ou None quando ausente ou inválido."""
    txt = (txt or "").strip()
    if not txt:
        return None
    try:
        v = float(txt)
    except ValueError:
        return None
    if v != v or v in (float("inf"), float("-inf")):
        return None
    return TRACO if v <= 1e-4 else v


def arredonda(v):
    r = round(v, 1)
    return int(r) if r == int(r) else r


def medidas_pof():
    """Mapa nome normalizado -> lista de (medida, gramas) da POF/IBGE."""
    mapa = {}
    with open(FONTE / "pof_medidas_caseiras.csv", encoding="utf-8", newline="") as f:
        for r in csv.DictReader(f):
            g = numero(r["quantidade_g"])
            medida = r["descricao_medida"].strip().lower()
            if not g or g <= 0 or g > 1000 or not medida or medida == "grama":
                continue
            mapa.setdefault(normaliza(r["descricao_alimento"]), []).append((medida, g))
    return mapa


def main():
    pof = medidas_pof()
    itens, nomes, descartados, com_medida = [], set(), [], 0
    with open(FONTE / "taco_composicao.csv", encoding="utf-8", newline="") as f:
        for r in csv.DictReader(f):
            nome = " ".join(r["descricao"].split())
            k, c, p, g = (numero(r[x]) for x in ("energia_kcal", "carboidrato_g", "proteina_g", "lipideos_g"))
            if not nome or None in (k, c, p, g):
                descartados.append((nome, "valor ausente"))
                continue
            if not (0 <= k <= 900 and all(0 <= m <= 100 for m in (c, p, g)) and c + p + g <= 105):
                descartados.append((nome, "fora da faixa"))
                continue
            if nome.lower() in nomes:
                descartados.append((nome, "nome repetido"))
                continue
            nomes.add(nome.lower())
            item = {"n": nome, "k": arredonda(k), "c": arredonda(c), "p": arredonda(p), "f": arredonda(g)}
            medidas = pof.get(normaliza(nome))
            if medidas and len(set(medidas)) == 1:  # só quando a correspondência é exata e sem ambiguidade
                m, gramas = medidas[0]
                item["u"] = [m, m, arredonda(gramas)]
                com_medida += 1
            itens.append(item)
    SAIDA.parent.mkdir(exist_ok=True)
    SAIDA.write_text(json.dumps(itens, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{len(itens)} itens gravados em {SAIDA} ({com_medida} com medida caseira)")
    for nome, motivo in descartados:
        print(f"  descartado: {nome} ({motivo})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
