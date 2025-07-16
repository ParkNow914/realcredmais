# Script para baixar logos dos bancos parceiros automaticamente
# Salve este arquivo em assets/images/bancos/ e execute com: python baixar_logos_bancos.py
# Requer: requests (instale com: pip install requests)

import os
import requests

# Lista de bancos e URLs confiáveis para logos (preferência Wikimedia Commons, logospng.org, etc)
bancos = [
    ("bmg", "https://upload.wikimedia.org/wikipedia/commons/8/8a/Banco_BMG_logo.png"),
    ("crefaz", "https://logospng.org/wp-content/uploads/crefaz.png"),
    ("facta", "https://logospng.org/wp-content/uploads/facta-financeira.png"),
    ("safra", "https://upload.wikimedia.org/wikipedia/commons/2/2d/Banco_Safra_logo.png"),
    ("brb", "https://logospng.org/wp-content/uploads/brb.png"),
    ("pan", "https://upload.wikimedia.org/wikipedia/commons/2/2a/Banco_Pan_logo.png"),
    ("ole", "https://logospng.org/wp-content/uploads/ole-consignado.png"),
    ("senff", "https://logospng.org/wp-content/uploads/senff.png"),
    ("banrisul", "https://upload.wikimedia.org/wikipedia/commons/2/2a/Banrisul_logo.png"),
    ("happy", ""),
    ("crefisa", "https://upload.wikimedia.org/wikipedia/commons/2/2a/Crefisa_logo.png"),
    ("itau", "https://logospng.org/wp-content/uploads/itau.png"),
    ("santander", "https://logospng.org/wp-content/uploads/santander.png"),
    ("pagbank", "https://logospng.org/wp-content/uploads/pagbank.png"),
    ("master", "https://logospng.org/wp-content/uploads/banco-master.png"),
    ("digio", "https://logospng.org/wp-content/uploads/digio.png"),
    ("nbc", ""),
    ("mercantil", "https://upload.wikimedia.org/wikipedia/commons/2/2a/Banco_Mercantil_do_Brasil_logo.png"),
    ("finanto", ""),
    ("sabemi", "https://logospng.org/wp-content/uploads/sabemi.png"),
    ("qualibank", ""),
    ("totalcash", "https://logospng.org/wp-content/uploads/total-cash.png"),
    ("parana", "https://logospng.org/wp-content/uploads/parana-banco.png"),
    ("inbursa", "https://logospng.org/wp-content/uploads/inbursa.png"),
    ("inter", "https://logospng.org/wp-content/uploads/banco-inter.png"),
    ("fintech_corban", ""),
    ("daycoval", "https://upload.wikimedia.org/wikipedia/commons/2/2a/Daycoval_logo.png"),
    ("c6", "https://upload.wikimedia.org/wikipedia/commons/2/2a/C6_Bank_logo.png"),
    ("paulista", "https://logospng.org/wp-content/uploads/paulista-banco.png"),
    ("quero_mais", ""),
    ("presenca", ""),
]

def baixar_logo(nome, url):
    if not url:
        print(f"[AVISO] Logo de {nome} não encontrado. Baixe manualmente se necessário.")
        return
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200:
            with open(f"{nome}.png", "wb") as f:
                f.write(resp.content)
            print(f"[OK] {nome}.png baixado com sucesso.")
        else:
            print(f"[ERRO] Não foi possível baixar {nome}: status {resp.status_code}")
    except Exception as e:
        print(f"[ERRO] Falha ao baixar {nome}: {e}")

if __name__ == "__main__":
    for nome, url in bancos:
        baixar_logo(nome, url)
    print("\nProcesso finalizado. Verifique os arquivos nesta pasta.") 