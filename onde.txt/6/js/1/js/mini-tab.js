class MiniTabs {
  constructor(containerId, editorId) {
    this.container = document.getElementById(containerId);
    this.editor = document.getElementById(editorId);
    this.openTabs = [];
    this.currentTab = null;
  }

  openTab(path) {
    if (!this.openTabs.includes(path)) {
      this.openTabs.push(path);
    }
    this.currentTab = path;
    this.render();
    this.loadContent();
  }

  closeTab(path) {
    this.openTabs = this.openTabs.filter(t => t !== path);
    if (this.currentTab === path) {
      this.currentTab = this.openTabs[0] || null;
    }
    this.render();
    if (this.currentTab) {
      this.loadContent();
    }
  }

  render() {
    this.container.innerHTML = '';
    this.openTabs.forEach(path => {
      const tab = document.createElement('button');
      tab.className = `tab ${path === this.currentTab ? 'active' : ''}`;
      
      const name = path.split('/').pop();
      tab.innerHTML = `${name} <span class="tab-close">×</span>`;
      
      tab.onclick = () => this.openTab(path);
      tab.querySelector('.tab-close').onclick = (e) => {
        e.stopPropagation();
        this.closeTab(path);
      };
      
      this.container.appendChild(tab);
    });
  }

  loadContent() {
    const file = miniVFS.getFile(this.currentTab);
    this.editor.value = file ? file.content : '';
  }

  saveContent() {
    if (this.currentTab) {
      miniVFS.updateFile(this.currentTab, this.editor.value);
    }
  }
}

const miniTabs = new MiniTabs('tabs-container', 'editor');
