/**
 * MINI FILE TREE - Árvore de Arquivos
 * Renderiza e gerencia a visualização da árvore de pastas e arquivos
 */

class MiniFileTree {
  constructor(containerId, vfs) {
    this.container = document.getElementById(containerId);
    this.vfs = vfs;
    this.expanded = new Set(['/']);
    this.selected = null;
    this.onFileSelect = () => {};
    this.onContextMenu = () => {};
    this.onFolderToggle = () => {};
  }

  /**
   * Renderiza a árvore completa
   */
  render() {
    if (!this.container) return;
    
    const tree = this.vfs.getTree();
    this.container.innerHTML = this.renderNode(tree, 0);
    this.attachListeners();
  }

  /**
   * Renderiza um nó da árvore (pasta ou arquivo)
   */
  renderNode(node, depth) {
    if (node.type === 'folder') {
      const expanded = this.expanded.has(node.path);
      const isRoot = node.path === '/';
      const icon = expanded ? 'folder-open' : 'folder';
      const chevron = expanded ? 'chevron-down' : 'chevron-right';
      const childrenHtml = expanded && node.children
        ? node.children.map(child => this.renderNode(child, depth + 1)).join('')
        : '';

      return `
        <div class="tree-node" data-path="${node.path}">
          <div class="tree-item" data-path="${node.path}" data-type="folder">
            <button class="tree-toggle ${expanded ? 'rotated' : ''}" data-path="${node.path}">
              <i class="fas fa-${chevron}"></i>
            </button>
            <i class="fas fa-${icon} tree-icon folder"></i>
            <span class="tree-name">${node.name}</span>
            ${!isRoot ? `<button class="tree-menu" data-path="${node.path}"><i class="fas fa-ellipsis-v"></i></button>` : ''}
          </div>
          ${expanded ? `<div class="tree-children">${childrenHtml}</div>` : ''}
        </div>
      `;
    } else {
      const icon = this.getFileIcon(node.fileType);
      const fileClass = this.getFileClass(node.fileType);
      const isSelected = this.selected === node.path;

      return `
        <div class="tree-node" data-path="${node.path}">
          <div class="tree-item ${isSelected ? 'active' : ''}" data-path="${node.path}" data-type="file">
            <div class="tree-toggle-placeholder"></div>
            <i class="fas fa-${icon} tree-icon file ${fileClass}"></i>
            <span class="tree-name">${node.name}</span>
            <button class="tree-menu" data-path="${node.path}"><i class="fas fa-ellipsis-v"></i></button>
          </div>
        </div>
      `;
    }
  }

  /**
   * Anexa event listeners aos elementos da árvore
   */
  attachListeners() {
    // Toggle de pastas
    this.container.querySelectorAll('.tree-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const path = btn.dataset.path;
        this.toggleFolder(path);
      });
    });

    // Seleção de arquivos
    this.container.querySelectorAll('.tree-item[data-type="file"]').forEach(item => {
      item.addEventListener('click', () => {
        this.selectFile(item.dataset.path);
      });
    });

    // Menu de contexto
    this.container.querySelectorAll('.tree-menu').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onContextMenu(btn.dataset.path);
      });
    });

    // Drag and drop
    this.container.querySelectorAll('.tree-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.dataset.path);
      });

      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        item.classList.add('drag-over');
      });

      item.addEventListener('dragleave', () => {
        item.classList.remove('drag-over');
      });

      item.addEventListener('drop', (e) => {
        e.preventDefault();
        item.classList.remove('drag-over');
        const sourcePath = e.dataTransfer.getData('text/plain');
        // Implementar lógica de move
      });
    });
  }

  /**
   * Alterna a expansão de uma pasta
   */
  toggleFolder(path) {
    if (this.expanded.has(path)) {
      this.expanded.delete(path);
    } else {
      this.expanded.add(path);
    }
    this.onFolderToggle(path, this.expanded.has(path));
    this.render();
  }

  /**
   * Seleciona um arquivo
   */
  selectFile(path) {
    this.selected = path;
    this.onFileSelect(path);
    this.render();
  }

  /**
   * Obtém o ícone de um tipo de arquivo
   */
  getFileIcon(type) {
    const icons = {
      'image': 'image',
      'html': 'file-code',
      'css': 'file-code',
      'javascript': 'file-code',
      'typescript': 'file-code',
      'json': 'file-code',
      'xml': 'file-code',
      'yaml': 'file-code',
      'python': 'file-code',
      'ruby': 'file-code',
      'go': 'file-code',
      'rust': 'file-code',
      'java': 'file-code',
      'c': 'file-code',
      'cpp': 'file-code',
      'csharp': 'file-code',
      'php': 'file-code',
      'text': 'file-alt',
      'markdown': 'file-alt'
    };
    return icons[type] || 'file';
  }

  /**
   * Obtém a classe CSS de um tipo de arquivo
   */
  getFileClass(type) {
    const classes = {
      'html': 'html',
      'css': 'css',
      'javascript': 'js',
      'typescript': 'ts',
      'json': 'json',
      'image': 'image',
      'text': 'text',
      'markdown': 'markdown',
      'python': 'python',
      'ruby': 'ruby'
    };
    return classes[type] || 'text';
  }

  /**
   * Expande todas as pastas
   */
  expandAll() {
    const tree = this.vfs.getTree();
    this.expandNode(tree);
    this.render();
  }

  /**
   * Expande recursivamente um nó
   */
  expandNode(node) {
    if (node.type === 'folder') {
      this.expanded.add(node.path);
      if (node.children) {
        node.children.forEach(child => this.expandNode(child));
      }
    }
  }

  /**
   * Recolhe todas as pastas
   */
  collapseAll() {
    this.expanded.clear();
    this.expanded.add('/');
    this.render();
  }

  /**
   * Busca e destaca arquivos
   */
  search(query) {
    const results = this.vfs.searchFiles(query);
    this.expandAll();
    
    this.container.querySelectorAll('.tree-item').forEach(item => {
      const path = item.dataset.path;
      const found = results.some(r => r.path === path);
      item.classList.toggle('search-result', found);
    });

    return results;
  }

  /**
   * Limpa a busca
   */
  clearSearch() {
    this.container.querySelectorAll('.tree-item').forEach(item => {
      item.classList.remove('search-result');
    });
  }

  /**
   * Obtém o caminho selecionado
   */
  getSelected() {
    return this.selected;
  }

  /**
   * Atualiza a árvore sem perder expansões
   */
  refresh() {
    this.render();
  }
}

// Instância global
const miniFileTree = new MiniFileTree('fileTree', miniVFS);
