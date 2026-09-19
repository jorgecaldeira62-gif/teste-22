/**
 * Mini VFS Robusto - Sem erros de codificação
 * ✅ Trata UTF-8 corretamente
 * ✅ Trata arquivos binários
 * ✅ Trata erros de encoding
 * ✅ Sem transparências
 */

class MiniVFSRobusto {
  constructor() {
    this.files = {};
    this.folders = new Set(['/']);
    this.encoding = 'utf-8';
  }

  // ─── Adicionar arquivo (COM TRATAMENTO DE ERRO) ───────────────────
  addFile(path, content) {
    try {
      // Validar path
      if (!path || typeof path !== 'string') {
        throw new Error('Path inválido');
      }

      // Normalizar path
      path = this.normalizePath(path);

      // Tratar conteúdo
      let processedContent = content;

      // Se for string
      if (typeof content === 'string') {
        // Garantir UTF-8
        processedContent = this.ensureUTF8(content);
      }
      // Se for Blob/ArrayBuffer (arquivo binário)
      else if (content instanceof Blob) {
        processedContent = content;
      }
      // Se for ArrayBuffer
      else if (content instanceof ArrayBuffer) {
        processedContent = new Blob([content]);
      }
      // Se for outro tipo, converter para string
      else {
        processedContent = String(content);
        processedContent = this.ensureUTF8(processedContent);
      }

      // Adicionar arquivo
      this.files[path] = {
        name: path.split('/').pop(),
        path,
        content: processedContent,
        type: this.getFileType(path),
        size: this.getSize(processedContent),
        encoding: this.getEncoding(processedContent),
        isText: this.isTextFile(path),
        isBinary: this.isBinaryFile(path)
      };

      // Adicionar pastas pai
      this.addParentFolders(path);

      return true;
    } catch (error) {
      console.error('Erro ao adicionar arquivo:', error);
      return false;
    }
  }

  // ─── Garantir UTF-8 ──────────────────────────────────────────────
  ensureUTF8(content) {
    try {
      // Se já é string, verificar encoding
      if (typeof content !== 'string') {
        content = String(content);
      }

      // Remover caracteres inválidos
      content = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

      // Normalizar quebras de linha
      content = content.replace(/\r\n/g, '\n');

      return content;
    } catch (error) {
      console.error('Erro ao processar UTF-8:', error);
      return '';
    }
  }

