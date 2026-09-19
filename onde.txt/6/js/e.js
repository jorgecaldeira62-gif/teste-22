document.addEventListener('DOMContentLoaded', () => {
  const editor = document.getElementById('editor');
  const newFileBtn = document.getElementById('new-file-btn');
  const importBtn = document.getElementById('import-btn');
  const exportBtn = document.getElementById('export-btn');
  const githubBtn = document.getElementById('github-btn');
  const themeToggle = document.getElementById('theme-toggle');
  const refreshPreview = document.getElementById('refresh-preview');
  const zipInput = document.getElementById('zip-input');

  editor.addEventListener('input', () => {
    miniTabs.saveContent();
    miniPreview.update();
  });

  newFileBtn.addEventListener('click', () => {
    const name = prompt('Nome do arquivo:');
    if (name) {
      miniVFS.addFile('/' + name, '');
      miniFileTree.refresh();
    }
  });

  importBtn.addEventListener('click', () => {
    zipInput.click();
  });

  zipInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
      miniImportExport.importZip(e.target.files[0], () => {
        alert('Projeto importado! ✅');
      });
    }
  });

  exportBtn.addEventListener('click', () => {
    const files = miniVFS.getAllFiles();
    miniImportExport.exportZip(files);
  });

  githubBtn.addEventListener('click', () => {
    const token = prompt('GitHub Token:');
    const repo = prompt('Repositório (owner/repo):');
    if (token && repo) {
      miniGitHub.setCredentials(token, repo);
      miniGitHub.push();
    }
  });

  themeToggle.addEventListener('click', () => {
    miniTheme.toggle();
    themeToggle.textContent = miniTheme.theme === 'dark' ? '☀️' : '🌙';
  });

  refreshPreview.addEventListener('click', () => {
    miniPreview.update();
  });

  // Criar arquivo de exemplo
  if (miniVFS.getAllFiles().length === 0) {
    miniVFS.addFile('/index.html', '<!DOCTYPE html>\n<html>\n<head>\n  <title>Bem-vindo</title>\n</head>\n<body>\n  <h1>SK Mini Editor</h1>\n  <p>Comece a editar!</p>\n</body>\n</html>');
    miniFileTree.refresh();
  }

  themeToggle.textContent = miniTheme.theme === 'dark' ? '☀️' : '🌙';
});
