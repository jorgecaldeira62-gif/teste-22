/**
 * Virtual File System - Gerencia estrutura de arquivos em memória
 */

class VirtualFileSystem {
  constructor() {
    this.root = {
      name: 'root',
      path: '/',
      type: 'directory',
      children: []
    };
  }

  // Criar arquivo
  createFile(path, content = '') {
    const parts = path.split('/').filter(Boolean);
    const name = parts.pop();
    if (!name) return;

    let current = this.root;

    // Navegar/criar diretórios
    for (const part of parts) {
      let dir = current.children.find(
        c => c.type === 'directory' && c.name === part
      );

      if (!dir) {
        dir = {
          name: part,
          path: current.path + part + '/',
          type: 'directory',
          children: []
        };
        current.children.push(dir);
      }
      current = dir;
    }

    // Criar arquivo
    const fullPath = current.path + name;
    current.children.push({
      name,
      path: fullPath,
      type: 'file',
      content
    });
  }

  // Criar pasta
  createFolder(path, name) {
    let current = this.getNode(path);
    if (!current || current.type !== 'directory') {
      current = this.root;
    }

    const folderPath = current.path === '/' 
      ? '/' + name + '/'
      : current.path + name + '/';

    current.children.push({
      name,
      path: folderPath,
      type: 'directory',
      children: []
    });
  }

  // Obter arquivo
  getFile(path) {
    const node = this.getNode(path);
    return node && node.type === 'file' ? node : null;
  }

  // Obter nó (arquivo ou pasta)
  getNode(path) {
    if (path === '/') return this.root;

    const parts = path.split('/').filter(Boolean);
    let current = this.root;

    for (const part of parts) {
      const next = current.children.find(c => c.name === part);
      if (!next) return null;
      current = next;
    }

    return current;
  }

  // Deletar nó
  deleteNode(path) {
    const parts = path.split('/').filter(Boolean);
    const name = parts.pop();
    if (!name) return;

    let current = this.root;

    for (const part of parts) {
      const next = current.children.find(
        c => c.type === 'directory' && c.name === part
      );
      if (!next) return;
      current = next;
    }

    current.children = current.children.filter(c => c.name !== name);
  }

  // Renomear nó
  renameNode(path, newName) {
    const node = this.getNode(path);
    if (node) {
      node.name = newName;
      // Atualizar path também
      const parentPath = path.substring(0, path.lastIndexOf('/') + 1);
      node.path = parentPath + newName + (node.type === 'directory' ? '/' : '');
    }
  }

  // Duplicar nó
  duplicateNode(path) {
    const node = this.getNode(path);
    if (!node) return;

    const parentPath = path.substring(0, path.lastIndexOf('/') + 1);
    const parent = this.getNode(parentPath) || this.root;

    if (node.type === 'file') {
      const newName = node.name.replace(/(\.[^.]*)?$/, '_copy$1');
      const newPath = parentPath + newName;
      this.createFile(newPath, node.content);
    } else {
      const newName = node.name + '_copy';
      this.createFolder(parentPath, newName);
    }
  }

  // Obter conteúdo do arquivo
  getFileContent(path) {
    const file = this.getFile(path);
    return file ? file.content : undefined;
  }

  // Atualizar conteúdo do arquivo
  updateFileContent(path, content) {
    const file = this.getFile(path);
    if (file) {
      file.content = content;
    }
  }

  // Obter todos os arquivos sob um caminho
  getAllFilesUnder(prefix) {
    const files = [];
    const node = prefix === '' || prefix === '/' 
      ? this.root 
      : this.getNode(prefix);

    if (!node) return files;

    const traverse = (current, basePath) => {
      for (const child of current.children) {
        if (child.type === 'file') {
          files.push({
            path: child.path,
            content: child.content
          });
        } else if (child.type === 'directory') {
          traverse(child, basePath + child.name + '/');
        }
      }
    };

    traverse(node, prefix);
    return files;
  }

  // Obter raiz
  getRoot() {
    return this.root;
  }

  // Importar arquivos (do GitHub, por exemplo)
  importFiles(files) {
    for (const [path, content] of Object.entries(files)) {
      this.createFile(path, content);
    }
  }

  // Exportar como objeto
  exportAsObject() {
    const result = {};
    const files = this.getAllFilesUnder('');
    for (const file of files) {
      result[file.path] = file.content;
    }
    return result;
  }
}

// Instância global
const vfs = new VirtualFileSystem();
