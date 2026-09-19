#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Criar estrutura
mkdir -p sk-mini-editor/{css,js,lib}
cd sk-mini-editor

# Criar arquivos CSS
touch css/{style,sidebar,editor,tabs,preview,buttons,responsive,theme-dark,theme-light}.css

# Criar arquivos JS
touch js/{mini-utils,mini-validator,mini-storage,mini-vfs,mini-filetree,mini-tabs,mini-preview,mini-youtube,mini-import-export,mini-github,mini-theme,mini-syntax,mini-search,mini-shortcuts,mini-events,mini-editor,mini-init}.js

# Criar HTML
touch index.html

# Mostrar resultado
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ESTRUTURA CRIADA COM SUCESSO!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Pasta:${NC} sk-mini-editor"
echo ""
echo -e "${BLUE}Subpastas:${NC}"
echo "  - css (9 arquivos)"
echo "  - js (17 arquivos)"
echo "  - lib (vazia)"
echo ""
echo -e "${BLUE}Arquivo principal:${NC}"
echo "  - index.html"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  PRÓXIMA ETAPA: PREENCHER OS ARQUIVOS${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Listar arquivos
echo -e "${BLUE}Arquivos criados:${NC}"
find . -type f | sort

echo ""
echo "Total de arquivos: $(find . -type f | wc -l)"
echo ""
