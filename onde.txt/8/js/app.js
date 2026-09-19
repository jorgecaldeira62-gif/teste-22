/**
 * SK Code Editor - Aplicação Principal com FileTree + GitHub
 */

class CodeEditorWithFileTree {
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
  <p>Projeto criado no SK Code Editor</p>
  <script src="script.js"><\/script>
</body>
</html>`,
      'style.css': `body {
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
  color: #333;
  padding: 20px;
}

h1 {
  color: #0066cc;
}`,
      'script.js': `console.log('SK Code Editor carregado!');`
    };

    this.selectedFile = 'index.html';
    this.setupElements();
    this.setupFileTree();
    this.setupGitHub();
    this.setupEventListeners();
    this.loadFile(this.selectedFile);
  }

  setupElements() {
    this.fileTreeContainer = document.getElementById('fileTreeContainer');
    this.codeEditor = document.getElementById('codeEditor');
    this.previewFrame = document.getElementById('previewFrame');
    this.projectNameInput = document.getElementById('projectName');
    this.fileCountSpan = document.getElementById('fileCount');
    this.toggleGitHubBtn = document.getElementById('toggleGitHubBtn');
    this.githubPanel = document.getElementById('githubPanel');
  }

  setupFileTree() {
    // Inicializar VFS com arquivos
    for (const [path, content] of Object.entries(this.files)) {
      vfs.createFile(path, content);
    }

    // Criar FileTree
    window.fileTree = new FileTree('fileTreeContainer', {
      vfs: vfs,
      projectName: this.projectNameInput.value,
      githubConnected: githubService.isAuthenticated(),
      githubRepo: 'seu-repo',

      // Callbacks
      onFileSelect: (path) => this.selectFile(path),
      onFileCreate: (path) => this.onFileCreated(path),
      onFolderCreate: (path) => this.onFolderCreated(path),
      onDelete: (path) => this.onNodeDeleted(path),
      onRename: (path, newName) => this.onNodeRenamed(path, newName),
      onDuplicate: (path) => this.onNodeDuplicated(path),

      // GitHub callbacks
      onPushGitHub: (data) => this.pushToGitHub(data),
      onPullGitHub: () => this.pullFromGitHub(),
      onSyncGitHub: (data) => this.syncGitHub(data),
      onExportZip: () => this.exportZip()
    });
  }

  setupGitHub() {
    window.githubPanel = new GitHubPanel();
  }

  setupEventListeners() {
    this.codeEditor.addEventListener('input', (e) => this.updateFile(e.target.value));
    this.projectNameInput.addEventListener('change', (e) => {
      window.fileTree.setProjectName(e.target.value);
    });
    this.toggleGitHubBtn.addEventListener('click', () => {
      this.githubPanel.toggle();
      if (githubService.isAuthenticated()) {
        window.fileTree.updateGitHubStatus(true, 'seu-repo');
      }
    });
  }

  selectFile(path) {
    this.selectedFile = path;
    this.loadFile(path);
  }

  loadFile(path) {
    const content = vfs.getFileContent(path) || '';
    this.codeEditor.value = content;
    this.updatePreview();
  }

  updateFile(content) {
    vfs.updateFileContent(this.selectedFile, content);
    this.updatePreview();
  }

  updatePreview() {
    if (this.selectedFile.endsWith('.html')) {
      this.previewFrame.srcDoc = vfs.getFileContent(this.selectedFile) || '';
    } else {
      const content = vfs.getFileContent(this.selectedFile) || '';
      this.previewFrame.srcdoc = `<pre style="padding: 20px; font-family: monospace; white-space: pre-wrap; word-wrap: break-word;">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
    }
  }

  onFileCreated(path) {
    console.log('Arquivo criado:', path);
  }

  onFolderCreated(path) {
    console.log('Pasta criada:', path);
  }

  onNodeDeleted(path) {
    if (this.selectedFile === path) {
      this.selectedFile = null;
      this.codeEditor.value = '';
    }
  }

  onNodeRenamed(path, newName) {
    console.log('Renomeado:', path, '->', newName);
  }

  onNodeDuplicated(path) {
    console.log('Duplicado:', path);
  }

  exportZip() {
    console.log('Exportando como ZIP...');
  }

  // ─── GitHub Integration ────────────────────────────────────────
  async pushToGitHub(data) {
    if (!githubService.isAuthenticated()) {
      alert('Conecte ao GitHub primeiro!');
      return;
    }

    try {
      const result = await githubService.pushAllFiles(
        githubService.credentials.username,
        'seu-repo',
        data.files,
        data.message
      );
      alert(`✓ Enviado! ${result.success} arquivo(s)`);
    } catch (error) {
      alert(`Erro: ${error.message}`);
    }
  }

  async pullFromGitHub() {
    if (!githubService.isAuthenticated()) {
      alert('Conecte ao GitHub primeiro!');
      return;
    }

    try {
      const imported = await githubService.cloneRepo(
        githubService.credentials.username,
        'seu-repo'
      );
      window.fileTree.importFiles(imported);
      alert(`✓ ${Object.keys(imported).length} arquivo(s) importado(s)!`);
    } catch (error) {
      alert(`Erro: ${error.message}`);
    }
  }

  async syncGitHub(data) {
    if (!githubService.isAuthenticated()) {
      alert('Conecte ao GitHub primeiro!');
      return;
    }

    try {
      const result = await githubService.pushAllFiles(
        githubService.credentials.username,
        'seu-repo',
        data.files,
        `Sincronizado - ${new Date().toLocaleDateString('pt-BR')}`
      );
      alert(`✓ Sincronizado! ${result.success} arquivo(s)`);
    } catch (error) {
      alert(`Erro: ${error.message}`);
    }
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.app = new CodeEditorWithFileTree();
});
