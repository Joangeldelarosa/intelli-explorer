import * as vscode from 'vscode';
import * as path from 'path';
import {
  detectPattern,
  getLanguageCategory,
  EXTENSION_CATEGORIES,
} from '../utils/fileCategories';

type GroupDimension = 'language' | 'pattern' | 'module' | 'extension';
type FilePresentation = 'flat' | 'folders';

interface SmartGroupsConfig {
  groupBy: GroupDimension[];
  filePresentation: FilePresentation;
  moduleDepth: number;
  showCounts: boolean;
  colorfulIcons: boolean;
}

interface FolderNode {
  name: string;
  folders: Map<string, FolderNode>;
  files: vscode.Uri[];
}

/**
 * Represents a node in the smart groups tree.
 * Can be a language group, a pattern sub-group, or an individual file.
 */
export class SmartGroupItem extends vscode.TreeItem {
  constructor(
    public readonly nodeLabel: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly nodeType: 'group' | 'folder' | 'file',
    public readonly children: SmartGroupItem[] = [],
    public readonly fileUri?: vscode.Uri,
    public readonly groupType?: GroupDimension,
    public readonly iconId?: string,
    public readonly colorfulIcons: boolean = true,
    public readonly displayCount?: number,
    public readonly decorationId?: string
  ) {
    super(nodeLabel, collapsibleState);

    if (displayCount !== undefined && nodeType !== 'file') {
      this.description = `${displayCount}`;
    }

    if (nodeType === 'file' && fileUri) {
      this.resourceUri = fileUri;
      this.command = {
        command: 'intelliExplorer.openFile',
        title: 'Open File',
        arguments: [fileUri],
      };
      this.contextValue = 'smartFile';
      this.description = vscode.workspace.asRelativePath(fileUri, false);
      return;
    }

    if (nodeType === 'group') {
      this.contextValue = `smartGroup:${groupType ?? 'generic'}`;
      this.iconPath = this.getGroupIcon(groupType, iconId, colorfulIcons);
      this.resourceUri = this.createDecorationUri('group', groupType ?? 'generic', decorationId);
      return;
    }

    this.contextValue = 'smartFolder';
    this.iconPath = new vscode.ThemeIcon(
      'folder-library',
      colorfulIcons ? new vscode.ThemeColor('charts.yellow') : undefined
    );
    this.resourceUri = this.createDecorationUri('folder', 'folder', decorationId);
  }

  private getGroupIcon(
    groupType: GroupDimension | undefined,
    iconId: string | undefined,
    colorfulIcons: boolean
  ): vscode.ThemeIcon {
    const color = (themeKey: string) =>
      colorfulIcons ? new vscode.ThemeColor(themeKey) : undefined;

    if (groupType === 'language') {
      return new vscode.ThemeIcon(iconId ?? 'symbol-class', color('charts.blue'));
    }

    if (groupType === 'pattern') {
      return new vscode.ThemeIcon('symbol-folder', color('charts.orange'));
    }

    if (groupType === 'module') {
      return new vscode.ThemeIcon('package', color('charts.green'));
    }

    if (groupType === 'extension') {
      return new vscode.ThemeIcon('file-code', color('charts.purple'));
    }

    return new vscode.ThemeIcon('symbol-folder');
  }

  private createDecorationUri(
    nodeType: 'group' | 'folder',
    groupType: string,
    id?: string
  ): vscode.Uri {
    const safeGroupType = encodeURIComponent(groupType);
    const safeId = encodeURIComponent(id ?? `${Date.now()}-${Math.random()}`);
    return vscode.Uri.parse(`intelli-explorer:/${nodeType}/${safeGroupType}/${safeId}`);
  }
}

export class SmartGroupsDecorationsProvider implements vscode.FileDecorationProvider {
  readonly onDidChangeFileDecorations?: vscode.Event<vscode.Uri | vscode.Uri[] | undefined>;