  // ─── Normalizar path ─────────────────────────────────────────────
  normalizePath(path) {
    // Remover barras extras
    path = path.replace(/\/+/g, '/');
    // Garantir que começa com /
    if (!path.startsWith('/')) path = '/' + path;
    // Remover barra final (exceto para raiz)
    if (path !== '/' && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    return path;
  }

  // ─── Adicionar pastas pai ────────────────────────────────────────
  addParentFolders(path) {
    const parts = path.split('/').filter(Boolean);
    for (let i = 1; i < parts.length - 1; i++) {
      const folderPath = '/' + parts.slice(0, i + 1).join('/');
      this.folders.add(folderPath);
    }
  }

  // ─── Detectar tipo de arquivo ────────────────────────────────────
  getFileType(filename) {
    const ext = filename.split('.').pop()?.toLowerCase() || '';

    const types = {
      // Imagens
      'jpg': 'image', 'jpeg': 'image', 'png': 'image',
      'gif': 'image', 'webp': 'image', 'svg': 'image',
      'bmp': 'image', 'ico': 'image', 'tiff': 'image',

      // Web
      'html': 'html', 'htm': 'html',
      'css': 'css',
      'js': 'javascript', 'jsx': 'javascript',
      'ts': 'typescript', 'tsx': 'typescript',

      // Dados
      'json': 'json', 'xml': 'xml',
      'yaml': 'yaml', 'yml': 'yaml',
      'toml': 'toml', 'ini': 'ini',

      // Texto
      'txt': 'text', 'md': 'markdown',
      'csv': 'csv', 'tsv': 'tsv',

      // Código
      'py': 'python', 'rb': 'ruby',
      'go': 'go', 'rs': 'rust',
      'java': 'java', 'c': 'c',
      'cpp': 'cpp', 'cs': 'csharp',
      'php': 'php', 'sh': 'shell',
      'sql': 'sql',

      // Documentos
      'pdf': 'pdf', 'doc': 'doc',
      'docx': 'docx', 'xls': 'xls',
      'xlsx': 'xlsx', 'ppt': 'ppt',

      // Arquivos
      'zip': 'archive', 'tar': 'archive',
      'gz': 'archive', 'rar': 'archive',
      '7z': 'archive'
    };

    return types[ext] || 'file';
  }

  // ─── Verificar se é arquivo de texto ─────────────────────────────
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

  // ─── Verificar se é arquivo binário ──────────────────────────────
  isBinaryFile(filename) {
    const binaryTypes = [
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'ico', 'tiff',
      'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt',
      'zip', 'tar', 'gz', 'rar', '7z',
      'exe', 'dll', 'so', 'dylib',
      'mp3', 'mp4', 'avi', 'mov', 'mkv',
      'wav', 'flac', 'aac'
    ];

    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return binaryTypes.includes(ext);
  }

  // ─── Obter tamanho ──────────────────────────────────────────────
  getSize(content) {
    if (typeof content === 'string') {
      return new Blob([content]).size;
    } else if (content instanceof Blob) {
      return content.size;
    }
    return 0;
  }

  // ─── Obter encoding ────────────────────────────────────────────
  getEncoding(content) {
    if (typeof content === 'string') {
      return 'utf-8';
    } else if (content instanceof Blob) {
      return 'binary';
    }
    return 'unknown';
  }

  // ─── Obter arquivo ────────────────────────────────────────────
  getFile(path) {
    path = this.normalizePath(path);
    return this.files[path] || null;
  }

  // ─── Obter conteúdo ────────────────────────────────────────────
  getContent(path) {
    const file = this.getFile(path);
    if (!file) return null;

    // Se for texto
    if (file.isText && typeof file.content === 'string') {
      return file.content;
    }
    // Se for binário
    else if (file.isBinary && file.content instanceof Blob) {
      return file.content;
    }
    // Se for outro tipo
    else {
      return file.content;
    }
  }

  // ─── Atualizar conteúdo ────────────────────────────────────────
  updateContent(path, content) {
    try {
      path = this.normalizePath(path);
      const file = this.files[path];

      if (!file) {
        throw new Error('Arquivo não encontrado');
      }

      // Processar conteúdo
      let processedContent = content;

      if (typeof content === 'string') {
        processedContent = this.ensureUTF8(content);
      }

      file.content = processedContent;
      file.size = this.getSize(processedContent);
      file.encoding = this.getEncoding(processedContent);

      return true;
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      return false;
    }
  }

  // ─── Deletar arquivo ────────────────────────────────────────────
  deleteFile(path) {
    try {
      path = this.normalizePath(path);
      delete this.files[path];
      return true;
    } catch (error) {
      console.error('Erro ao deletar:', error);
      return false;
    }
  }

  // ─── Obter todos os arquivos ────────────────────────────────────
  getAllFiles() {
    return Object.values(this.files);
  }

  // ─── Obter árvore ──────────────────────────────────────────────
  getTree() {
    const tree = {
      name: 'root',
      path: '/',
      type: 'folder',
      children: []
    };

    const paths = Object.keys(this.files).sort();
    const processed = new Set();

    for (const filePath of paths) {
      const parts = filePath.split('/').filter(Boolean);
      let current = tree;

      // Navegar/criar pastas
      for (let i = 0; i < parts.length - 1; i++) {
        const folderName = parts[i];
        const folderPath = '/' + parts.slice(0, i + 1).join('/');

        if (processed.has(folderPath)) {
          current = current.children.find(c => c.path === folderPath);
        } else {
          const folder = {
            name: folderName,
            path: folderPath,
            type: 'folder',
            children: []
          };
          current.children.push(folder);
          processed.add(folderPath);
          current = folder;
        }
      }

      // Adicionar arquivo
      const file = this.files[filePath];
      current.children.push({
        name: file.name,
        path: filePath,
        type: 'file',
        fileType: file.type,
        size: file.size,
        isText: file.isText,
        isBinary: file.isBinary
      });
    }

    // Ordenar
    const sort = (node) => {
      if (node.children) {
        node.children.sort((a, b) => {
          if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
        node.children.forEach(sort);
      }
    };
    sort(tree);

    return tree;
  }

  // ─── Exportar como ZIP ──────────────────────────────────────────
  async exportZip(projectName) {
    try {
      if (typeof JSZip === 'undefined') {
        throw new Error('JSZip não carregado');
      }

      const zip = new JSZip();

      for (const [path, file] of Object.entries(this.files)) {
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;

        // Se for texto
        if (file.isText && typeof file.content === 'string') {
          zip.file(cleanPath, file.content, { binary: false });
        }
        // Se for binário
        else if (file.isBinary && file.content instanceof Blob) {
          zip.file(cleanPath, file.content, { binary: true });
        }
        // Se for outro
        else {
          zip.file(cleanPath, String(file.content));
        }
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${projectName}.zip`);

      return true;
    } catch (error) {
      console.error('Erro ao exportar ZIP:', error);
      return false;
    }
  }

  // ─── Limpar ─────────────────────────────────────────────────────
  clear() {
    this.files = {};
    this.folders = new Set(['/']);
  }
}

// Instância global
const miniVFSRobusto = new MiniVFSRobusto();
