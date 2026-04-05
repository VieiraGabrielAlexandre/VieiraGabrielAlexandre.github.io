#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Importa HQs/Livros de um arquivo Excel para a API PHP.
- Lê colunas: Nome, Vol, Editora, Valor (sheet padrão: "Página1")
- Emite token em /auth/token com {"api_key": "..."} e usa Bearer nas chamadas
- Cria um item via POST /items para cada linha válida

Requisitos:
  pip install pandas requests openpyxl

Uso:
  python import_hqs.py --file "Controle de Quadrinhos.xlsx" \
    --api-base "http://localhost:8000" \
    --api-key "SUA_API_KEY" \
    --tipo hq
"""
import argparse
import json
import math
import sys
from typing import Optional

import pandas as pd
import requests


def get_token(api_base: str, api_key: str) -> str:
    url = f"{api_base.rstrip('/')}/auth/token"
    resp = requests.post(url, json={"api_key": api_key}, timeout=30)
    data = resp.json()
    if resp.status_code >= 400 or "access_token" not in data:
        raise RuntimeError(f"Falha ao obter token ({resp.status_code}): {data}")
    return data["access_token"]


def to_none(v):
    if v is None:
        return None
    if isinstance(v, float) and math.isnan(v):
        return None
    s = str(v).strip()
    if s in ("", "-", "nan", "NaN"):
        return None
    return s


def to_float_or_none(v) -> Optional[float]:
    v = to_none(v)
    if v is None:
        return None
    try:
        return float(str(v).replace(",", ".").strip())
    except Exception:
        return None


def post_item(api_base: str, token: str, payload: dict) -> requests.Response:
    url = f"{api_base.rstrip('/')}/items"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    return requests.post(url, headers=headers, data=json.dumps(payload), timeout=30)


def main():
    parser = argparse.ArgumentParser(description="Importar HQs/Livros de XLSX para API.")
    parser.add_argument("--file", required=True, help="Caminho do .xlsx")
    parser.add_argument("--api-base", default="http://localhost:8000", help="Base da API")
    parser.add_argument("--api-key", required=True, help="API Key para emitir token")
    parser.add_argument("--tipo", default="hq", choices=["hq", "livro"], help="Tipo padrão")
    parser.add_argument("--sheet", default="Página1", help="Nome da planilha (aba)")
    parser.add_argument("--dry-run", action="store_true", help="Só mostra, não envia")
    args = parser.parse_args()

    try:
        token = get_token(args.api_base, args.api_key)
    except Exception as e:
        print(f"[ERRO] Não foi possível obter token: {e}", file=sys.stderr)
        sys.exit(2)

    df = pd.read_excel(args.file, sheet_name=args.sheet)
    expected = ["Nome", "Vol", "Editora", "Valor"]
    for col in expected:
        if col not in df.columns:
            print(f"[ERRO] Coluna ausente no Excel: {col}", file=sys.stderr)
            sys.exit(4)

    ok, fail, skipped = 0, 0, 0

    for idx, row in df.iterrows():
        nome = to_none(row.get("Nome"))
        if not nome:
            skipped += 1
            continue

        payload = {
            "tipo": args.tipo,
            "nome": nome,
            "volume": to_none(row.get("Vol")),
            "editora": to_none(row.get("Editora")),
            "valor": to_float_or_none(row.get("Valor")),
        }

        if args.dry_run:
            print(f"[DRY-RUN] {payload}")
            ok += 1
            continue

        try:
            resp = post_item(args.api_base, token, payload)
            if resp.status_code in (200, 201):
                ok += 1
            else:
                fail += 1
                print(f"[FALHA] linha {idx+2} HTTP {resp.status_code} -> {resp.text}", file=sys.stderr)
        except Exception as e:
            fail += 1
            print(f"[ERRO] linha {idx+2}: {e}", file=sys.stderr)

    print(json.dumps({"enviados_ok": ok, "falhas": fail, "ignorados": skipped}, ensure_ascii=False))


if __name__ == "__main__":
    main()
