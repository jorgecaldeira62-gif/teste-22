class MiniImportExport {
  async importZip(file, callback) {
    const zip = new JSZip();
    const loaded = await zip.loadAsync(file);
    for (const [path, zipFile] of Object.entries(loaded.files)) {
      if (!zipFile.dir) {
        const content = await zipFile.async('text');
        miniVFS.addFile('/' + path, content);
      }
    }
    miniFileTree.refresh();
    callback();
  }

  exportZip(files, filename = 'projeto.zip') {
    const zip = new JSZip();
    files.forEach(file => {
      const path = file.path.startsWith('/') ? file.path.slice(1) : file.path;
      zip.file(path, file.content);
    });
    zip.generateAsync({ type: 'blob' }).then(blob => {
      saveAs(blob, filename);
    });
  }
}

const miniImportExport = new MiniImportExport();
