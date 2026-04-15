import * as vscode from 'vscode';
import { FileHierarchyProvider } from './providers/fileHierarchyProvider';
import {
  SmartGroupsDecorationsProvider,
  SmartGroupsProvider,
} from './providers/smartGroupsProvider';

type GroupDimension = 'language' | 'pattern' | 'module' | 'extension';

interface GroupingPreset {
  label: string;
  description: string;
  groupBy: GroupDimension[];
}

const GROUPING_PRESETS: GroupingPreset[] = [
  {
    label: 'Language -> Pattern',
    description: 'Great for NestJS and layered architectures.',
    groupBy: ['language', 'pattern'],
  },
  {
    label: 'Module -> Pattern',
    description: 'Focus on domain modules, then role.',
    groupBy: ['module', 'pattern'],
  },
  {
    label: 'Module -> Extension',
    description: 'Domain first, final extension second.',
    groupBy: ['module', 'extension'],
  },
  {
    label: 'Extension -> Pattern',
    description: 'Useful for tech migrations and file audits.',
    groupBy: ['extension', 'pattern'],
  },
  {
    label: 'Extension Only',
    description: 'Pure by final extension.',
    groupBy: ['extension'],
  },
  {
    label: 'Module Only',
    description: 'Pure by domain/module folders.',
    groupBy: ['module'],
  },
  {
    label: 'Flat (No Grouping)',
    description: 'All files together.',
    groupBy: [],
  },
];

function normalizeGroupBy(values: string[]): GroupDimension[] {
  const allowed: GroupDimension[] = ['language', 'pattern', 'module', 'extension'];
  const unique: GroupDimension[] = [];

  for (const value of values) {
    if (allowed.includes(value as GroupDimension) && !unique.includes(value as GroupDimension)) {
      unique.push(value as GroupDimension);
    }
  }

  return unique.slice(0, 3);
}

async function updateSmartGroupsSetting<T>(key: string, value: T): Promise<void> {
  const target = vscode.workspace.workspaceFolders?.length
    ? vscode.ConfigurationTarget.Workspace
    : vscode.ConfigurationTarget.Global;

  await vscode.workspace
    .getConfiguration('intelliExplorer.smartGroups')
    .update(key, value, target);
}

export function activate(context: vscode.ExtensionContext) {
  // Initialize providers
  const fileHierarchyProvider = new FileHierarchyProvider();
  const smartGroupsProvider = new SmartGroupsProvider();
  const smartDecorationsProvider = new SmartGroupsDecorationsProvider();

  // Register tree data providers
  const hierarchyView = vscode.window.createTreeView('intelliExplorer.fileHierarchy', {
    treeDataProvider: fileHierarchyProvider,
    showCollapseAll: true,
  });

  const smartView = vscode.window.createTreeView('intelliExplorer.smartGroups', {
    treeDataProvider: smartGroupsProvider,
    showCollapseAll: true,
  });

  const decorationsDisposable = vscode.window.registerFileDecorationProvider(
    smartDecorationsProvider
  );

  // Register commands
  const refreshCmd = vscode.commands.registerCommand('intelliExplorer.refresh', () => {
    fileHierarchyProvider.refresh();
    smartGroupsProvider.refresh();
  });

  const openFileCmd = vscode.commands.registerCommand(
    'intelliExplorer.openFile',
    (uri: vscode.Uri) => {
      if (uri) {
        vscode.window.showTextDocument(uri, { preview: true });
      }
    }
  );

  const revealCmd = vscode.commands.registerCommand(
    'intelliExplorer.revealInNativeExplorer',
    (uri: vscode.Uri) => {
      if (uri) {
        vscode.commands.executeCommand('revealFileInOS', uri);
      }
    }
  );

  const configureSmartGroupsCmd = vscode.commands.registerCommand(
    'intelliExplorer.configureSmartGroups',
    async () => {
      const picks = GROUPING_PRESETS.map((preset) => ({
        label: preset.label,
        description: preset.description,
        detail:
          preset.groupBy.length > 0
            ? `groupBy: ${preset.groupBy.join(' -> ')}`
            : 'groupBy: none',
        preset,
      }));

      const picked = await vscode.window.showQuickPick(picks, {
        placeHolder: 'Choose how Smart Groups should organize your files',
        matchOnDescription: true,
        matchOnDetail: true,
      });

      if (!picked) {
        return;
      }

      await updateSmartGroupsSetting('groupBy', picked.preset.groupBy);
      smartGroupsProvider.refresh();

      vscode.window.setStatusBarMessage(
        `Intelli Explorer: ${picked.preset.label}`,
        2500
      );
    }
  );

  const toggleSmartFileViewCmd = vscode.commands.registerCommand(
    'intelliExplorer.toggleSmartFileView',
    async () => {
      const cfg = vscode.workspace.getConfiguration('intelliExplorer.smartGroups');
      const current = cfg.get<'flat' | 'folders'>('fileView', 'flat');
      const next = current === 'flat' ? 'folders' : 'flat';

      await updateSmartGroupsSetting('fileView', next);
      smartGroupsProvider.refresh();

      const message =
        next === 'folders'
          ? 'Intelli Explorer: folder tree view enabled'
          : 'Intelli Explorer: flat list view enabled';
      vscode.window.setStatusBarMessage(message, 2500);
    }
  );

  const toggleExtensionGroupingCmd = vscode.commands.registerCommand(
    'intelliExplorer.toggleExtensionGrouping',
    async () => {
      const cfg = vscode.workspace.getConfiguration('intelliExplorer.smartGroups');
      const current = normalizeGroupBy(cfg.get<string[]>('groupBy', ['language', 'pattern']));
      const includesExtension = current.includes('extension');

      let next: GroupDimension[];
      if (includesExtension) {
        next = current.filter((item) => item !== 'extension');
        if (next.length === 0) {
          next = ['language', 'pattern'];
        }
      } else {
        next = [...current, 'extension'];
        if (next.length > 3) {
          next = [next[0], next[1], 'extension'];
        }
      }

      await updateSmartGroupsSetting('groupBy', next);
      smartGroupsProvider.refresh();

      const message = includesExtension
        ? 'Intelli Explorer: extension grouping disabled'
        : 'Intelli Explorer: extension grouping enabled';
      vscode.window.setStatusBarMessage(message, 2500);
    }
  );

  context.subscriptions.push(
    hierarchyView,
    smartView,
    decorationsDisposable,
    refreshCmd,
    openFileCmd,
    revealCmd,
    configureSmartGroupsCmd,
    toggleSmartFileViewCmd,
    toggleExtensionGroupingCmd,
    { dispose: () => fileHierarchyProvider.dispose() },
    { dispose: () => smartGroupsProvider.dispose() },
  );
}

export function deactivate() {
  // Nothing to clean up — VS Code disposes subscriptions automatically
}
