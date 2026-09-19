class MiniVFS {
  constructor() {
    this.files = {};
    this.folders = new Set(['/']);
  }
  addFile(path, content) {
    if (!path || typeof path !== 'string') return false;
    path = this.normalizePath(path);
    let processedContent = content;
    if (typeof content === 'string') {
      processedContent = this.ensureUTF8(content);
    }
    this.files[path] = {
      name: path.split('/').pop(),
      path,
      content: processedContent,
      type: this.getFileType(path),
      size: this.getSize(processedContent),
      isText: this.isTextFile(path)
    };
    this.addParentFolders(path);
    return true;
  }
  ensureUTF8(content) {
    if (typeof content !== 'string') content = String(content);
    content = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    content = content.replace(/\r\n/g, '\n');
    return content;
  }
  normalizePath(path) {
    path = path.replace(/\/+/g, '/');
    if (!path.startsWith('/')) path = '/' + path;
    if (path !== '/' && path.endsWith('/')) path = path.slice(0, -1);
    return path;
  }
  addParentFolders(path) {
    const parts = path.split('/').filter(Boolean);
    for (let i = 1; i < parts.length - 1; i++) {
      const folderPath = '/' + parts.slice(0, i + 1).join('/');
      this.folders.add(folderPath);
    }
  }
  getFileType(filename) {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const types = {
      'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image', 'webp': 'image', 'svg': 'image',
      'html': 'html', 'htm': 'html', 'css': 'css',
      'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
      'json': 'json', 'xml': 'xml', 'yaml': 'yaml', 'yml': 'yaml',
      'txt': 'text', 'md': 'markdown',
      'py': 'python', 'rb': 'ruby', 'go': 'go', 'rs': 'rust', 'java': 'java'
    };
    return types[ext] || 'file';
  }
  isTextFile(filename) {
    const textTypes = ['html', 'css', 'js', 'ts', 'jsx', 'tsx', 'json', 'xml', 'yaml', 'yml', 'txt', 'md', 'py', 'rb', 'go', 'rs', 'java'];
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return textTypes.includes(ext);
  }
  getSize(content) {
    if (typeof content === 'string') return new Blob([content]).size;
    return 0;
  }
  getFile(path) {
    path = this.normalizePath(path);
    return this.files[path] || null;
  }
  getContent(path) {
    const file = this.getFile(path);
    return file ? file.content : null;
  }
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
    return true;
  }
  deleteFile(path) {
    path = this.normalizePath(path);
    delete this.files[path];
    return true;
  }
  getAllFiles() {
    return Object.values(this.files);
  }
  getTree() {
    const tree = { name: 'root', path: '/', type: 'folder', children: [] };
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
          const folder = { name: folderName, path: folderPath, type: 'folder', children: [] };
          current.children.push(folder);
          processed.add(folderPath);
          current = folder;
        }
      }
      const file = this.files[filePath];
      current.children.push({ name: file.name, path: filePath, type: 'file', fileType: file.type, size: file.size, isText: file.isText });
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
  clear() {
    this.files = {};
    this.folders = new Set(['/']);
  }
}
const miniVFS = new MiniVFS();