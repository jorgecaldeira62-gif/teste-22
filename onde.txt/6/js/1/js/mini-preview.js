class MiniPreview {
  constructor(previewId, editorId) {
    this.preview = document.getElementById(previewId);
    this.editor = document.getElementById(editorId);
    this.editor.addEventListener('input', () => this.update());
  }

  update() {
    const content = this.editor.value;
    const path = miniTabs.currentTab;
    
    if (path && path.endsWith('.html')) {
      this.preview.innerHTML = content;
    } else if (path && path.endsWith('.md')) {
      this.preview.innerHTML = `<pre>${this.escapeHtml(content)}</pre>`;
    } else if (path && path.endsWith('.json')) {
      try {
        const json = JSON.parse(content);
        this.preview.innerHTML = `<pre>${JSON.stringify(json, null, 2)}</pre>`;
      } catch {
        this.preview.innerHTML = '<p style="color: red;">JSON Inválido</p>';
      }
    } else {
      this.preview.innerHTML = `<pre>${this.escapeHtml(content)}</pre>`;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

const miniPreview = new MiniPreview('preview', 'editor');
