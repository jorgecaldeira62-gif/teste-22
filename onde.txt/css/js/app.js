/**
 * SK Code Editor - Aplicação Principal
 */

class CodeEditor {
  constructor() {
    this.files = {
      'index.html': `<!DOCTYPE html>
<html>
<head>
  <title>Meu Projeto</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Olá, Mundo!</h1>
  <p>Este é um projeto criado no SK Code Editor</p>
  <script src="script.js"><\/script>
</body>
</html>`,
      'style.css': `body {
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
  color: #333;
  margin: 0;
  padding: 20px;
}

h1 {
  color: #0066cc;
  border-bottom: 2px solid #0066cc;
  padding-bottom: 10px;
}`,
      'script.js': `console.log('SK Code Editor carregado!');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM pronto para interação');
});`
    };

    this.selectedFile = 'index.html';
    this.setupElements();
    this.setupEventListeners();
    this.render();
  }

  setupElements() {
    this.filesList = document.getElementById('filesList');
    this.editorTabs = document.getElementById('editorTabs');
    this.codeEditor = document.getElementById('codeEditor');
    this.previewFrame = document.getElementById('previewFrame');
    this.fileCountSpan = document.getElementById('fileCount');
    this.newFileBtn = document.getElementById('newFileBtn');
    this.refreshPreviewBtn = document.getElementById('refreshPreviewBtn');
  }

  setupEventListeners() {
    this.newFileBtn.addEventListener('click', () => this.createNewFile());
    this.codeEditor.addEventListener('input', (e) => this.updateFile(e.target.value));
    this.refreshPreviewBtn.addEventListener('click', () => this.updatePreview());
  }

  render() {
    this.renderFilesList();
    this.renderTabs();
    this.loadFile(this.selectedFile);
    this.updateFileCount();
  }

  renderFilesList() {
    this.filesList.innerHTML = Object.keys(this.files).map(filename => `
      <div class="file-item ${filename === this.selectedFile ? 'active' : ''}" data-file="${filename}">
        <div class="file-item-name">
          <i class="fas fa-${this.getFileIcon(filename)}"></i>
          <span>${filename}</span>
        </div>
        <div class="file-item-delete" data-file="${filename}">
          <i class="fas fa-trash"></i>
        </div>
      </div>
    `).join('');

    // Event listeners para items
    document.querySelectorAll('.file-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.file-item-delete')) {
          this.selectFile(item.dataset.file);
        }
      });
    });

    document.querySelectorAll('.file-item-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteFile(btn.dataset.file);
      });
    });
  }

  renderTabs() {
    this.editorTabs.innerHTML = Object.keys(this.files).map(filename => `
      <button class="editor-tab ${filename === this.selectedFile ? 'active' : ''}" data-file="${filename}">
        ${filename}
      </button>
    `).join('');

    document.querySelectorAll('.editor-tab').forEach(tab => {
      tab.addEventListener('click', () => this.selectFile(tab.dataset.file));
    });
  }

  selectFile(filename) {
    this.selectedFile = filename;
    this.render();
  }

  loadFile(filename) {
    const content = this.files[filename] || '';
    this.codeEditor.value = content;
    this.updatePreview();
  }

  updateFile(content) {
    this.files[this.selectedFile] = content;
    this.updateFileCount();
    this.updatePreview();
  }

  updateFileCount() {
    this.fileCountSpan.textContent = Object.keys(this.files).length;
  }

  updatePreview() {
    if (this.selectedFile.endsWith('.html')) {
      this.previewFrame.srcDoc = this.files[this.selectedFile];
    } else {
      this.previewFrame.srcdoc = '<pre style="padding: 20px; font-family: monospace;">' +
        this.files[this.selectedFile].replace(/</g, '&lt;').replace(/>/g, '&gt;') +
        '</pre>';
    }
  }

  createNewFile() {
    const name = prompt('Nome do arquivo:');
    if (name && !this.files[name]) {
      this.files[name] = '';
      this.selectedFile = name;
      this.render();
    } else if (this.files[name]) {
      alert('Arquivo já existe!');
    }
  }

  deleteFile(filename) {
    if (confirm(`Deletar ${filename}?`)) {
      delete this.files[filename];
      if (this.selectedFile === filename) {
        this.selectedFile = Object.keys(this.files)[0] || '';
      }
      this.render();
    }
  }

  importFiles(files) {
    this.files = { ...this.files, ...files };
    this.selectedFile = Object.keys(files)[0] || this.selectedFile;
    this.render();
  }

  getFileIcon(filename) {
    if (filename.endsWith('.html')) return 'file-code';
    if (filename.endsWith('.css')) return 'file-code';
    if (filename.endsWith('.js')) return 'file-code';
    if (filename.endsWith('.json')) return 'file-code';
    if (filename.endsWith('.md')) return 'file-alt';
    return 'file';
  }
}

// Instância global
let app;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  app = new CodeEditor();
});
