/**
 * GitHub Service - Gerencia interações com GitHub API
 */

class GitHubService {
  constructor() {
    this.apiBaseUrl = 'https://api.github.com';
    this.credentials = this.loadCredentials();
  }

  // ─── Credenciais ───────────────────────────────────────────────────
  loadCredentials() {
    try {
      const saved = localStorage.getItem('github-credentials');
      return saved ? JSON.parse(saved) : { token: '', username: '' };
    } catch {
      return { token: '', username: '' };
    }
  }

  saveCredentials(creds) {
    this.credentials = creds;
    localStorage.setItem('github-credentials', JSON.stringify(creds));
  }

  clearCredentials() {
    this.credentials = { token: '', username: '' };
    localStorage.removeItem('github-credentials');
  }

  isAuthenticated() {
    return !!this.credentials.token;
  }

  // ─── Autenticação ──────────────────────────────────────────────────
  async validateToken(token) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('Token inválido ou sem permissão');
      }

      const user = await response.json();
      return { success: true, username: user.login };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ─── Repositórios ──────────────────────────────────────────────────
  async listRepos() {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/user/repos?sort=updated&per_page=30`,
        {
          headers: {
            'Authorization': `token ${this.credentials.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Erro GitHub: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async createRepo(name, description = '', isPrivate = false) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/repos`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${this.credentials.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          description,
          private: isPrivate,
          auto_init: true
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erro ao criar repositório: ${error}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // ─── Conteúdo do Repositório ───────────────────────────────────────
  async getRepoContents(owner, repo, path = '') {
    try {
      const headers = { 'Accept': 'application/vnd.github.v3+json' };
      if (this.credentials.token) {
        headers['Authorization'] = `token ${this.credentials.token}`;
      }

      const response = await fetch(
        `${this.apiBaseUrl}/repos/${owner}/${repo}/contents/${path}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Erro ao buscar conteúdo: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async getFileContent(owner, repo, path) {
    try {
      const headers = { 'Accept': 'application/vnd.github.v3+json' };
      if (this.credentials.token) {
        headers['Authorization'] = `token ${this.credentials.token}`;
      }

      const response = await fetch(
        `${this.apiBaseUrl}/repos/${owner}/${repo}/contents/${path}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Erro ao buscar arquivo: ${response.status}`);
      }

      const data = await response.json();
      return atob(data.content);
    } catch (error) {
      throw error;
    }
  }

  // ─── Clone de Repositório ──────────────────────────────────────────
  async cloneRepo(owner, repo) {
    const files = {};

    const fetchDir = async (path) => {
      try {
        const contents = await this.getRepoContents(owner, repo, path);
        if (!Array.isArray(contents)) return;

        for (const item of contents) {
          if (item.type === 'file' && item.size < 500000) {
            try {
              const content = await this.getFileContent(owner, repo, item.path);
              files[item.path] = content;
            } catch {}
          } else if (item.type === 'dir') {
            await fetchDir(item.path);
          }
        }
      } catch (error) {
        console.error(`Erro ao buscar diretório ${path}:`, error);
      }
    };

    await fetchDir('');
    return files;
  }

  // ─── Upload de Arquivos ────────────────────────────────────────────
  async createOrUpdateFile(owner, repo, path, content, message, sha = null) {
    try {
      const body = {
        message,
        content: btoa(unescape(encodeURIComponent(content)))
      };

      if (sha) {
        body.sha = sha;
      }

      const response = await fetch(
        `${this.apiBaseUrl}/repos/${owner}/${repo}/contents/${path}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${this.credentials.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erro ao salvar: ${response.status} - ${error}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async pushAllFiles(owner, repo, files, commitMessage) {
    let success = 0;
    let failed = 0;

    // Buscar SHAs dos arquivos existentes
    const existingShas = {};
    try {
      const existing = await this.getRepoContents(owner, repo);
      if (Array.isArray(existing)) {
        for (const item of existing) {
          existingShas[item.path] = item.sha;
        }
      }
    } catch {}

    // Fazer upload de cada arquivo
    for (const [path, content] of Object.entries(files)) {
      try {
        let sha = existingShas[path];

        // Se não encontrou no cache, tentar buscar individualmente
        if (!sha) {
          try {
            const response = await fetch(
              `${this.apiBaseUrl}/repos/${owner}/${repo}/contents/${path}`,
              {
                headers: {
                  'Authorization': `token ${this.credentials.token}`,
                  'Accept': 'application/vnd.github.v3+json'
                }
              }
            );
            if (response.ok) {
              const data = await response.json();
              sha = data.sha;
            }
          } catch {}
        }

        await this.createOrUpdateFile(owner, repo, path, content, commitMessage, sha);
        success++;
      } catch (error) {
        console.error(`Erro ao enviar ${path}:`, error);
        failed++;
      }
    }

    return { success, failed };
  }
}

// Instância global
const githubService = new GitHubService();
