class MiniGitHub {
  constructor() {
    this.token = localStorage.getItem('sk-github-token') || '';
    this.repo = localStorage.getItem('sk-github-repo') || '';
  }

  setCredentials(token, repo) {
    this.token = token;
    this.repo = repo;
    localStorage.setItem('sk-github-token', token);
    localStorage.setItem('sk-github-repo', repo);
  }

  async push(message = 'Update from SK Editor') {
    if (!this.token || !this.repo) {
      alert('Configure GitHub primeiro!');
      return;
    }

    const files = miniVFS.getAllFiles();
    const [owner, repoName] = this.repo.split('/');

    for (const file of files) {
      const path = file.path.startsWith('/') ? file.path.slice(1) : file.path;
      await this.uploadFile(owner, repoName, path, file.content, message);
    }

    alert('Enviado para GitHub! ✅');
  }

  async uploadFile(owner, repo, path, content, message) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const encoded = btoa(content);

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          content: encoded
        })
      });

      if (!response.ok) {
        console.error('Erro ao fazer upload:', await response.text());
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
    }
  }
}

const miniGitHub = new MiniGitHub();
