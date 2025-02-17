from PIL import Image
import os

# Lista de formatos suportados
FORMATOS_SUPORTADOS = {
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.ico'
}

def redimensionar_logo(caminho_entrada, caminho_saida, largura_max=550, altura_max=150):
    try:
        # Abrir a imagem
        print(f"Processando: {caminho_entrada}")
        imagem = Image.open(caminho_entrada)

        # Converter para RGB se necessário (alguns formatos como PNG podem ter canal alfa)
        if imagem.mode in ('RGBA', 'P'):
            imagem = imagem.convert('RGB')

        # Calcular novas dimensões mantendo a proporção
        largura_original, altura_original = imagem.size
        razao = min(largura_max / largura_original, altura_max / altura_original)
        nova_largura = int(largura_original * razao)
        nova_altura = int(altura_original * razao)

        # Redimensionar a imagem
        imagem_redimensionada = imagem.resize((nova_largura, nova_altura), Image.LANCZOS)

        # Determinar o formato de saída
        formato_saida = os.path.splitext(caminho_entrada)[1].lower()
        if formato_saida not in FORMATOS_SUPORTADOS:
            formato_saida = '.png'  # Formato padrão caso o original não seja suportado

        # Salvar a imagem no mesmo formato da entrada (ou PNG como fallback)
        if formato_saida == '.jpg' or formato_saida == '.jpeg':
            imagem_redimensionada.save(caminho_saida, 'JPEG', quality=95)
        elif formato_saida == '.png':
            imagem_redimensionada.save(caminho_saida, 'PNG')
        elif formato_saida == '.gif':
            imagem_redimensionada.save(caminho_saida, 'GIF')
        elif formato_saida == '.bmp':
            imagem_redimensionada.save(caminho_saida, 'BMP')
        elif formato_saida == '.webp':
            imagem_redimensionada.save(caminho_saida, 'WEBP', quality=95)
        elif formato_saida == '.tiff':
            imagem_redimensionada.save(caminho_saida, 'TIFF')
        elif formato_saida == '.ico':
            imagem_redimensionada.save(caminho_saida, 'ICO')

        print(f"Imagem redimensionada e salva com sucesso: {caminho_saida}")
        print(f"Formato original: {formato_saida}")
        print(f"Dimensões originais: {largura_original}x{altura_original}")
        print(f"Novas dimensões: {nova_largura}x{nova_altura}")

    except Exception as e:
        print(f"Erro ao processar {caminho_entrada}: {str(e)}")

def processar_arquivos():
    pasta_entrada = "logos_originais"
    pasta_saida = "logos_processadas"

    # Criar pasta de saída se não existir
    os.makedirs(pasta_saida, exist_ok=True)

    # Contar arquivos para processamento
    arquivos_para_processar = [f for f in os.listdir(pasta_entrada) 
                             if os.path.splitext(f)[1].lower() in FORMATOS_SUPORTADOS]
    
    if not arquivos_para_processar:
        print("Nenhum arquivo compatível encontrado na pasta logos_originais")
        print(f"Formatos suportados: {', '.join(FORMATOS_SUPORTADOS)}")
        return

    print(f"Encontrados {len(arquivos_para_processar)} arquivos para processar")

    # Processar todas as imagens na pasta de entrada
    for nome_arquivo in arquivos_para_processar:
        caminho_entrada = os.path.join(pasta_entrada, nome_arquivo)
        nome_base = os.path.splitext(nome_arquivo)[0]
        formato = os.path.splitext(nome_arquivo)[1].lower()
        caminho_saida = os.path.join(pasta_saida, f"processado_{nome_base}{formato}")
        redimensionar_logo(caminho_entrada, caminho_saida)

    print("\nProcessamento concluído!")
    print(f"Arquivos processados: {len(arquivos_para_processar)}")
    print(f"Arquivos salvos em: {os.path.abspath(pasta_saida)}")

if __name__ == "__main__":
    print("Iniciando processamento de imagens...")
    print(f"Formatos suportados: {', '.join(FORMATOS_SUPORTADOS)}")
    processar_arquivos()
