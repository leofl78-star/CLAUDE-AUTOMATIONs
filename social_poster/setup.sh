#!/bin/bash
# ============================================================
# Setup — Social Media Auto-Poster
# Senta Aqui com o Léo
# ============================================================
# Execute uma vez: bash setup.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "============================================="
echo "  Senta Aqui com o Léo — Setup Auto-Poster"
echo "============================================="
echo ""

# Check Python version
python3 --version >/dev/null 2>&1 || { echo "ERRO: Python 3 não encontrado. Instale em python.org"; exit 1; }
PY_VERSION=$(python3 -c "import sys; print(sys.version_info.minor)")
if [ "$PY_VERSION" -lt 9 ]; then
    echo "ERRO: Python 3.9+ é necessário. Versão atual: 3.${PY_VERSION}"
    exit 1
fi
echo "✓ Python encontrado"

# Check ffmpeg
ffmpeg -version >/dev/null 2>&1 || {
    echo ""
    echo "ATENÇÃO: ffmpeg não encontrado."
    echo "Instale com:"
    echo "  macOS:  brew install ffmpeg"
    echo "  Ubuntu: sudo apt install ffmpeg"
    echo ""
    echo "Continuando sem ffmpeg (será necessário para analisar vídeos)..."
}

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Criando ambiente virtual..."
    python3 -m venv venv
    echo "✓ Ambiente virtual criado"
fi

# Install dependencies
echo "Instalando dependências..."
./venv/bin/pip install --upgrade pip -q
./venv/bin/pip install -r requirements.txt -q
echo "✓ Dependências instaladas"

# Create .env if not exists
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo ""
    echo "✓ Arquivo .env criado"
    echo ""
    echo ">>> PRÓXIMO PASSO: Abra o arquivo .env e preencha suas credenciais:"
    echo "    ${SCRIPT_DIR}/.env"
    echo ""
fi

# Create default video folder
VIDEO_FOLDER="$HOME/Desktop/videos_para_postar"
mkdir -p "$VIDEO_FOLDER"
echo "✓ Pasta de vídeos criada: ${VIDEO_FOLDER}"

# Create the 'post' command wrapper
POST_CMD="${SCRIPT_DIR}/post"
cat > "$POST_CMD" << EOF
#!/bin/bash
cd "${SCRIPT_DIR}"
"${SCRIPT_DIR}/venv/bin/python" "${SCRIPT_DIR}/main.py" post "\$@"
EOF
chmod +x "$POST_CMD"
echo "✓ Comando 'post' criado"

# Add alias to shell profile
SHELL_PROFILE=""
if [ -f "$HOME/.zshrc" ]; then
    SHELL_PROFILE="$HOME/.zshrc"
elif [ -f "$HOME/.bash_profile" ]; then
    SHELL_PROFILE="$HOME/.bash_profile"
elif [ -f "$HOME/.bashrc" ]; then
    SHELL_PROFILE="$HOME/.bashrc"
fi

if [ -n "$SHELL_PROFILE" ]; then
    ALIAS_LINE="alias post='${POST_CMD}'"
    if ! grep -q "alias post=" "$SHELL_PROFILE" 2>/dev/null; then
        echo "" >> "$SHELL_PROFILE"
        echo "# Senta Aqui com o Léo — Auto-Poster" >> "$SHELL_PROFILE"
        echo "$ALIAS_LINE" >> "$SHELL_PROFILE"
        echo "✓ Alias 'post' adicionado em: ${SHELL_PROFILE}"
        echo ""
        echo "  Execute 'source ${SHELL_PROFILE}' ou abra um novo terminal,"
        echo "  depois você pode simplesmente digitar: post"
    else
        echo "✓ Alias 'post' já existe em: ${SHELL_PROFILE}"
    fi
fi

echo ""
echo "============================================="
echo "  Setup concluído!"
echo "============================================="
echo ""
echo "COMO USAR:"
echo "  1. Preencha suas credenciais em: .env"
echo "  2. Coloque vídeos em:  ~/Desktop/videos_para_postar/"
echo "  3. No terminal, digite: post"
echo ""
echo "COMANDOS ÚTEIS:"
echo "  post                     → posta em todas as plataformas"
echo "  post --dry-run           → testa sem postar de verdade"
echo "  post --platform youtube  → posta só no YouTube"
echo "  post --platform tiktok,instagram"
echo "  post --folder /outra/pasta"
echo ""
