class MiniFileTree {
  constructor(containerId, vfs) {
    this.container = document.getElementById(containerId);
    this.vfs = vfs;
    this.expanded = new Set(['/']);
    this.onFileSelect = () => { };
    this.onContextMenu = () => { };
  }
  render() {
    const tree = this.vfs.getTree();
    this.container.innerHTML = this.renderNode(tree, 0);
    this.attachListeners();
  }
  renderNode(node, depth) {
    if (node.type === 'folder') {
      const expanded = this.expanded.has(node.path);
      const isRoot = node.path === '/';
      const icon = expanded ? 'folder-open' : 'folder';
      const chevron = expanded ? 'chevron-down' : 'chevron-right';
      return `
        
          
            
              
            
            
            ${node.name}
            ${!isRoot ? `` : ''}
          
          ${expanded ? `${node.children?.map(child => this.renderNode(child, depth + 1)).join('') || ''}` : ''}
        
      `;
    } else {
      const icon = this.getFileIcon(node.fileType);
      const color = this.getFileColor(node.fileType);
      return `
        
          
            
            
            ${node.name}
            
          
        
      `;
    }
  }
  attachListeners() {
    this.container.querySelectorAll('.mini-tree-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const path = btn.dataset.path;
        if (this.expanded.has(path)) {
          this.expanded.delete(path);
        } else {
          this.expanded.add(path);
        }
        this.render();
      });
    });
    this.container.querySelectorAll('.mini-tree-file .mini-tree-item').forEach(item => {
      item.addEventListener('click', () => {
        this.onFileSelect(item.dataset.path);
      });
    });
    this.container.querySelectorAll('.mini-tree-menu').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onContextMenu(btn.dataset.path);
      });
    });
  }
  getFileIcon(type) {
    const icons = { 'image': 'image', 'html': 'file-code', 'css': 'file-code', 'javascript': 'file-code', 'json': 'file-code', 'text': 'file-alt', 'markdown': 'file-alt' };
    return icons[type] || 'file';
  }
  getFileColor(type) {
    const colors = { 'html': 'text-orange-400', 'css': 'text-purple-400', 'javascript': 'text-yellow-400', 'image': 'text-emerald-400', 'text': 'text-gray-400' };
    return colors[type] || 'text-gray-400';
  }
}
const miniFileTree = new MiniFileTree('fileTree', miniVFS);