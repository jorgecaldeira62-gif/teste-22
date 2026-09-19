class MiniEditor {
  constructor() {
    this.currentFile = null;
    this.tabs = new Set();
    this.setupElements();
    this.setupFileTree();
    this.setupEventListeners();
    this.setupImport();
    miniVFS.addFile('/index.html', 'Olá, Mundo!\nBem-vindo ao SK Mini Editor');
    miniVFS.addFile('/style.css', 'body {\n  font-family: Arial, sans-serif;\n  background: #f0f0f0;\n}');
    miniVFS.addFile('/script.js', 'console.log("SK Mini Editor rodando!");');
    this.fileTree.render();
  }
  setupElements() {
    this.codeEditor = document.getElementById('codeEditor');
    this.previewFrame = document.getElementById('previewFrame');
    this.imagePreview = document.getElementById('imagePreview');
    this.textPreview = document.getElementById('textPreview');
    this.editorTabs = document.getElementById('editorTabs');
    this.importBtn = document.getElementById('importBtn');
    this.importInput = document.getElementById('importInput');
    this.newFileBtn = document.getElementById('newFileBtn');
  }
  setupFileTree() {
    this.fileTree = new MiniFileTree('fileTree', miniVFS);
    this.fileTree.onFileSelect = (path) => this.selectFile(path);
    this.fileTree.onContextMenu = (path) => this.showContextMenu(path);
  }
  setupEventListeners() {
    this.importBtn.addEventListener('click', () => this.importInput.click());
    this.importInput.addEventListener('change', (e) => this.handleImport(e));
    this.codeEditor.addEventListener('input', () => this.updateFile());
    this.newFileBtn.addEventListener('click', () => this.createNewFile());
  }
  setupImport() {
    document.addEventListener('dragover', (e) => {
      e.preventDefault();
      document.body.style.backgroundColor = 'rgba(88, 166, 255, 0.1)';
    });
    document.addEventListener('dragleave', () => {
      document.body.style.backgroundColor = '';
    });
    document.addEventListener('drop', (e) => {
      e.preventDefault();
      document.body.style.backgroundColor = '';
      this.handleDrop(e);
    });
  }
  async handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'zip') {
      await this.importZip(file);
    } else {
      const content = await file.text();
      miniVFS.addFile('/' + file.name, content);
    }
    this.fileTree.render();
    alert(`✓ ${file.name} importado com sucesso!`);
    event.target.value = '';
  }
  async importZip(file) {
    const zip = new JSZip();
    const loaded = await zip.loadAsync(file);
    for (const [path, zipFile] of Object.entries(loaded.files)) {
      if (!zipFile.dir) {
        const content = await zipFile.async('text');
        miniVFS.addFile('/' + path, content);
      }
    }
  }
  handleDrop(event) {
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      this.importInput.files = files;
      this.handleImport({ target: { files } });
    }
  }
  selectFile(path) {
    this.currentFile = path;
    const file = miniVFS.getFile(path);
    if (!file) return;
    this.addTab(path);
    this.codeEditor.value = file.content;
    this.updatePreview();
  }
  updateFile() {
    if (!this.currentFile) return;
    const content = this.codeEditor.value;
    miniVFS.updateContent(this.currentFile, content);
    this.updatePreview();
  }
  updatePreview() {
    if (!this.currentFile) return;
    const file = miniVFS.getFile(this.currentFile);
    if (!file) return;
    this.previewFrame.style.display = 'none';
    this.imagePreview.style.display = 'none';
    this.textPreview.style.display = 'none';
    if (file.type === 'html') {
      this.previewFrame.style.display = 'block';
      this.previewFrame.srcDoc = file.content;
    } else if (file.type === 'image') {
      this.imagePreview.style.display = 'flex';
      const blob = new Blob([file.content], { type: 'image/*' });
      const url = URL.createObjectURL(blob);
      this.imagePreview.innerHTML = ``;
    } else if (file.type === 'text' || file.type === 'code' || file.type === 'markdown') {
      this.textPreview.style.display = 'block';
      this.textPreview.innerHTML = `${file.content.replace(//g, '>')}`;
    }
  }
  createNewFile() {
    const name = prompt('Nome do arquivo:');
    if (!name) return;
    miniVFS.addFile('/' + name, '');
    this.fileTree.render();
  }
  addTab(path) {
    this.tabs.add(path);
    this.renderTabs();
  }
  renderTabs() {
    this.editorTabs.innerHTML = Array.from(this.tabs).map(path => {
      const file = miniVFS.getFile(path);
      const isActive = path === this.currentFile;
      return `
        
          ${ file.name }


      `;
    }).join('');
    this.editorTabs.querySelectorAll('.mini-tab-name').forEach(el => {
      el.addEventListener('click', () => this.selectFile(el.dataset.path));
    });
    this.editorTabs.querySelectorAll('.mini-tab-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.tabs.delete(btn.dataset.path);
        if (this.currentFile === btn.dataset.path) {
          this.currentFile = Array.from(this.tabs)[0] || null;
        }
        this.renderTabs();
        if (this.currentFile) this.selectFile(this.currentFile);
      });
    });
  }
  showContextMenu(path) {
    const file = miniVFS.getFile(path);
    if (!file) return;
    const items = [
      { label: 'Baixar', action: () => this.downloadFile(path), icon: 'download' },
      { label: 'Duplicar', action: () => this.duplicateFile(path), icon: 'copy' },
      { label: 'Deletar', action: () => this.deleteFile(path), icon: 'trash', color: 'red' },
    ];
    this.showBottomSheet(file.name, items);
  }
  showBottomSheet(title, items) {
    const sheet = document.createElement('div');
    sheet.className = 'mini-bottom-sheet';
    sheet.innerHTML = `
      
      
        
          ${ title }
          
        
        
          ${
        items.map(item => `
            
              
              ${item.label}
            
          `).join('')
      }


      `;
    document.body.appendChild(sheet);
    const close = () => sheet.remove();
    sheet.querySelector('.mini-sheet-overlay').addEventListener('click', close);
    sheet.querySelector('.btn-icon').addEventListener('click', close);
    sheet.querySelectorAll('.mini-sheet-item').forEach((btn, i) => {
      btn.addEventListener('click', () => {
        items[i].action();
        close();
      });
    });
  }
  downloadFile(path) {
    const file = miniVFS.getFile(path);
    if (!file) return;
    const blob = new Blob([file.content], { type: 'text/plain' });
    saveAs(blob, file.name);
  }
  duplicateFile(path) {
    const file = miniVFS.getFile(path);
    if (!file) return;
    const newPath = path.replace(/(\.[^.]*)?$/, '_copy$1');
    miniVFS.addFile(newPath, file.content);
    this.fileTree.render();
  }
  deleteFile(path) {
    if (!confirm('Deletar arquivo?')) return;
    miniVFS.deleteFile(path);
    this.tabs.delete(path);
    if (this.currentFile === path) {
      this.currentFile = Array.from(this.tabs)[0] || null;
    }
    this.fileTree.render();
    this.renderTabs();
    if (this.currentFile) this.selectFile(this.currentFile);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  window.miniEditor = new MiniEditor();
});