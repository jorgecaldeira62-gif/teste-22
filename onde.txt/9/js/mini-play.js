/**
 * mini-playground.js
 */

class MiniPlayground {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.code = {
      html: '<h1>Hello World</h1>',
      css: 'h1 { color: blue; }',
      js: 'console.log("Playground rodando!");'
    };
    this.currentTab = 'html';
  }

  // Executar código
  run() {
    const combined = `
      <style>${this.code.css}</style>
      ${this.code.html}
      <script>${this.code.js}<\/script>
    `;

    const iframe = document.getElementById('playgroundFrame');
    iframe.srcdoc = combined;
  }

  // Atualizar código
  updateCode(type, content) {
    this.code[type] = content;
    this.run();
  }

  // Renderizar interface
  render() {
    this.container.innerHTML = `
      <div class="playground">
        <div class="playground-tabs">
          <button class="playground-tab ${this.currentTab === 'html' ? 'active' : ''}" data-tab="html">
            <i class="fas fa-code"></i> HTML
          </button>
          <button class="playground-tab ${this.currentTab === 'css' ? 'active' : ''}" data-tab="css">
            <i class="fas fa-palette"></i> CSS
          </button>
          <button class="playground-tab ${this.currentTab === 'js' ? 'active' : ''}" data-tab="js">
            <i class="fas fa-cube"></i> JavaScript
          </button>
        </div>

        <div class="playground-editor">
          <textarea 
            id="playgroundCode" 
            class="playground-textarea"
            placeholder="Digite seu código..."
          >${this.code[this.currentTab]}</textarea>
        </div>

        <div class="playground-preview">
          <iframe id="playgroundFrame" class="playground-frame"></iframe>
        </div>
      </div>
    `;

    this.attachListeners();
    this.run();
  }

  attachListeners() {
    // Tabs
    this.container.querySelectorAll('.playground-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.currentTab = btn.dataset.tab;
        this.render();
      });
    });

    // Editor
    const textarea = document.getElementById('playgroundCode');
    textarea.addEventListener('input', (e) => {
      this.updateCode(this.currentTab, e.target.value);
    });
  }
}

const miniPlayground = new MiniPlayground('playgroundContainer');
