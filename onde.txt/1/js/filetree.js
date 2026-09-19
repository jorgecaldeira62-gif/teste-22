/**
 * FileTree - Gerenciador visual de arquivos
 */

class FileTree {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.vfs = options.vfs || vfs;
    this.activeFile = null;
    this.expandedDirs = new Set(['/__root__']);
    this.projectName = options.projectName || 'Meu Projeto';
    
    // Callbacks
    this.onFileSelect = options.onFileSelect || (() => {});
    this.onFileCreate = options.onFileCreate || (() => {});
    this.onFolderCreate = options.onFolderCreate || (() => {});
    this.onDelete = options.onDelete || (() => {});
    this.onRename = options.onRename || (() => {});
    this.onDuplicate = options.onDuplicate || (() => {});
    this.onPushGitHub = options.onPushGitHub || (() => {});
    this.onPullGitHub = options.onPullGitHub || (() => {});
    this.onSyncGitHub = options.onSyncGitHub || (() => {});
    this.onExportZip = options.onExportZip || (() => {});

    this.githubConnected = options.githubConnected || false;
    this.githubRepo = options.githubRepo || '';

    this.render();
  }

  // ─── Renderizar ────────────────────────────────────────────────────
  render() {
    this.container.innerHTML = `
      <div class="filetree-container">
        ${this.renderRoot()}
      </div>
    `;

    this.attachEventListeners();
  }

  renderRoot() {
    const root = this.vfs.getRoot();
    const expanded = this.expandedDirs.has('/__root__');

    return `
      <div class="filetree-root">
        <div class="filetree-node-header" data-path="/">
          <button class="filetree-toggle" data-path="/__root__">
            <i class="fas fa-${expanded ? 'chevron-down' : 'chevron-right'}"></i>
          </button>
          <i class="fas fa-${expanded ? 'folder-open' : 'folder'} filetree-icon-folder"></i>
          <span class="filetree-node-name">${this.projectName}</span>
          <button class="filetree-menu-btn" data-path="/" data-is-root="true">
            <i class="fas fa-ellipsis-v"></i>
          </button>
        </div>

        ${expanded ? `
          <div class="filetree-children">
            ${this.renderChildren(root, 1)}
          </div>
        ` : ''}
      </div>
    `;
  }

  renderChildren(node, depth) {
    if (node.type !== 'directory' || !node.children.length) {
      return '<div class="filetree-empty">Nenhum arquivo</div>';
    }

    // Separar pastas e arquivos
    const folders = node.children.filter(c => c.type === 'directory');
    const files = node.children.filter(c => c.type === 'file');
    const sorted = [...folders, ...files];

    return sorted.map(child => this.renderNode(child, depth)).join('');
  }

  renderNode(node, depth) {
    const isDir = node.type === 'directory';
    const expanded = this.expandedDirs.has(node.path);
    const isActive = this.activeFile === node.path;
    const indent = depth * 14;

    if (isDir) {
      return `
        <div class="filetree-node-dir" style="margin-left: ${indent}px">
          <div class="filetree-node-header ${isActive ? 'active' : ''}">
            <button class="filetree-toggle" data-path="${node.path}">
              <i class="fas fa-${expanded ? 'chevron-down' : 'chevron-right'}"></i>
            </button>
            <i class="fas fa-${expanded ? 'folder-open' : 'folder'} filetree-icon-folder"></i>
            <span class="filetree-node-name">${node.name}</span>
            <button class="filetree-menu-btn" data-path="${node.path}" data-is-dir="true">
              <i class="fas fa-ellipsis-v"></i>
            </button>
          </div>

          ${expanded ? `
            <div class="filetree-children">
              ${this.renderChildren(node, depth + 1)}
            </div>
          ` : ''}
        </div>
      `;
    } else {
      const icon = this.getFileIcon(node.name);
      const color = this.getFileColor(node.name);

      return `
        <div class="filetree-node-file" style="margin-left: ${indent}px">
          <div class="filetree-node-header ${isActive ? 'active' : ''}" data-path="${node.path}">
            <div class="filetree-toggle-placeholder"></div>
            <i class="fas fa-${icon} filetree-icon-file ${color}"></i>
            <span class="filetree-node-name">${node.name}</span>
            <button class="filetree-menu-btn" data-path="${node.path}" data-is-dir="false">
              <i class="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>
      `;
    }
  }

  // ─── Event Listeners ───────────────────────────────────────────────
  attachEventListeners() {
    // Expandir/colapsar pastas
    this.container.querySelectorAll('.filetree-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const path = btn.dataset.path;
        if (this.expandedDirs.has(path)) {
          this.expandedDirs.delete(path);
        } else {
          this.expandedDirs.add(path);
        }
        this.render();
      });
    });

    // Selecionar arquivo
    this.container.querySelectorAll('.filetree-node-file .filetree-node-header').forEach(header => {
      header.addEventListener('click', (e) => {
        e.stopPropagation();
        const path = header.dataset.path;
        this.activeFile = path;
        this.onFileSelect(path);
        this.render();
      });
    });

    // Menu de contexto
    this.container.querySelectorAll('.filetree-menu-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const path = btn.dataset.path;
        const isDir = btn.dataset.isDir === 'true';
        const isRoot = btn.dataset.isRoot === 'true';
        this.showContextMenu(path, isDir, isRoot);
      });
    });
  }

  // ─── Context Menu ──────────────────────────────────────────────────
  showContextMenu(path, isDir, isRoot) {
    const node = this.vfs.getNode(path);
    const name = node ? node.name : 'Item';

    const items = [];

    // Itens para diretórios
    if (isDir) {
      items.push({
        label: 'Novo Arquivo',
        icon: 'file-plus',
        action: () => this.createFile(path)
      });
      items.push({
        label: 'Nova Pasta',
        icon: 'folder-plus',
        action: () => this.createFolder(path)
      });
      items.push({ separator: true });
      items.push({
        label: 'Exportar como ZIP',
        icon: 'file-archive',
        action: () => this.exportZip(path)
      });
    } else {
      // Itens para arquivos
      items.push({
        label: 'Duplicar',
        icon: 'copy',
        action: () => this.duplicateFile(path)
      });
      items.push({
        label: 'Baixar',
        icon: 'download',
        action: () => this.downloadFile(path)
      });
    }

    // Itens do GitHub
    if (this.githubConnected) {
      items.push({ separator: true });
      if (isDir) {
        items.push({
          label: 'Enviar para GitHub',
          icon: 'upload',
          action: () => this.pushToGitHub(path)
        });
      }
      if (isRoot) {
        items.push({
          label: 'Sincronizar com GitHub',
          icon: 'sync',
          action: () => this.syncGitHub()
        });
        items.push({
          label: 'Baixar do GitHub',
          icon: 'download',
          action: () => this.pullFromGitHub()
        });
      }
    }

    // Itens comuns
    if (!isRoot) {
      items.push({ separator: true });
      items.push({
        label: 'Renomear',
        icon: 'edit',
        action: () => this.renameNode(path)
      });
      items.push({
        label: 'Excluir',
        icon: 'trash',
        color: 'text-red-400',
        action: () => this.deleteNode(path)
      });
    }

    this.showBottomSheet(name, items);
  }

  showBottomSheet(title, items) {
    // Remover sheet anterior se existir
    const existing = document.querySelector('.filetree-bottom-sheet');
    if (existing) existing.remove();

    const sheet = document.createElement('div');
    sheet.className = 'filetree-bottom-sheet';
    sheet.innerHTML = `
      <div class="filetree-sheet-overlay"></div>
      <div class="filetree-sheet-content">
        <div class="filetree-sheet-header">
          <h3>${title}</h3>
          <button class="filetree-sheet-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="filetree-sheet-items">
          ${items.map(item => {
            if (item.separator) {
              return '<div class="filetree-sheet-separator"></div>';
            }
            return `
              <button class="filetree-sheet-item ${item.color || ''}">
                <i class="fas fa-${item.icon}"></i>
                <span>${item.label}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(sheet);

    // Event listeners
    sheet.querySelector('.filetree-sheet-overlay').addEventListener('click', () => {
      sheet.remove();
    });

    sheet.querySelector('.filetree-sheet-close').addEventListener('click', () => {
      sheet.remove();
    });

    const buttons = sheet.querySelectorAll('.filetree-sheet-item');
    buttons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        items[index].action();
        sheet.remove();
      });
    });
  }

  // ─── Ações ─────────────────────────────────────────────────────────
  createFile(parentPath) {
    const name = prompt('Nome do arquivo:');
    if (!name) return;

    const path = parentPath === '/' ? '/' + name : parentPath + name;
    this.vfs.createFile(path, '');
    this.onFileCreate(path);
    this.render();
  }

  createFolder(parentPath) {
    const name = prompt('Nome da pasta:');
    if (!name) return;

    this.vfs.createFolder(parentPath, name);
    this.onFolderCreate(parentPath + name);
    this.render();
  }

  deleteNode(path) {
    if (!confirm('Tem certeza que deseja excluir?')) return;

    this.vfs.deleteNode(path);
    this.onDelete(path);
    if (this.activeFile === path) {
      this.activeFile = null;
    }
    this.render();
  }

  renameNode(path) {
    const node = this.vfs.getNode(path);
    if (!node) return;

    const newName = prompt('Novo nome:', node.name);
    if (!newName || newName === node.name) return;

    this.vfs.renameNode(path, newName);
    this.onRename(path, newName);
    this.render();
  }

  duplicateFile(path) {
    this.vfs.duplicateNode(path);
    this.onDuplicate(path);
    this.render();
  }

  downloadFile(path) {
    const file = this.vfs.getFile(path);
    if (!file) return;

    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  async exportZip(path) {
    const files = this.vfs.getAllFilesUnder(path);
    
    // Carregar JSZip dinamicamente
    if (typeof JSZip === 'undefined') {
      alert('Carregando biblioteca de compressão...');
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.onload = () => this.exportZip(path);
      document.head.appendChild(script);
      return;
    }

    const zip = new JSZip();
    for (const file of files) {
      const rel = file.path.startsWith(path + '/') 
        ? file.path.slice(path.length + 1) 
        : file.path;
      if (rel) zip.file(rel, file.content);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.projectName}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ─── GitHub Integration ────────────────────────────────────────────
  pushToGitHub(path) {
    const files = this.vfs.getAllFilesUnder(path);
    const message = prompt('Mensagem do commit:', `Atualizado pelo SK Code Editor - ${new Date().toLocaleDateString('pt-BR')}`);
    if (!message) return;

    this.onPushGitHub({
      files: Object.fromEntries(files.map(f => [f.path, f.content])),
      message
    });
  }

  syncGitHub() {
    const files = this.vfs.getAllFilesUnder('');
    this.onSyncGitHub({
      files: Object.fromEntries(files.map(f => [f.path, f.content]))
    });
  }

  pullFromGitHub() {
    this.onPullGitHub();
  }

  // ─── Utilitários ───────────────────────────────────────────────────
  getFileIcon(name) {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    const icons = {
      'js': 'file-code', 'jsx': 'file-code',
      'ts': 'file-code', 'tsx': 'file-code',
      'html': 'file-code', 'css': 'file-code',
      'json': 'file-code', 'md': 'file-alt',
      'py': 'file-code', 'rb': 'file-code',
      'go': 'file-code', 'rs': 'file-code',
      'java': 'file-code', 'svg': 'image',
      'png': 'image', 'jpg': 'image',
      'gif': 'image', 'pdf': 'file-pdf',
      'zip': 'file-archive', 'tar': 'file-archive'
    };
    return icons[ext] || 'file';
  }

  getFileColor(name) {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    const colors = {
      'js': 'text-yellow-400', 'jsx': 'text-yellow-400',
      'ts': 'text-blue-400', 'tsx': 'text-blue-400',
      'html': 'text-orange-400', 'css': 'text-purple-400',
      'json': 'text-green-400', 'md': 'text-gray-400',
      'py': 'text-green-500', 'rb': 'text-red-400',
      'go': 'text-cyan-400', 'rs': 'text-orange-500',
      'java': 'text-red-500', 'svg': 'text-emerald-400',
      'png': 'text-emerald-400', 'jpg': 'text-emerald-400'
    };
    return colors[ext] || 'text-gray-400';
  }

  // ─── Métodos públicos ──────────────────────────────────────────────
  getActiveFile() {
    return this.activeFile;
  }

  setProjectName(name) {
    this.projectName = name;
    this.render();
  }

  updateGitHubStatus(connected, repo) {
    this.githubConnected = connected;
    this.githubRepo = repo;
  }

  importFiles(files) {
    this.vfs.importFiles(files);
    this.render();
  }

  getFileContent(path) {
    return this.vfs.getFileContent(path);
  }

  updateFileContent(path, content) {
    this.vfs.updateFileContent(path, content);
  }

  getAllFiles() {
    return this.vfs.getAllFilesUnder('');
  }
}
