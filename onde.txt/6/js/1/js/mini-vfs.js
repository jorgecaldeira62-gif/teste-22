/**
 * MINI VFS - Sistema Virtual de Arquivos
 * Gerencia todos os arquivos do projeto em memória
 */

class MiniVFS {
  constructor() {
    this.files = {};
    this.folders = new Set(['/']);
    this.history = [];
    this.historyIndex = -1;
  }

  /**
   * Adiciona um arquivo ao sistema
   * @param {string} path - Caminho do arquivo (ex: /pasta/arquivo.html)
   * @param {string} content - Conteúdo do arquivo
   */
  addFile(path, content) {
    if (!path || typeof path !== 'string') return false;
    
    path = this.normalizePath(path);
    let processedContent = content;
    
    if (typeof content === 'string') {
      processedContent = this.ensureUTF8(content);
    }

    this.files[path] = {
      name: path.split('/').pop(),
      path: path,
      content: processedContent,
      type: this.getFileType(path),
      size: this.getSize(processedContent),
      isText: this.isTextFile(path),
      created: new Date(),
      modified: new Date()
    };

    this.addParentFolders(path);
    this.saveHistory();
    return true;
  }

  /**
   * Garante que o conteúdo está em UTF-8
   * Remove caracteres inválidos
   */
  ensureUTF8(content) {
    if (typeof content !== 'string') {
      content = String(content);
    }
    
    // Remove caracteres de controle inválidos
    content = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Normaliza quebras de linha
    content = content.replace(/\r\n/g, '\n');
    
    return content;
  }

  /**
   * Normaliza o caminho do arquivo
   * /arquivo.html → /arquivo.html
   * arquivo.html → /arquivo.html
   */
  normalizePath(path) {
    path = path.replace(/\/+/g, '/');
    if (!path.startsWith('/')) path = '/' + path;
    if (path !== '/' && path.endsWith('/')) path = path.slice(0, -1);
    return path;
  }

  /**
   * Adiciona pastas pai automaticamente
   * /pasta/subpasta/arquivo.txt → cria /pasta e /pasta/subpasta
   */
  addParentFolders(path) {
    const parts = path.split('/').filter(Boolean);
    for (let i = 1; i < parts.length - 1; i++) {
      const folderPath = '/' + parts.slice(0, i + 1).join('/');
      this.folders.add(folderPath);
    }
  }

  /**
   * Detecta o tipo de arquivo pela extensão
   */
  getFileType(filename) {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const types = {
      'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image', 'webp': 'image', 'svg': 'image',
      'html': 'html', 'htm': 'html', 'css': 'css',
      'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
      'json': 'json', 'xml': 'xml', 'yaml': 'yaml', 'yml': 'yaml',
      'txt': 'text', 'md': 'markdown',
      'py': 'python', 'rb': 'ruby', 'go': 'go', 'rs': 'rust', 'java': 'java',
      'c': 'c', 'cpp': 'cpp', 'cs': 'csharp', 'php': 'php'
    };
    return types[ext] || 'file';
  }

  /**
   * Verifica se é um arquivo de texto
   */
  isTextFile(filename) {
    const textTypes = ['html', 'css', 'js', 'ts', 'jsx', 'tsx', 'json', 'xml', 'yaml', 'yml', 'txt', 'md', 'py', 'rb', 'go', 'rs', 'java', 'c', 'cpp', 'cs', 'php'];
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return textTypes.includes(ext);
  }

  /**
   * Calcula o tamanho do arquivo em bytes
   */
  getSize(content) {
    if (typeof content === 'string') {
      return new Blob([content]).size;
    }
    return 0;
  }

  /**
   * Obtém um arquivo específico
   */
  getFile(path) {
    path = this.normalizePath(path);
    return this.files[path] || null;
  }

  /**
   * Obtém apenas o conteúdo de um arquivo
   */
  getContent(path) {
    const file = this.getFile(path);
    return file ? file.content : null;
  }

  /**
   * Atualiza o conteúdo de um arquivo
   */
  updateContent(path, content) {
    path = this.normalizePath(path);
    const file = this.files[path];
    
    if (!file) return false;
    
    let processedContent = content;
    if (typeof content === 'string') {
      processedContent = this.ensureUTF8(content);
    }
    
    file.content = processedContent;
    file.size = this.getSize(processedContent);
    file.modified = new Date();
    
    this.saveHistory();
    return true;
  }

