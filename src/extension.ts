import * as vscode from 'vscode';
import { DiffCheckerPanel } from './diffCheckerPanel';

export function activate(context: vscode.ExtensionContext) {
    console.log('Diff Checker plugin is now active!');

    let disposable = vscode.commands.registerCommand('diffchecker.openDiffChecker', () => {
        DiffCheckerPanel.createOrShow(context.extensionUri);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}

