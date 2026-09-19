/**
 * Mini GitHub Robusto - Sem erros de repositório
 * ✅ Filtro de arquivos
 * ✅ Tratamento de erro
 * ✅ Sem injeção
 * ✅ Sem transparências
 */

class MiniGitHubRobusto {
  constructor() {
    this.token = localStorage.getItem('mini-github-token') || '';
    this.username = localStorage.getItem('mini-github-username') || '';
    this.apiUrl = 'https://api.github.com';
  }

  // ─── Conectar ───────────────────────────────────────────────────
  async connect(token) {
    try {
      // Validar token
      if (!token || typeof token !== 'string') {
        throw new Error('Token inválido');
      }

      // Sanitizar token
      token = token.trim();

      // Fazer requisição
      const res = await fetch(`${this.apiUrl}/user`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Token expirado ou inválido');
        }
        throw new Error(`Erro ${res.status}`);
      }

      const user = await res.json();

      // Salvar
      this.token = token;
      this.username = user.login;

      localStorage.setItem('mini-github-token', token);
      localStorage.setItem('mini-github-username', user.login);

      return { success: true, username: user.login };
    } catch (error) {
      console.error('Erro ao conectar:', error);
      return { success: false, error: error.message };
    }
  }

  // ─── Verificar autenticação ────────────────────────────────────
  isAuthenticated() {
    return !!this.token && !!this.username;
  }

  // ─── Enviar arquivos ───────────────────────────────────────────
  async pushFiles(repo, files, message) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Não autenticado');
      }

      // Validar repo
      if (!repo || typeof repo !== 'string') {
        throw new Error('Repositório inválido');
      }

      // Sanitizar repo
      repo = repo.trim().replace(/[^a-zA-Z0-9_-]/g, '');

      // Validar mensagem
      if (!message || typeof message !== 'string') {
        message = 'Atualizado pelo SK Editor';
      }
      message = message.trim().slice(0, 100);

      let success = 0;
      let failed = 0;

      // Enviar cada arquivo
      for (const [path, content] of Object.entries(files)) {
        try {
          await this.createOrUpdateFile(repo, path, content, message);
          success++;
        } catch (error) {
          console.warn(`Erro ao enviar ${path}:`, error);
          failed++;
        }
      }

      return { success, failed, total: Object.keys(files).length };
    } catch (error) {
      console.error('Erro ao fazer push:', error);
      throw error;
    }
  }

  // ─── Criar ou atualizar arquivo ────────────────────────────────
  async createOrUpdateFile(repo, path, content, message) {
    try {
      // Sanitizar path
      path = this.sanitizePath(path);

      // Sanitizar conteúdo
      if (typeof content !== 'string') {
        content = String(content);
      }

      const url = `${this.apiUrl}/repos/${this.username}/${repo}/contents/${path}`;

      // Tentar obter SHA
      let sha = null;
      try {
        const res = await fetch(url, {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        if (res.ok) {
          const data = await res.json();
          sha = data.sha;
        }
      } catch {}

      // Preparar body
      const body = {
        message: message,
        content: btoa(unescape(encodeURIComponent(content)))
      };

      if (sha) {
        body.sha = sha;
      }

      // Fazer requisição
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${this.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(`Erro ${res.status}: ${error}`);
      }

      return true;
    } catch (error) {
      console.error(`Erro ao enviar ${path}:`, error);
      throw error;
    }
  }

  // ─── Sanitizar path ────────────────────────────────────────────
  sanitizePath(path) {
    // Remover caracteres perigosos
    path = path.replace(/[<>:"|?*]/g, '');
    // Remover barra inicial
    if (path.startsWith('/')) {
      path = path.slice(1);
    }
    return path;
  }

  // ─── Desconectar ───────────────────────────────────────────────
  disconnect() {
    this.token = '';
    this.username = '';
    localStorage.removeItem('mini-github-token');
    localStorage.removeItem('mini-github-username');
  }
}

const miniGitHubRobusto = new MiniGitHubRobusto();