  provideFileDecoration(uri: vscode.Uri): vscode.ProviderResult<vscode.FileDecoration> {
    if (uri.scheme !== 'intelli-explorer') {
      return undefined;
    }

    const parts = uri.path.split('/').filter(Boolean);
    const nodeType = parts[0];
    const groupType = parts[1];

    if (nodeType === 'folder') {
      return new vscode.FileDecoration(undefined, 'Folder view', new vscode.ThemeColor('charts.yellow'));
    }

    if (nodeType !== 'group') {
      return undefined;
    }

    if (groupType === 'language') {
      return new vscode.FileDecoration(undefined, 'Language group', new vscode.ThemeColor('charts.blue'));
    }

    if (groupType === 'pattern') {
      return new vscode.FileDecoration(undefined, 'Pattern group', new vscode.ThemeColor('charts.orange'));
    }

    if (groupType === 'module') {
      return new vscode.FileDecoration(undefined, 'Module group', new vscode.ThemeColor('charts.green'));
    }

    if (groupType === 'extension') {
      return new vscode.FileDecoration(undefined, 'Extension group', new vscode.ThemeColor('charts.purple'));
    }

    return undefined;
  }
}

/**
 * Provides the intelligent file grouping tree (bottom panel).
 * Files are grouped first by language/type, then by naming pattern.
 * Example hierarchy:
 *   TypeScript
 *     Controllers
 *       user.controller.ts
 *       auth.controller.ts
 *     Services
 *       user.service.ts
 *     (Other)
 *       main.ts
 *   JavaScript
 *     ...
 */
