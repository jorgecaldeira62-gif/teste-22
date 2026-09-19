/**
 * GitHub Panel - Interface do GitHub
 */

class GitHubPanel {
  constructor() {
    this.panel = document.getElementById('githubPanel');
    this.content = document.getElementById('githubContent');
    this.toggleBtn = document.getElementById('toggleGitHubBtn');
    this.closeBtn = document.getElementById('closeGitHubBtn');
    this.projectNameInput = document.getElementById('projectName');

    this.currentView = 'setup'; // setup, main, push-new, push-existing, clone
    this.selectedRepo = null;

    this.setupEventListeners();
    this.render();
  }

  setupEventListeners() {
    this.toggleBtn.addEventListener('click', () => this.toggle());
    this.closeBtn.addEventListener('click', () => this.hide());
  }

  toggle() {
    if (this.panel.style.display === 'none') {
      this.show();
    } else {
      this.hide();
    }
  }

  show() {
    this.panel.style.display = 'flex';
    this.render();
  }

  hide() {
    this.panel.style.display = 'none';
  }

  render() {
    if (githubService.isAuthenticated()) {
      this.renderMain();
    } else {
      this.renderSetup();
    }
  }

  // ─── Setup Screen ──────────────────────────────────────────────────
  renderSetup() {
    this.content.innerHTML = `
      <div class="github-setup">
        <div class="github-setup-header">
          <h3><i class="fas fa-code-branch"></i> Conectar ao GitHub</h3>
          <p>Faça isso uma vez só — salva automaticamente</p>
        </div>

        <div class="github-steps">
          <div class="github-step">
            <div class="github-step-number">1</div>
            <div class="github-step-content">
              <h4>Abra o GitHub no navegador</h4>
              <p>Clique no link abaixo para ir direto para a página de criação de token</p>
              <div class="github-step-action">
                <a href="https://github.com/settings/tokens/new?scopes=repo,read:user&description=SK+Code+Editor" 
                   target="_blank" rel="noopener noreferrer" class="btn-github-link">
                  <i class="fas fa-external-link-alt"></i>
                  Criar Token no GitHub
                </a>
              </div>
            </div>
          </div>

          <div class="github-step">
            <div class="github-step-number">2</div>
            <div class="github-step-content">
              <h4>Gere o token</h4>
              <p>Na página que abrir, role até o fim e clique em "Generate token". Copie o código que aparecer (começa com ghp_).</p>
            </div>
          </div>

          <div class="github-step">
            <div class="github-step-number">3</div>
            <div class="github-step-content">
              <h4>Cole o token aqui</h4>
              <p>O token só aparece uma vez — cole agora antes de fechar o GitHub.</p>
            </div>
          </div>
        </div>

        <div class="github-token-input-group">
          <label for="tokenInput">Token</label>
          <input 
            type="password" 
            id="tokenInput" 
            class="github-token-input" 
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          >
          <div id="tokenError" class="github-error" style="display: none;">
            <i class="fas fa-exclamation-circle"></i>
            <span id="tokenErrorMsg"></span>
          </div>
        </div>

        <button id="connectBtn" class="btn-connect">
          <i class="fas fa-check-circle"></i>
          Conectar ao GitHub
        </button>
      </div>
    `;

    const tokenInput = document.getElementById('tokenInput');
    const connectBtn = document.getElementById('connectBtn');
    const tokenError = document.getElementById('tokenError');
    const tokenErrorMsg = document.getElementById('tokenErrorMsg');

    tokenInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') connectBtn.click();
    });

    connectBtn.addEventListener('click', async () => {
      const token = tokenInput.value.trim();
      if (!token) return;

      connectBtn.disabled = true;
      connectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
      tokenError.style.display = 'none';

      const result = await githubService.validateToken(token);

      if (result.success) {
        githubService.saveCredentials({
          token,
          username: result.username
        });
        this.render();
      } else {
        tokenErrorMsg.textContent = result.error;
        tokenError.style.display = 'flex';
        connectBtn.disabled = false;
        connectBtn.innerHTML = '<i class="fas fa-check-circle"></i> Conectar ao GitHub';
      }
    });
  }

  // ─── Main Screen ───────────────────────────────────────────────────
  renderMain() {
    const fileCount = Object.keys(app.files).length;

    this.content.innerHTML = `
      <div class="github-main">
        <div class="github-user-badge">
          <i class="fas fa-check-circle"></i>
          <span class="username">@${githubService.credentials.username}</span>
          <span class="status">conectado</span>
          <span class="disconnect"><i class="fas fa-sign-out-alt"></i></span>
        </div>

        <div class="github-section">
          <div class="github-section-title">Projeto Atual</div>
          <div style="padding: 0.75rem; background-color: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 0.375rem; font-size: 0.875rem;">
            <p style="font-weight: 600; margin-bottom: 0.25rem;">${this.projectNameInput.value}</p>
            <p style="color: var(--text-secondary); font-size: 0.75rem;">${fileCount} arquivo${fileCount !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div class="github-section">
          <div class="github-section-title">Enviar para GitHub</div>
          <button class="github-action-btn" id="pushNewBtn">
            <i class="fas fa-plus"></i>
            <div class="github-action-btn-content">
              <div class="github-action-btn-title">Criar repositório novo</div>
              <div class="github-action-btn-desc">Cria um repo novo e sobe todos os arquivos</div>
            </div>
            <i class="fas fa-chevron-right github-action-btn-arrow"></i>
          </button>

          <button class="github-action-btn" id="pushExistingBtn">
            <i class="fas fa-upload"></i>
            <div class="github-action-btn-content">
              <div class="github-action-btn-title">Enviar para repo existente</div>
              <div class="github-action-btn-desc">Atualiza um repositório que já existe</div>
            </div>
            <i class="fas fa-chevron-right github-action-btn-arrow"></i>
          </button>
        </div>

        <div class="github-section">
          <div class="github-section-title">Baixar do GitHub</div>
          <button class="github-action-btn" id="cloneBtn">
            <i class="fas fa-download"></i>
            <div class="github-action-btn-content">
              <div class="github-action-btn-title">Importar repositório</div>
              <div class="github-action-btn-desc">Baixa um repositório para editar aqui</div>
            </div>
            <i class="fas fa-chevron-right github-action-btn-arrow"></i>
          </button>
        </div>

        <div id="statusContainer"></div>
      </div>
    `;

    // Event listeners
    document.querySelector('.disconnect').addEventListener('click', () => {
      if (confirm('Desconectar do GitHub?')) {
        githubService.clearCredentials();
        this.render();
      }
    });

    document.getElementById('pushNewBtn').addEventListener('click', () => this.renderPushNew());
    document.getElementById('pushExistingBtn').addEventListener('click', () => this.renderPushExisting());
    document.getElementById('cloneBtn').addEventListener('click', () => this.renderClone());
  }

  // ─── Push New ──────────────────────────────────────────────────────
  renderPushNew() {
    const projectName = this.projectNameInput.value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');

    this.content.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
          <button id="backBtn" class="btn-icon">
            <i class="fas fa-arrow-left"></i>
          </button>
          <h3 style="font-size: 0.875rem; font-weight: 600;">Criar repositório e enviar</h3>
        </div>

        <div class="github-token-input-group">
          <label>Nome do Repositório</label>
          <input type="text" id="repoName" class="github-token-input" value="${projectName}" placeholder="meu-projeto">
          <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">
            Será criado como: github.com/${githubService.credentials.username}/<span id="repoNamePreview">${projectName || '...'}</span>
          </p>
        </div>

        <div class="github-token-input-group">
          <label>Descrição (opcional)</label>
          <input type="text" id="repoDesc" class="github-token-input" placeholder="Descrição do projeto...">
        </div>

        <div class="github-token-input-group">
          <label>Mensagem do envio</label>
          <input type="text" id="commitMsg" class="github-token-input" value="Enviado pelo SK Code Editor - ${new Date().toLocaleDateString('pt-BR')}">
        </div>

        <button id="privateToggle" class="github-action-btn">
          <i class="fas fa-unlock"></i>
          <div class="github-action-btn-content">
            <div class="github-action-btn-title">Repositório Público</div>
            <div class="github-action-btn-desc">Qualquer pessoa pode ver</div>
          </div>
        </button>

        <div id="statusContainer"></div>

        <button id="sendBtn" class="btn-connect">
          <i class="fas fa-upload"></i>
          Criar e Enviar
        </button>
      </div>
    `;

    const repoName = document.getElementById('repoName');
    const repoNamePreview = document.getElementById('repoNamePreview');
    const privateToggle = document.getElementById('privateToggle');
    const sendBtn = document.getElementById('sendBtn');
    const backBtn = document.getElementById('backBtn');
    let isPrivate = false;

    repoName.addEventListener('input', (e) => {
      const clean = e.target.value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '');
      repoNamePreview.textContent = clean || '...';
    });

    privateToggle.addEventListener('click', () => {
      isPrivate = !isPrivate;
      const icon = privateToggle.querySelector('i');
      const title = privateToggle.querySelector('.github-action-btn-title');
      const desc = privateToggle.querySelector('.github-action-btn-desc');

      if (isPrivate) {
        icon.className = 'fas fa-lock';
        title.textContent = 'Repositório Privado';
        desc.textContent = 'Só você vê';
        privateToggle.style.backgroundColor = 'rgba(218, 54, 51, 0.1)';
      } else {
        icon.className = 'fas fa-unlock';
        title.textContent = 'Repositório Público';
        desc.textContent = 'Qualquer pessoa pode ver';
        privateToggle.style.backgroundColor = 'transparent';
      }
    });

    backBtn.addEventListener('click', () => this.renderMain());

    sendBtn.addEventListener('click', async () => {
      const name = repoName.value.trim();
      if (!name) return;

      sendBtn.disabled = true;
      sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

      try {
        this.showStatus('Criando repositório...', 'info');
        await githubService.createRepo(name, document.getElementById('repoDesc').value, isPrivate);

        this.showStatus('Enviando arquivos...', 'info');
        const result = await githubService.pushAllFiles(
          githubService.credentials.username,
          name,
          app.files,
          document.getElementById('commitMsg').value
        );

        this.showStatus(
          `✓ Enviado! ${result.success} arquivo(s) no repositório "${name}"`,
          'success'
        );

        setTimeout(() => this.renderMain(), 2000);
      } catch (error) {
        this.showStatus(`Erro: ${error.message}`, 'error');
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-upload"></i> Criar e Enviar';
      }
    });
  }

  // ─── Push Existing ────────────────────────────────────────────────
  async renderPushExisting() {
    this.content.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
          <button id="backBtn" class="btn-icon">
            <i class="fas fa-arrow-left"></i>
          </button>
          <h3 style="font-size: 0.875rem; font-weight: 600;">Enviar para repositório</h3>
          <button id="refreshBtn" class="btn-icon" style="margin-left: auto;">
            <i class="fas fa-sync"></i>
          </button>
        </div>

        <div id="reposList" style="max-height: 300px; overflow-y: auto;">
          <p style="text-align: center; color: var(--text-secondary); padding: 1rem;">
            <i class="fas fa-spinner fa-spin"></i> Carregando repositórios...
          </p>
        </div>

        <div id="statusContainer"></div>
      </div>
    `;

    const backBtn = document.getElementById('backBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const reposList = document.getElementById('reposList');

    backBtn.addEventListener('click', () => this.renderMain());
    refreshBtn.addEventListener('click', () => this.renderPushExisting());

    try {
      const repos = await githubService.listRepos();
      this.renderReposList(repos, 'push');
    } catch (error) {
      reposList.innerHTML = `
        <div class="github-error">
          <i class="fas fa-exclamation-circle"></i>
          <span>Erro ao buscar repositórios: ${error.message}</span>
        </div>
      `;
    }
  }

  // ─── Clone ────────────────────────────────────────────────────────
  async renderClone() {
    this.content.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
          <button id="backBtn" class="btn-icon">
            <i class="fas fa-arrow-left"></i>
          </button>
          <h3 style="font-size: 0.875rem; font-weight: 600;">Importar repositório</h3>
          <button id="refreshBtn" class="btn-icon" style="margin-left: auto;">
            <i class="fas fa-sync"></i>
          </button>
        </div>

        <div id="reposList" style="max-height: 300px; overflow-y: auto;">
          <p style="text-align: center; color: var(--text-secondary); padding: 1rem;">
            <i class="fas fa-spinner fa-spin"></i> Carregando repositórios...
          </p>
        </div>

        <div id="statusContainer"></div>
      </div>
    `;

    const backBtn = document.getElementById('backBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const reposList = document.getElementById('reposList');

    backBtn.addEventListener('click', () => this.renderMain());
    refreshBtn.addEventListener('click', () => this.renderClone());

    try {
      const repos = await githubService.listRepos();
      this.renderReposList(repos, 'clone');
    } catch (error) {
      reposList.innerHTML = `
        <div class="github-error">
          <i class="fas fa-exclamation-circle"></i>
          <span>Erro ao buscar repositórios: ${error.message}</span>
        </div>
      `;
    }
  }

  renderReposList(repos, action) {
    const reposList = document.getElementById('reposList');

    if (repos.length === 0) {
      reposList.innerHTML = `
        <p style="text-align: center; color: var(--text-secondary); padding: 1rem;">
          Nenhum repositório encontrado
        </p>
      `;
      return;
    }

    reposList.innerHTML = repos.map(repo => `
      <button class="github-action-btn repo-item" data-owner="${repo.owner.login}" data-name="${repo.name}" data-action="${action}">
        <i class="fas fa-${repo.private ? 'lock' : 'globe'}"></i>
        <div class="github-action-btn-content">
          <div class="github-action-btn-title">${repo.full_name}</div>
          ${repo.description ? `<div class="github-action-btn-desc">${repo.description}</div>` : ''}
        </div>
        <i class="fas fa-${action === 'clone' ? 'download' : 'upload'} github-action-btn-arrow"></i>
      </button>
    `).join('');

    document.querySelectorAll('.repo-item').forEach(btn => {
      btn.addEventListener('click', async () => {
        const owner = btn.dataset.owner;
        const name = btn.dataset.name;
        const actionType = btn.dataset.action;

        if (actionType === 'clone') {
          await this.handleClone(owner, name);
        } else {
          await this.handlePushExisting(owner, name);
        }
      });
    });
  }

  async handleClone(owner, repo) {
    this.showStatus('Baixando repositório...', 'info');

    try {
      const files = await githubService.cloneRepo(owner, repo);

      if (Object.keys(files).length === 0) {
        throw new Error('Nenhum arquivo encontrado. O repositório é privado ou não existe.');
      }

      app.importFiles(files);
      this.showStatus(`✓ ${Object.keys(files).length} arquivo(s) importado(s)!`, 'success');

      setTimeout(() => {
        this.hide();
        this.renderMain();
      }, 2000);
    } catch (error) {
      this.showStatus(`Erro: ${error.message}`, 'error');
    }
  }

  async handlePushExisting(owner, repo) {
    const commitMsg = prompt('Mensagem do commit:', `Atualizado pelo SK Code Editor - ${new Date().toLocaleDateString('pt-BR')}`);
    if (!commitMsg) return;

    this.showStatus('Enviando arquivos...', 'info');

    try {
      const result = await githubService.pushAllFiles(owner, repo, app.files, commitMsg);
      this.showStatus(
        `✓ Enviado! ${result.success} arquivo(s) atualizados em "${owner}/${repo}"`,
        'success'
      );

      setTimeout(() => this.renderMain(), 2000);
    } catch (error) {
      this.showStatus(`Erro: ${error.message}`, 'error');
    }
  }

  showStatus(message, type = 'info') {
    const container = document.getElementById('statusContainer');
    if (!container) return;

    const statusClass = type === 'error' ? 'error' : type === 'success' ? 'success' : 'info';
    const icon = type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle';

    container.innerHTML = `
      <div class="github-status ${statusClass}">
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
      </div>
    `;
  }
}

// Instância global
let githubPanel;

document.addEventListener('DOMContentLoaded', () => {
  githubPanel = new GitHubPanel();
});
