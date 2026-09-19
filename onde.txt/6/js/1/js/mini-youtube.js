class MiniYouTube {
  extractVideoID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  getEmbedCode(url) {
    const id = this.extractVideoID(url);
    if (!id) return null;
    return `<div class="youtube-embed"><iframe src="https://www.youtube.com/embed/${id}" allowfullscreen></iframe></div>`;
  }
}

const miniYouTube = new MiniYouTube();