  /**
   * Deleta um arquivo
   */
  deleteFile(path) {
    path = this.normalizePath(path);
    if (this.files[path]) {
      delete this.files[path];
      this.saveHistory();
      return true;
    }
    return false;
  }

  /**
   * Renomeia um arquivo
   */
  renameFile(oldPath, newName) {
    oldPath = this.normalizePath(oldPath);
    const file = this.files[oldPath];
    
    if (!file) return false;
    
    const folder = oldPath.substring(0, oldPath.lastIndexOf('/'));
    const newPath = folder === '' ? '/' + newName : folder + '/' + newName;
    
    this.files[newPath] = file;
    file.path = newPath;
    file.name = newName;
    
    delete this.files[oldPath];
    this.saveHistory();
    return true;
  }

  /**
   * Obtém todos os arquivos
   */
  getAllFiles() {
    return Object.values(this.files);
  }

  /**
   * Obtém todos os arquivos de uma pasta
   */
  getFolderContents(folderPath) {
    folderPath = this.normalizePath(folderPath);
    const contents = [];
    
    for (const [path, file] of Object.entries(this.files)) {
      if (path.startsWith(folderPath) && path !== folderPath) {
        const relative = path.substring(folderPath.length);
        if (!relative.substring(1).includes('/')) {
          contents.push(file);
        }
      }
    }
    
    return contents;
  }

  /**
   * Constrói a árvore de arquivos e pastas
   */
  getTree() {
    const tree = {
      name: 'root',
      path: '/',
      type: 'folder',
      children: []
    };

    const paths = Object.keys(this.files).sort();
    const processed = new Set();

    for (const filePath of paths) {
      const parts = filePath.split('/').filter(Boolean);
      let current = tree;

      for (let i = 0; i < parts.length - 1; i++) {
        const folderName = parts[i];
        const folderPath = '/' + parts.slice(0, i + 1).join('/');

        if (processed.has(folderPath)) {
          current = current.children.find(c => c.path === folderPath);
        } else {
          const folder = {
            name: folderName,
            path: folderPath,
            type: 'folder',
            children: []
          };
          current.children.push(folder);
          processed.add(folderPath);
          current = folder;
        }
      }

      const file = this.files[filePath];
      current.children.push({
        name: file.name,
        path: filePath,
        type: 'file',
        fileType: file.type,
        size: file.size,
        isText: file.isText,
        modified: file.modified
      });
    }

    const sort = (node) => {
      if (node.children) {
        node.children.sort((a, b) => {
          if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
        node.children.forEach(sort);
      }
    };

    sort(tree);
    return tree;
  }

  /**
   * Busca arquivos por nome
   */
  searchFiles(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    for (const file of Object.values(this.files)) {
      if (file.name.toLowerCase().includes(lowerQuery) || file.path.toLowerCase().includes(lowerQuery)) {
        results.push(file);
      }
    }

    return results;
  }

  /**
   * Limpa todos os arquivos
   */
  clear() {
    this.files = {};
    this.folders = new Set(['/']);
    this.history = [];
    this.historyIndex = -1;
  }

  /**
   * Salva estado no histórico (para undo/redo)
   */
  saveHistory() {
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(JSON.parse(JSON.stringify(this.files)));
    this.historyIndex++;
  }

  /**
   * Desfaz última ação
   */
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.files = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      return true;
    }
    return false;
  }

  /**
   * Refaz última ação desfeita
   */
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.files = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      return true;
    }
    return false;
  }

  /**
   * Exporta todos os arquivos como objeto
   */
  export() {
    return {
      files: this.files,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Importa arquivos de um objeto
   */
  import(data) {
    if (data && data.files) {
      this.files = data.files;
      this.saveHistory();
      return true;
    }
    return false;
  }

  /**
   * Obtém estatísticas do projeto
   */
  getStats() {
    const files = Object.values(this.files);
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const fileTypes = {};

    files.forEach(f => {
      fileTypes[f.type] = (fileTypes[f.type] || 0) + 1;
    });

    return {
      totalFiles: files.length,
      totalFolders: this.folders.size,
      totalSize: totalSize,
      fileTypes: fileTypes
    };
  }
}

// Instância global
const miniVFS = new MiniVFS();
