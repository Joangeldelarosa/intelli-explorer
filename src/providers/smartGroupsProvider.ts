import * as vscode from 'vscode';
import * as path from 'path';
import {
  detectPattern,
  getLanguageCategory,
  EXTENSION_CATEGORIES,
  FileCategory,
  PatternCategory,
} from '../utils/fileCategories';

/**
 * Represents a node in the smart groups tree.
 * Can be a language group, a pattern sub-group, or an individual file.
 */
export class SmartGroupItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly fileUri?: vscode.Uri,
    public readonly groupType?: 'language' | 'pattern' | 'file',
    public readonly iconId?: string
  ) {
    super(label, collapsibleState);

    if (groupType === 'file' && fileUri) {
      this.resourceUri = fileUri;
      this.command = {
        command: 'intelliExplorer.openFile',
        title: 'Open File',
        arguments: [fileUri],
      };
      this.contextValue = 'smartFile';
      this.description = vscode.workspace.asRelativePath(fileUri, false);
    } else if (groupType === 'language' && iconId) {
      this.iconPath = new vscode.ThemeIcon(iconId);
      this.contextValue = 'smartLanguage';
    } else if (groupType === 'pattern') {
      this.iconPath = new vscode.ThemeIcon('symbol-folder');
      this.contextValue = 'smartPattern';
    }
  }
}

interface GroupedFile {
  uri: vscode.Uri;
  fileName: string;
  language: string;
  languageIcon: string;
  pattern?: string;
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
  private cachedGroups: Map<string, Map<string, vscode.Uri[]>> | undefined;

  constructor() {
    this.fileWatcher = vscode.workspace.createFileSystemWatcher('**/*');
    this.fileWatcher.onDidCreate(() => this.refresh());
    this.fileWatcher.onDidDelete(() => this.refresh());
    this.fileWatcher.onDidChange(() => this.refresh());
  }

  refresh(): void {
    this.cachedGroups = undefined;
    this._onDidChangeTreeData.fire();
  }

  dispose(): void {
    this.fileWatcher?.dispose();
    this._onDidChangeTreeData.dispose();
  }

  getTreeItem(element: SmartGroupItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: SmartGroupItem): Promise<SmartGroupItem[]> {
    if (!vscode.workspace.workspaceFolders) {
      return [];
    }

    const groups = await this.getGroupedFiles();

    if (!element) {
      // Root: show language groups
      const items: SmartGroupItem[] = [];
      const sortedLanguages = [...groups.keys()].sort();

      for (const language of sortedLanguages) {
        const patternMap = groups.get(language)!;
        const totalFiles = [...patternMap.values()].reduce((sum, files) => sum + files.length, 0);
        const icon = this.getLanguageIcon(language);

        const item = new SmartGroupItem(
          `${language} (${totalFiles})`,
          vscode.TreeItemCollapsibleState.Collapsed,
          undefined,
          'language',
          icon
        );
        // Store language key for getChildren lookup
        (item as SmartGroupItem & { _languageKey: string })._languageKey = language;
        items.push(item);
      }

      return items;
    }

    // Language level: show pattern sub-groups
    const languageKey = (element as SmartGroupItem & { _languageKey?: string })._languageKey;
    if (languageKey) {
      const patternMap = groups.get(languageKey);
      if (!patternMap) {
        return [];
      }

      const items: SmartGroupItem[] = [];
      const sortedPatterns = [...patternMap.keys()].sort((a, b) => {
        // Put "(Other)" at the end
        if (a === '(Other)') { return 1; }
        if (b === '(Other)') { return -1; }
        return a.localeCompare(b);
      });

      for (const pattern of sortedPatterns) {
        const files = patternMap.get(pattern)!;

        if (sortedPatterns.length === 1 && pattern === '(Other)') {
          // If only "(Other)" group, show files directly
          return files
            .sort((a, b) => path.basename(a.fsPath).localeCompare(path.basename(b.fsPath)))
            .map(
              (fileUri) =>
                new SmartGroupItem(
                  path.basename(fileUri.fsPath),
                  vscode.TreeItemCollapsibleState.None,
                  fileUri,
                  'file'
                )
            );
        }

        const patternItem = new SmartGroupItem(
          `${pattern} (${files.length})`,
          vscode.TreeItemCollapsibleState.Collapsed,
          undefined,
          'pattern'
        );
        // Store data for children lookup
        (patternItem as SmartGroupItem & { _files: vscode.Uri[] })._files = files;
        items.push(patternItem);
      }

      return items;
    }

    // Pattern level: show individual files
    const files = (element as SmartGroupItem & { _files?: vscode.Uri[] })._files;
    if (files) {
      return files
        .sort((a, b) => path.basename(a.fsPath).localeCompare(path.basename(b.fsPath)))
        .map(
          (fileUri) =>
            new SmartGroupItem(
              path.basename(fileUri.fsPath),
              vscode.TreeItemCollapsibleState.None,
              fileUri,
              'file'
            )
        );
    }

    return [];
  }

  /**
   * Scan all workspace files and group them by language and pattern.
   * Returns: Map<language, Map<pattern, Uri[]>>
   */
  private async getGroupedFiles(): Promise<Map<string, Map<string, vscode.Uri[]>>> {
    if (this.cachedGroups) {
      return this.cachedGroups;
    }

    const groups = new Map<string, Map<string, vscode.Uri[]>>();

    // Find all files in the workspace (excluding common non-essential dirs)
    const files = await vscode.workspace.findFiles(
      '**/*',
      '{**/node_modules/**,**/.git/**,**/.vscode-test/**,**/out/**,**/dist/**,**/build/**}'
    );

    for (const fileUri of files) {
      const fileName = path.basename(fileUri.fsPath);
      const ext = path.extname(fileName).toLowerCase();

      if (!ext) {
        continue; // Skip files without extension
      }

      const languageCat = getLanguageCategory(ext);
      const language = languageCat ? languageCat.language : this.getDefaultLanguage(ext);

      const patternCat = detectPattern(fileName);
      const pattern = patternCat ? patternCat.label : '(Other)';

      if (!groups.has(language)) {
        groups.set(language, new Map());
      }

      const patternMap = groups.get(language)!;
      if (!patternMap.has(pattern)) {
        patternMap.set(pattern, []);
      }

      patternMap.get(pattern)!.push(fileUri);
    }

    this.cachedGroups = groups;
    return groups;
  }

  private getDefaultLanguage(ext: string): string {
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
