import * as vscode from 'vscode';
import { diffLines, diffWords, diffChars, Change } from 'diff';

export class DiffCheckerPanel {
    public static currentPanel: DiffCheckerPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (DiffCheckerPanel.currentPanel) {
            DiffCheckerPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'diffChecker',
            'Diff Checker',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [extensionUri],
                retainContextWhenHidden: true
            }
        );

        DiffCheckerPanel.currentPanel = new DiffCheckerPanel(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        this._panel.webview.html = this._getHtmlForWebview();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'computeDiff':
                        this._computeDiff(message.leftText, message.rightText);
                        return;
                    case 'clearAll':
                        this._panel.webview.postMessage({ command: 'cleared' });
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    private _computeDiff(leftText: string, rightText: string) {
        const lineDiff = diffLines(leftText, rightText);
        
        let leftHtml = '';
        let rightHtml = '';
        let leftLine = 1;
        let rightLine = 1;
        let additions = 0;
        let removals = 0;

        // Collect all removed and added line groups
        interface DiffBlock {
            type: 'removed' | 'added' | 'unchanged';
            lines: string[];
        }
        
        const diffBlocks: DiffBlock[] = [];
        
        lineDiff.forEach((part: Change) => {
            const lines = part.value.split('\n');
            if (lines[lines.length - 1] === '') {
                lines.pop();
            }

            if (part.added) {
                additions += lines.length;
                diffBlocks.push({ type: 'added', lines });
            } else if (part.removed) {
                removals += lines.length;
                diffBlocks.push({ type: 'removed', lines });
            } else {
                diffBlocks.push({ type: 'unchanged', lines });
            }
        });

        // Process blocks, pairing removed/added blocks when adjacent
        let i = 0;
        while (i < diffBlocks.length) {
            const block = diffBlocks[i];
            
            if (block.type === 'removed' && i + 1 < diffBlocks.length && diffBlocks[i + 1].type === 'added') {
                // We have a removed block followed by an added block - pair them up
                const removedBlock = block;
                const addedBlock = diffBlocks[i + 1];
                const maxLines = Math.max(removedBlock.lines.length, addedBlock.lines.length);
                
                for (let j = 0; j < maxLines; j++) {
                    if (j < removedBlock.lines.length) {
                        const removedLine = removedBlock.lines[j];
                        const addedLine = j < addedBlock.lines.length ? addedBlock.lines[j] : null;
                        
                        // Use character-level diff if both lines exist
                        if (addedLine !== null) {
                            const charDiffHtml = this._getCharacterDiff(removedLine, addedLine, false);
                            leftHtml += `<div class="line removed-line"><span class="line-number">${leftLine}</span><span class="line-content">${charDiffHtml}</span></div>`;
                        } else {
                            leftHtml += `<div class="line removed-line"><span class="line-number">${leftLine}</span><span class="line-content">${this._escapeHtml(removedLine)}</span></div>`;
                        }
                        leftLine++;
                    } else {
                        leftHtml += `<div class="line empty-line"><span class="line-number"></span><span class="line-content"></span></div>`;
                    }
                    
                    if (j < addedBlock.lines.length) {
                        const addedLine = addedBlock.lines[j];
                        const removedLine = j < removedBlock.lines.length ? removedBlock.lines[j] : null;
                        
                        // Use character-level diff if both lines exist
                        if (removedLine !== null) {
                            const charDiffHtml = this._getCharacterDiff(removedLine, addedLine, true);
                            rightHtml += `<div class="line added-line"><span class="line-number">${rightLine}</span><span class="line-content">${charDiffHtml}</span></div>`;
                        } else {
                            rightHtml += `<div class="line added-line"><span class="line-number">${rightLine}</span><span class="line-content">${this._escapeHtml(addedLine)}</span></div>`;
                        }
                        rightLine++;
                    } else {
                        rightHtml += `<div class="line empty-line"><span class="line-number"></span><span class="line-content"></span></div>`;
                    }
                }
                
                i += 2; // Skip both blocks
            } else if (block.type === 'removed') {
                // Standalone removed block
                block.lines.forEach((line: string) => {
                    leftHtml += `<div class="line removed-line"><span class="line-number">${leftLine}</span><span class="line-content">${this._escapeHtml(line)}</span></div>`;
                    rightHtml += `<div class="line empty-line"><span class="line-number"></span><span class="line-content"></span></div>`;
                    leftLine++;
                });
                i++;
            } else if (block.type === 'added') {
                // Standalone added block
                block.lines.forEach((line: string) => {
                    leftHtml += `<div class="line empty-line"><span class="line-number"></span><span class="line-content"></span></div>`;
                    rightHtml += `<div class="line added-line"><span class="line-number">${rightLine}</span><span class="line-content">${this._escapeHtml(line)}</span></div>`;
                    rightLine++;
                });
                i++;
            } else {
                // Unchanged block
                block.lines.forEach((line: string) => {
                    leftHtml += `<div class="line"><span class="line-number">${leftLine}</span><span class="line-content">${this._escapeHtml(line)}</span></div>`;
                    rightHtml += `<div class="line"><span class="line-number">${rightLine}</span><span class="line-content">${this._escapeHtml(line)}</span></div>`;
                    leftLine++;
                    rightLine++;
                });
                i++;
            }
        }

        this._panel.webview.postMessage({
            command: 'displayDiff',
            leftHtml,
            rightHtml,
            additions,
            removals
        });
    }

    private _getCharacterDiff(oldText: string, newText: string, isAdded: boolean): string {
        // Use character-level diff for precise detection
        const charDiff = diffChars(oldText, newText);
        let html = '';
        
        charDiff.forEach((part: Change) => {
            const escaped = this._escapeHtml(part.value);
            if (part.added && isAdded) {
                // Highlight added characters with underline
                html += `<span class="char-added">${escaped}</span>`;
            } else if (part.removed && !isAdded) {
                // Highlight removed characters with strikethrough
                html += `<span class="char-removed">${escaped}</span>`;
            } else if (!part.added && !part.removed) {
                // Unchanged text
                html += escaped;
            }
        });
        
        return html;
    }

    private _escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    private _getHtmlForWebview(): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Diff Checker</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    height: 100vh;
                    overflow: hidden;
                }

                .container {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                }

                .header {
                    padding: 15px 20px;
                    background-color: var(--vscode-editorGroupHeader-tabsBackground);
                    border-bottom: 1px solid var(--vscode-panel-border);
                }

                .header h1 {
                    font-size: 18px;
                    margin-bottom: 10px;
                    color: var(--vscode-foreground);
                }

                .input-section {
                    display: flex;
                    gap: 20px;
                    flex: 1;
                    min-height: 200px;
                    padding: 20px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                }

                .input-column {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .input-column label {
                    font-weight: 600;
                    font-size: 14px;
                }

                textarea {
                    flex: 1;
                    padding: 12px;
                    font-family: 'Monaco', 'Courier New', monospace;
                    font-size: 13px;
                    border: 1px solid var(--vscode-input-border);
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border-radius: 4px;
                    resize: none;
                    outline: none;
                }

                textarea:focus {
                    border-color: var(--vscode-focusBorder);
                }

                .button-section {
                    padding: 15px 20px;
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    background-color: var(--vscode-editorGroupHeader-tabsBackground);
                    border-bottom: 1px solid var(--vscode-panel-border);
                }

                button {
                    padding: 10px 30px;
                    font-size: 14px;
                    font-weight: 600;
                    border: none;
                    border-radius: 4px;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }

                button.secondary {
                    background-color: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                }

                button.secondary:hover {
                    background-color: var(--vscode-button-secondaryHoverBackground);
                }

                .stats {
                    padding: 10px 20px;
                    background-color: var(--vscode-editorGroupHeader-tabsBackground);
                    border-bottom: 1px solid var(--vscode-panel-border);
                    display: none;
                    gap: 30px;
                }

                .stats.visible {
                    display: flex;
                }

                .stat-item {
                    font-size: 13px;
                }

                .stat-removal {
                    color: #f97583;
                }

                .stat-addition {
                    color: #85e89d;
                }

                .diff-section {
                    display: none;
                    flex: 1;
                    overflow: hidden;
                }

                .diff-section.visible {
                    display: flex;
                }

                .diff-pane {
                    flex: 1;
                    overflow-y: auto;
                    font-family: 'Monaco', 'Courier New', monospace;
                    font-size: 13px;
                    background-color: var(--vscode-editor-background);
                    border-right: 1px solid var(--vscode-panel-border);
                }

                .diff-pane:last-child {
                    border-right: none;
                }

                .line {
                    display: flex;
                    min-height: 20px;
                    line-height: 20px;
                }

                .line-number {
                    display: inline-block;
                    width: 50px;
                    padding: 0 10px;
                    text-align: right;
                    color: var(--vscode-editorLineNumber-foreground);
                    background-color: var(--vscode-editorGutter-background);
                    border-right: 1px solid var(--vscode-panel-border);
                    user-select: none;
                    flex-shrink: 0;
                }

                .line-content {
                    padding: 0 10px;
                    white-space: pre;
                    flex: 1;
                }

                .removed-line {
                    background-color: rgba(249, 117, 131, 0.15);
                }

                .removed-line .line-content {
                    background-color: rgba(249, 117, 131, 0.15);
                }

                .added-line {
                    background-color: rgba(133, 232, 157, 0.15);
                }

                .added-line .line-content {
                    background-color: rgba(133, 232, 157, 0.15);
                }

                .empty-line {
                    background-color: rgba(128, 128, 128, 0.05);
                }

                .empty-line .line-content {
                    background-color: rgba(128, 128, 128, 0.05);
                }

                .char-added {
                    background-color: rgba(133, 232, 157, 0.6);
                    font-weight: 700;
                    border-radius: 3px;
                    padding: 2px 3px;
                }

                .char-removed {
                    background-color: rgba(249, 117, 131, 0.6);
                    font-weight: 700;
                    border-radius: 3px;
                    padding: 2px 3px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📝 Diff Checker</h1>
                </div>

                <div class="input-section">
                    <div class="input-column">
                        <label>Original Text</label>
                        <textarea id="leftInput" placeholder="Paste your original text here..."></textarea>
                    </div>
                    <div class="input-column">
                        <label>Modified Text</label>
                        <textarea id="rightInput" placeholder="Paste your modified text here..."></textarea>
                    </div>
                </div>

                <div class="button-section">
                    <button id="compareBtn">Compare Texts</button>
                    <button id="clearBtn" class="secondary">Clear All</button>
                </div>

                <div class="stats" id="stats">
                    <div class="stat-item stat-removal">
                        <span id="removals">0</span> removal(s)
                    </div>
                    <div class="stat-item stat-addition">
                        <span id="additions">0</span> addition(s)
                    </div>
                </div>

                <div class="diff-section" id="diffSection">
                    <div class="diff-pane" id="leftPane"></div>
                    <div class="diff-pane" id="rightPane"></div>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                
                const leftInput = document.getElementById('leftInput');
                const rightInput = document.getElementById('rightInput');
                const compareBtn = document.getElementById('compareBtn');
                const clearBtn = document.getElementById('clearBtn');
                const stats = document.getElementById('stats');
                const diffSection = document.getElementById('diffSection');
                const leftPane = document.getElementById('leftPane');
                const rightPane = document.getElementById('rightPane');
                const additionsSpan = document.getElementById('additions');
                const removalsSpan = document.getElementById('removals');

                compareBtn.addEventListener('click', () => {
                    const leftText = leftInput.value;
                    const rightText = rightInput.value;

                    vscode.postMessage({
                        command: 'computeDiff',
                        leftText: leftText,
                        rightText: rightText
                    });
                });

                clearBtn.addEventListener('click', () => {
                    vscode.postMessage({
                        command: 'clearAll'
                    });
                });

                window.addEventListener('message', event => {
                    const message = event.data;
                    
                    switch (message.command) {
                        case 'displayDiff':
                            leftPane.innerHTML = message.leftHtml;
                            rightPane.innerHTML = message.rightHtml;
                            additionsSpan.textContent = message.additions;
                            removalsSpan.textContent = message.removals;
                            stats.classList.add('visible');
                            diffSection.classList.add('visible');
                            
                            // Sync scrolling
                            leftPane.addEventListener('scroll', () => {
                                rightPane.scrollTop = leftPane.scrollTop;
                            });
                            
                            rightPane.addEventListener('scroll', () => {
                                leftPane.scrollTop = rightPane.scrollTop;
                            });
                            break;
                        case 'cleared':
                            leftInput.value = '';
                            rightInput.value = '';
                            leftPane.innerHTML = '';
                            rightPane.innerHTML = '';
                            stats.classList.remove('visible');
                            diffSection.classList.remove('visible');
                            break;
                    }
                });
            </script>
        </body>
        </html>`;
    }

    public dispose() {
        DiffCheckerPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}

