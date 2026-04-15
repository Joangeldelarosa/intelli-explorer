import * as vscode from 'vscode';
import { FileHierarchyProvider } from './providers/fileHierarchyProvider';
import { SmartGroupsProvider } from './providers/smartGroupsProvider';

export function activate(context: vscode.ExtensionContext) {
  // Initialize providers
  const fileHierarchyProvider = new FileHierarchyProvider();
  const smartGroupsProvider = new SmartGroupsProvider();

  // Register tree data providers
  const hierarchyView = vscode.window.createTreeView('intelliExplorer.fileHierarchy', {
    treeDataProvider: fileHierarchyProvider,
    showCollapseAll: true,
  });

  const smartView = vscode.window.createTreeView('intelliExplorer.smartGroups', {
    treeDataProvider: smartGroupsProvider,
    showCollapseAll: true,
  });

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

  context.subscriptions.push(
    hierarchyView,
    smartView,
    refreshCmd,
    openFileCmd,
    revealCmd,
    { dispose: () => fileHierarchyProvider.dispose() },
    { dispose: () => smartGroupsProvider.dispose() },
  );
}

export function deactivate() {
  // Nothing to clean up — VS Code disposes subscriptions automatically
}
