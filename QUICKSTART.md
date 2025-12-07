# Quick Start Guide

## 🚀 Running Your Diff Checker Plugin

Your diff checker plugin is now ready to use! Follow these steps:

### Method 1: Test in Development Mode (F5)

1. **Open the project in Cursor/VS Code**
   - Open the folder `/Users/rishabkoul/Desktop/Work/diffcheckerplugin` in Cursor

2. **Press F5**
   - This will open a new "Extension Development Host" window with your extension loaded

3. **Open the Diff Checker**
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "Open Diff Checker"
   - Press Enter

4. **Use the Diff Checker**
   - Paste your original text in the left textarea
   - Paste your modified text in the right textarea
   - Click "Compare Texts"
   - See the beautiful side-by-side diff with color highlighting!

### Method 2: Package and Install

To create a `.vsix` file that you can share or install permanently:

```bash
# Install vsce (VS Code Extension Manager)
npm install -g @vscode/vsce

# Package your extension
vsce package

# This creates a .vsix file that you can install
```

Then install it via:
- Command Palette → "Extensions: Install from VSIX..."
- Select the generated `.vsix` file

## ✨ Features You'll See

- **Green highlighting** = Added lines
- **Red highlighting** = Removed lines
- **Synchronized scrolling** = Both panes scroll together
- **Line numbers** = Easy reference
- **Statistics** = Count of additions and removals
- **Theme support** = Automatically matches your Cursor theme

## 🎯 Example Usage

Try these sample texts:

**Left (Original):**
```
hello
world
```

**Right (Modified):**
```
hello
world!
goodbye
```

You'll see "world" marked as removed (red) on the left, and "world!" and "goodbye" marked as added (green) on the right!

## 🔧 Development Commands

```bash
# Compile TypeScript
npm run compile

# Watch for changes (auto-compile)
npm run watch

# Lint your code
npm run lint
```

## 📝 Notes

- The extension works in both Cursor and VS Code
- All diffs are computed locally - nothing is sent to any server
- The webview retains its state even when hidden

Enjoy your diff checker! 🎉

