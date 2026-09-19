class MiniEvents {
  static setupEditorEvents() {
    const editor = document.getElementById('editor');

    editor.addEventListener('input', () => {
      if (miniTabs.currentTab) {
        miniTabs.markModified(miniTabs.currentTab);
        miniPreview.update();
      }
    });

    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.value = editor.value.substring(0, start) + '\t' + editor.value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + 1;
      }
    });

    editor.addEventListener('change', () => {
      miniTabs.saveContent();
    });
  }

  static setupFileTreeEvents() {
    const newFileBtn = document.getElementById('new-file-btn');
    const newFolderBtn = document.getElementById('new-folder-btn');
    const importBtn = document.getElementById('import-btn');
    const exportBtn = document.getElementById('export-btn');
    const githubBtn = document.getElementById('github-btn');
    const clearBtn = document.getElementById('clear-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const zipInput = document.getElementById('zip-input');
    const closeAllTabs = document.getElementById('close-all-tabs');
    const refreshPreview = document.getElementById('refresh-preview');

    newFileBtn.addEventListener('click', () => {
      const name = prompt('Nome do arquivo:');
      if (name && MiniValidator.isValidFilename(name)) {
        miniVFS.addFile('/' + name, '');
        miniFileTree.refresh();
      }
    });

    newFolderBtn.addEventListener('click', () => {
      const name = prompt('Nome da pasta:');
      if (name && MiniValidator.isValidFilename(name)) {
        miniVFS.addFolder('/' + name);
        miniFileTree.refresh();
      }
    });

    importBtn.addEventListener('click', () => {
      zipInput.click();
    });

    zipInput.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        miniImportExport.importProject(e.target.files[0]);
      }
    });

    exportBtn.addEventListener('click', () => {
      miniImportExport.exportProject();
    });

    githubBtn.addEventListener('click', () => {
      const token = prompt('GitHub Token (Personal Access Token):');
      if (token) {
        const repo = prompt('Repositório (formato: owner/repo):');
        if (repo) {
          miniGitHub.setCredentials(token, repo);
          miniGitHub.push();
        }
      }
    });

    clearBtn.addEventListener('click', () => {
      if (confirm('⚠️ Tem certeza? Isso vai deletar TODOS os arquivos!')) {
        miniVFS.clear();
        miniFileTree.refresh();
        miniTabs.closeAllTabs();
      }
    });

    themeToggle.addEventListener('click', () => {
      miniTheme.toggle();
      themeToggle.textContent = miniTheme.theme === 'dark' ? '☀️' : '🌙';
    });

    closeAllTabs.addEventListener('click', () => {
      miniTabs.closeAllTabs();
    });

    refreshPreview.addEventListener('click', () => {
      miniPreview.update();
    });
  }
}
