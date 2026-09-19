<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SK Code Editor - GitHub Integration</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
  <div id="app" class="app-container">
    <!-- Header -->
    <header class="app-header">
      <div class="header-left">
        <i class="fas fa-code"></i>
        <div class="header-title">
          <h1>SK Code Editor</h1>
          <p>Com integração GitHub</p>
        </div>
      </div>
      <div class="header-right">
        <input 
          type="text" 
          id="projectName" 
          class="project-name-input" 
          placeholder="Nome do projeto"
          value="Meu Projeto Web"
        >
        <span class="file-count">
          <span id="fileCount">3</span> arquivo(s)
        </span>
      </div>
    </header>

    <!-- Main Container -->
    <div class="main-container">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>Arquivos</h2>
          <button id="newFileBtn" class="btn-icon" title="Novo arquivo">
            <i class="fas fa-plus"></i>
          </button>
        </div>

        <div id="filesList" class="files-list">
          <!-- Arquivos serão adicionados aqui -->
        </div>

        <div class="sidebar-footer">
          <button id="toggleGitHubBtn" class="btn-primary">
            <i class="fas fa-github"></i>
            <span>GitHub</span>
          </button>
        </div>
      </aside>

      <!-- Main Editor Area -->
      <main class="editor-area" id="editorArea">
        <!-- Abas dos arquivos -->
        <div class="editor-tabs" id="editorTabs">
          <!-- Abas serão adicionadas aqui -->
        </div>

        <!-- Editor e Preview -->
        <div class="editor-container">
          <textarea 
            id="codeEditor" 
            class="code-editor" 
            spellcheck="false"
            placeholder="Selecione um arquivo para editar..."
          ></textarea>

          <div class="preview-panel">
            <div class="preview-header">
              <span>Preview</span>
              <button id="refreshPreviewBtn" class="btn-icon" title="Atualizar preview">
                <i class="fas fa-sync"></i>
              </button>
            </div>
            <iframe id="previewFrame" class="preview-frame"></iframe>
          </div>
        </div>
      </main>

      <!-- GitHub Panel -->
      <aside class="github-panel" id="githubPanel" style="display: none;">
        <div class="github-header">
          <h2>GitHub</h2>
          <button id="closeGitHubBtn" class="btn-icon">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div id="githubContent" class="github-content">
          <!-- Conteúdo do GitHub será adicionado aqui -->
        </div>
      </aside>
    </div>
  </div>

  <!-- Scripts -->
  <script src="js/github-service.js"></script>
  <script src="js/github-panel.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