export class SmartGroupsProvider implements vscode.TreeDataProvider<SmartGroupItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<SmartGroupItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private fileWatcher: vscode.FileSystemWatcher | undefined;
  private configWatcher: vscode.Disposable | undefined;
  private cachedRootItems: SmartGroupItem[] | undefined;

  private refreshTimeout: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.fileWatcher = vscode.workspace.createFileSystemWatcher('**/*');
    const debouncedRefresh = () => this.debouncedRefresh();
    this.fileWatcher.onDidCreate(debouncedRefresh);
    this.fileWatcher.onDidDelete(debouncedRefresh);
    this.fileWatcher.onDidChange(debouncedRefresh);

    this.configWatcher = vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('intelliExplorer.smartGroups')) {
        this.refresh();
      }
    });
  }

  /** Debounce rapid file system events to avoid excessive cache invalidation. */
  private debouncedRefresh(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
    this.refreshTimeout = setTimeout(() => {
      this.refreshTimeout = undefined;
      this.refresh();
    }, 300);
  }

  refresh(): void {
    this.cachedRootItems = undefined;
    this._onDidChangeTreeData.fire();
  }

  dispose(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
    this.fileWatcher?.dispose();
    this.configWatcher?.dispose();
    this._onDidChangeTreeData.dispose();
  }

  getTreeItem(element: SmartGroupItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: SmartGroupItem): Promise<SmartGroupItem[]> {
    if (!vscode.workspace.workspaceFolders) {
      return [];
    }

    if (!element) {
      return this.getRootItems();
    }

    return element.children;
  }

  private async getRootItems(): Promise<SmartGroupItem[]> {
    if (this.cachedRootItems) {
      return this.cachedRootItems;
    }

    const config = this.getConfig();
    const files = await this.getWorkspaceFiles();

    if (files.length === 0) {
      this.cachedRootItems = [];
      return this.cachedRootItems;
    }

    this.cachedRootItems = this.buildGroupLevel(files, config.groupBy, 0, config, 0);

    if (this.cachedRootItems.length === 0) {
      this.cachedRootItems = this.createFileLeafNodes(files, config, 0);
    }

    return this.cachedRootItems;
  }

  private async getWorkspaceFiles(): Promise<vscode.Uri[]> {
    const files = await vscode.workspace.findFiles(
      '**/*',
      '{**/node_modules/**,**/.git/**,**/.vscode-test/**,**/out/**,**/dist/**,**/build/**}'
    );

    return files.filter((fileUri) => {
      const baseName = path.basename(fileUri.fsPath);
      if (!path.extname(baseName)) {
        return false;
      }
      return true;
    });
  }

  private getConfig(): SmartGroupsConfig {
    const config = vscode.workspace.getConfiguration('intelliExplorer.smartGroups');

    const groupByRaw = config.get<string[]>('groupBy', ['language', 'pattern']);
    const groupBy = this.normalizeGroupBy(groupByRaw);

    const filePresentationRaw = config.get<string>('fileView', 'flat');
    const filePresentation: FilePresentation = filePresentationRaw === 'folders' ? 'folders' : 'flat';

    const moduleDepth = Math.min(Math.max(config.get<number>('moduleDepth', 1), 1), 6);
    const showCounts = config.get<boolean>('showCounts', true);
    const colorfulIcons = config.get<boolean>('colorfulIcons', true);

    return {
      groupBy,
      filePresentation,
      moduleDepth,
      showCounts,
      colorfulIcons,
    };
  }

  private normalizeGroupBy(values: string[]): GroupDimension[] {
    const allowed: GroupDimension[] = ['language', 'pattern', 'module', 'extension'];
    const unique: GroupDimension[] = [];

    for (const value of values) {
      if (allowed.includes(value as GroupDimension) && !unique.includes(value as GroupDimension)) {
        unique.push(value as GroupDimension);
      }
    }

    return unique.slice(0, 3);
  }

  private buildGroupLevel(
    files: vscode.Uri[],
    groupBy: GroupDimension[],
    level: number,
    config: SmartGroupsConfig,
    pathTrimSegments: number
  ): SmartGroupItem[] {
    if (groupBy.length === 0 || level >= groupBy.length) {
      return this.createFileLeafNodes(files, config, pathTrimSegments);
    }

    const dimension = groupBy[level];
    const buckets = new Map<string, vscode.Uri[]>();

    for (const fileUri of files) {
      const key = this.getBucketKey(fileUri, dimension, config.moduleDepth);

      if (!buckets.has(key)) {
        buckets.set(key, []);
      }

      buckets.get(key)!.push(fileUri);
    }

    const sortedKeys = [...buckets.keys()].sort((a, b) => this.compareGroupKeys(a, b));

    return sortedKeys.map((key, idx) => {
      const bucketFiles = buckets.get(key)!;
      const nextTrimSegments = this.nextTrimSegments(dimension, key, pathTrimSegments);
      const children = this.buildGroupLevel(bucketFiles, groupBy, level + 1, config, nextTrimSegments);

      return new SmartGroupItem(
        key,
        vscode.TreeItemCollapsibleState.Collapsed,
        'group',
        children,
        undefined,
        dimension,
        dimension === 'language' ? this.getLanguageIcon(key) : undefined,
        config.colorfulIcons,
        config.showCounts ? bucketFiles.length : undefined,
        `${level}-${idx}-${dimension}-${key}`
      );
    });
  }

  private createFileLeafNodes(
    files: vscode.Uri[],
    config: SmartGroupsConfig,
    pathTrimSegments: number
  ): SmartGroupItem[] {
    if (config.filePresentation === 'folders') {
      return this.createFolderTreeNodes(files, config, pathTrimSegments);
    }

    return files
      .sort((a, b) => path.basename(a.fsPath).localeCompare(path.basename(b.fsPath)))
      .map(
        (fileUri) =>
          new SmartGroupItem(
            path.basename(fileUri.fsPath),
            vscode.TreeItemCollapsibleState.None,
            'file',
            [],
            fileUri
          )
      );
  }

  private createFolderTreeNodes(
    files: vscode.Uri[],
    config: SmartGroupsConfig,
    pathTrimSegments: number
  ): SmartGroupItem[] {
    const root: FolderNode = { name: '', folders: new Map(), files: [] };

    for (const fileUri of files) {
      const relativePath = vscode.workspace.asRelativePath(fileUri, false);
      const parts = relativePath.split(/[\\/]/).filter(Boolean);
      const fileName = parts.pop();
      if (!fileName) {
        continue;
      }

      const directoryParts = parts.slice(pathTrimSegments);

      let currentNode = root;
      for (const segment of directoryParts) {
        if (!currentNode.folders.has(segment)) {
          currentNode.folders.set(segment, {
            name: segment,
            folders: new Map(),
            files: [],
          });
        }
        currentNode = currentNode.folders.get(segment)!;
      }

      currentNode.files.push(fileUri);
    }

    return this.toTreeItemsFromFolder(root, config, 'root');
  }

  private toTreeItemsFromFolder(
    node: FolderNode,
    config: SmartGroupsConfig,
    nodePath: string
  ): SmartGroupItem[] {
    const folderItems = [...node.folders.values()]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((folderNode, idx) => {
        const children = this.toTreeItemsFromFolder(folderNode, config, `${nodePath}/${folderNode.name}`);
        const descendantFiles = this.countDescendantFiles(folderNode);

        return new SmartGroupItem(
          folderNode.name,
          vscode.TreeItemCollapsibleState.Collapsed,
          'folder',
          children,
          undefined,
          undefined,
          undefined,
          config.colorfulIcons,
          config.showCounts ? descendantFiles : undefined,
          `${nodePath}-folder-${idx}`
        );
      });

    const fileItems = node.files
      .sort((a, b) => path.basename(a.fsPath).localeCompare(path.basename(b.fsPath)))
      .map(
        (fileUri) =>
          new SmartGroupItem(
            path.basename(fileUri.fsPath),
            vscode.TreeItemCollapsibleState.None,
            'file',
            [],
            fileUri
          )
      );

    return [...folderItems, ...fileItems];
  }

  private countDescendantFiles(node: FolderNode): number {
    let total = node.files.length;
    for (const child of node.folders.values()) {
      total += this.countDescendantFiles(child);
    }
    return total;
  }

  private nextTrimSegments(
    dimension: GroupDimension,
    bucketKey: string,
    currentTrimSegments: number
  ): number {
    if (dimension !== 'module' || bucketKey === '(Root)') {
      return currentTrimSegments;
    }

    const moduleSegments = bucketKey.split('/').filter(Boolean).length;
    return currentTrimSegments + moduleSegments;
  }

  private getBucketKey(fileUri: vscode.Uri, dimension: GroupDimension, moduleDepth: number): string {
    const fileName = path.basename(fileUri.fsPath);

    if (dimension === 'language') {
      const ext = path.extname(fileName).toLowerCase();
      const languageCat = getLanguageCategory(ext);
      return languageCat ? languageCat.language : this.getDefaultLanguage(ext);
    }

    if (dimension === 'pattern') {
      const patternCat = detectPattern(fileName);
      return patternCat ? patternCat.label : '(Other)';
    }

    if (dimension === 'extension') {
      const ext = path.extname(fileName).toLowerCase();
      return ext || '(No Extension)';
    }

    return this.getModuleKey(fileUri, moduleDepth);
  }

  private getModuleKey(fileUri: vscode.Uri, moduleDepth: number): string {
    const relativePath = vscode.workspace.asRelativePath(fileUri, false);
    const segments = relativePath.split(/[\\/]/).filter(Boolean);

    if (segments.length <= 1) {
      return '(Root)';
    }

    const folders = segments.slice(0, -1);
    if (folders.length === 0) {
      return '(Root)';
    }

    return folders.slice(0, Math.max(1, moduleDepth)).join('/');
  }

  private compareGroupKeys(a: string, b: string): number {
    if (a === '(Other)') {
      return 1;
    }
    if (b === '(Other)') {
      return -1;
    }
    if (a === '(Root)') {
      return -1;
    }
    if (b === '(Root)') {
      return 1;
    }

    return a.localeCompare(b);
  }

  private getDefaultLanguage(ext: string): string {
    if (!ext) {
      return 'Unknown Files';
    }

    // Capitalize the extension without the dot
    const name = ext.slice(1);
    return name.charAt(0).toUpperCase() + name.slice(1) + ' Files';
  }

  private getLanguageIcon(language: string): string {
    // Find the icon from known categories
    for (const [, cat] of Object.entries(EXTENSION_CATEGORIES)) {
      if (cat.language === language) {
        return cat.icon;
      }
    }
    return 'file';
  }
}
