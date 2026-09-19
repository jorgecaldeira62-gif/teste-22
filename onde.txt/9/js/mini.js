/**
 * Mini Import Robusto - Sem erros de codificação
 * ✅ Trata UTF-8
 * ✅ Trata binários
 * ✅ Trata erros
 * ✅ Sem transparências
 */

class MiniImportRobusto {
  constructor(vfs) {
    this.vfs = vfs;
  }

  // ─── Importar arquivo ──────────────────────────────────────────
  async importFile(file) {
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      // ZIP
      if (ext === 'zip') {
        return await this.importZip(file);
      }
      // Arquivo individual
      else {
        return await this.importSingleFile(file);
      }
    } catch (error) {
      console.error('Erro ao importar:', error);
      throw error;
    }
  }

  // ─── Importar arquivo único ────────────────────────────────────
  async importSingleFile(file) {
    try {
      // Se for texto
      if (this.isTextFile(file.name)) {
        const content = await file.text();
        const path = '/' + file.name;
        this.vfs.addFile(path, content);
        return { success: true, files: 1 };
      }
      // Se for binário
      else {
        const blob = file.slice(0, file.size, file.type);
        const path = '/' + file.name;
        this.vfs.addFile(path, blob);
        return { success: true, files: 1 };
      }
    } catch (error) {
      console.error('Erro ao importar arquivo:', error);
      throw error;
    }
  }

  // ─── Importar ZIP ──────────────────────────────────────────────
  async importZip(file) {
    try {
      if (typeof JSZip === 'undefined') {
        throw new Error('JSZip não carregado');
      }

      const zip = new JSZip();
      const loaded = await zip.loadAsync(file);

      let count = 0;

      for (const [path, zipFile] of Object.entries(loaded.files)) {
        // Pular diretórios
        if (zipFile.dir) continue;

        try {
          // Se for texto
          if (this.isTextFile(path)) {
            const content = await zipFile.async('text');
            const normalizedPath = '/' + path;
            this.vfs.addFile(normalizedPath, content);
            count++;
          }
          // Se for binário
          else {
            const blob = await zipFile.async('blob');
            const normalizedPath = '/' + path;
            this.vfs.addFile(normalizedPath, blob);
            count++;
          }
        } catch (fileError) {
          console.warn(`Erro ao processar ${path}:`, fileError);
          // Continuar com próximo arquivo
        }
      }

      return { success: true, files: count };
    } catch (error) {
      console.error('Erro ao importar ZIP:', error);
      throw error;
    }
  }

  // ─── Verificar se é arquivo de texto ────────────────────────────
  isTextFile(filename) {
    const textTypes = [
      'html', 'css', 'js', 'ts', 'jsx', 'tsx',
      'json', 'xml', 'yaml', 'yml', 'toml',
      'txt', 'md', 'csv', 'tsv',
      'py', 'rb', 'go', 'rs', 'java', 'c', 'cpp', 'cs', 'php', 'sh', 'sql'
    ];

    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return textTypes.includes(ext);
  }

  // ─── Drag and Drop ────────────────────────────────────────────
  setupDragDrop(element) {
    element.addEventListener('dragover', (e) => {
      e.preventDefault();
      element.style.backgroundColor = 'rgba(88, 166, 255, 0.1)';
    });

    element.addEventListener('dragleave', () => {
      element.style.backgroundColor = '';
    });

    element.addEventListener('drop', async (e) => {
      e.preventDefault();
      element.style.backgroundColor = '';

      const files = e.dataTransfer.files;
      for (const file of files) {
        try {
          await this.importFile(file);
        } catch (error) {
          console.error('Erro:', error);
        }
      }
    });
  }
}

const miniImportRobusto = new MiniImportRobusto(miniVFSRobusto);
