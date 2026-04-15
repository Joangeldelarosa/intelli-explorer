import * as vscode from 'vscode';

/**
 * TreeItem representing a file or folder in the standard file hierarchy view.
 */
export class FileHierarchyItem extends vscode.TreeItem {
  constructor(
    public readonly resourceUri: vscode.Uri,
    public readonly isDirectory: boolean,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(resourceUri, collapsibleState);

    if (!isDirectory) {
      this.command = {
        command: 'intelliExplorer.openFile',
        title: 'Open File',
        arguments: [resourceUri],
      };
      this.contextValue = 'file';
    } else {
      this.contextValue = 'folder';
    }
  }
}

/**
 * Provides the standard file hierarchy tree (top panel).
 * Shows files and folders in their real directory structure,
 * similar to VS Code's built-in explorer but scoped to the workspace.
 */
export class FileHierarchyProvider implements vscode.TreeDataProvider<FileHierarchyItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<FileHierarchyItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private fileWatcher: vscode.FileSystemWatcher | undefined;

  constructor() {
    // Watch for file system changes to auto-refresh
    this.fileWatcher = vscode.workspace.createFileSystemWatcher('**/*');
    this.fileWatcher.onDidCreate(() => this.refresh());
    this.fileWatcher.onDidDelete(() => this.refresh());
    this.fileWatcher.onDidChange(() => this.refresh());
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  dispose(): void {
    this.fileWatcher?.dispose();
    this._onDidChangeTreeData.dispose();
  }

  getTreeItem(element: FileHierarchyItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: FileHierarchyItem): Promise<FileHierarchyItem[]> {
    if (!vscode.workspace.workspaceFolders) {
      return [];
    }

    let dirUri: vscode.Uri;

    if (!element) {
      // Root level: if single workspace folder, show its contents directly
      if (vscode.workspace.workspaceFolders.length === 1) {
        dirUri = vscode.workspace.workspaceFolders[0].uri;
      } else {
        // Multi-root: show workspace folders as top-level items
        return vscode.workspace.workspaceFolders.map(
          (folder) =>
            new FileHierarchyItem(
              folder.uri,
              true,
              vscode.TreeItemCollapsibleState.Collapsed
            )
        );
      }
    } else {
      dirUri = element.resourceUri;
    }

    return this.readDirectory(dirUri);
  }

  private async readDirectory(uri: vscode.Uri): Promise<FileHierarchyItem[]> {
    try {
      const entries = await vscode.workspace.fs.readDirectory(uri);

      const items: FileHierarchyItem[] = entries
        .filter(([name]) => !this.isHidden(name))
        .sort(([nameA, typeA], [nameB, typeB]) => {
          // Folders first, then files, alphabetical within each group
          if (typeA === vscode.FileType.Directory && typeB !== vscode.FileType.Directory) {
            return -1;
          }
          if (typeA !== vscode.FileType.Directory && typeB === vscode.FileType.Directory) {
            return 1;
          }
          return nameA.localeCompare(nameB);
        })
        .map(([name, type]) => {
          const childUri = vscode.Uri.joinPath(uri, name);
          const isDir = type === vscode.FileType.Directory;
          return new FileHierarchyItem(
            childUri,
            isDir,
            isDir
              ? vscode.TreeItemCollapsibleState.Collapsed
              : vscode.TreeItemCollapsibleState.None
          );
        });

      return items;
    } catch {
      return [];
    }
  }

  private isHidden(name: string): boolean {
    // Hide common non-essential directories/files
    const hiddenPatterns = [
      'node_modules',
      '.git',
      '.DS_Store',
      'Thumbs.db',
      '.vscode-test',
    ];
    return hiddenPatterns.includes(name);
  }
}
