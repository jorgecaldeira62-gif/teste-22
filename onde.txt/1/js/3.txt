export interface VFSNode {
  name: string;
  path: string;
}

export interface VFSFile extends VFSNode {
  type: 'file';
  content: string;
}

export interface VFSDirectory extends VFSNode {
  type: 'directory';
  children: VFSNode[];
}

export function isDirectory(node: VFSNode): node is VFSDirectory {
  return 'children' in node;
}

export class VirtualFileSystem {
  private root: VFSDirectory;

  constructor() {
    this.root = {
      name: 'root',
      path: '/',
      type: 'directory',
      children: []
    };
  }

  createFile(path: string, content: string = ''): void {
    const parts = path.split('/').filter(Boolean);
    const name = parts.pop()!;
    let current = this.root;

    for (const part of parts) {
      let dir = current.children.find(
        c => isDirectory(c) && c.name === part
      ) as VFSDirectory | undefined;

      if (!dir) {
        dir = {
          name: part,
          path: current.path + part + '/',
          type: 'directory',
          children: []
        };
        current.children.push(dir);
      }
      current = dir;
    }

    current.children.push({
      name,
      path,
      type: 'file',
      content
    });
  }

  getFile(path: string): VFSFile | null {
    const parts = path.split('/').filter(Boolean);
    let current: VFSNode | undefined = this.root;

    for (const part of parts) {
      if (!isDirectory(current)) return null;
      current = current.children.find(c => c.name === part);
      if (!current) return null;
    }

    return isDirectory(current) ? null : (current as VFSFile);
  }

  deleteNode(path: string): void {
    const parts = path.split('/').filter(Boolean);
    const name = parts.pop()!;
    let current = this.root;

    for (const part of parts) {
      const next = current.children.find(
        c => isDirectory(c) && c.name === part
      ) as VFSDirectory | undefined;
      if (!next) return;
      current = next;
    }

    current.children = current.children.filter(c => c.name !== name);
  }

  renameNode(path: string, newName: string): void {
    const node = this.getNode(path);
    if (node) node.name = newName;
  }

  getNode(path: string): VFSNode | null {
    const parts = path.split('/').filter(Boolean);
    let current: VFSNode | undefined = this.root;

    for (const part of parts) {
      if (!isDirectory(current)) return null;
      current = current.children.find(c => c.name === part);
      if (!current) return null;
    }

    return current;
  }

  getRoot(): VFSDirectory {
    return this.root;
  }
}
