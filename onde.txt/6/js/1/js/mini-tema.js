class MiniTheme {
  constructor() {
    this.theme = localStorage.getItem('sk-theme') || 'dark';
    this.apply();
  }

  toggle() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('sk-theme', this.theme);
    this.apply();
  }

  apply() {
    document.body.className = `theme-${this.theme}`;
    const link = document.getElementById('theme-link');
    if (link) {
      link.href = `css/theme-${this.theme}.css`;
    }
  }
}

const miniTheme = new MiniTheme();
