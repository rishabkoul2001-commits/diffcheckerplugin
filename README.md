# Diff Checker - Side-by-Side Text Comparison

A beautiful, intuitive diff checker extension for VS Code and Cursor that helps you compare text with visual highlighting and character-level precision.

![Diff Checker](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### 🔄 Side-by-Side Comparison
Compare text in two elegant panes with perfect alignment and synchronized scrolling.

### 🎨 Visual Diff Highlighting
- **Green highlighting** for additions
- **Red highlighting** for removals
- **Character-level highlighting** shows exact word changes within modified lines

### 📊 Live Statistics
View real-time statistics showing the number of additions and removals.

### 🧹 Quick Actions
- **Clear All** button to quickly reset and start a new comparison
- **Compare Texts** button to generate diff on demand

### 🎯 Developer-Friendly
- Line numbers for easy reference
- Monospace font for code comparison
- Synchronized scrolling between panes
- Theme-aware design (adapts to your VS Code theme)

## 🚀 Usage

1. Open the Command Palette:
   - **Mac**: `Cmd+Shift+P`
   - **Windows/Linux**: `Ctrl+Shift+P`

2. Type **"Open Diff Checker"** and press Enter

3. Paste your texts:
   - **Left pane**: Original text
   - **Right pane**: Modified text

4. Click **"Compare Texts"** to see the differences highlighted

5. Use **"Clear All"** to reset when you want to compare new texts

## 📝 Perfect For

- Comparing code snippets
- Reviewing text changes
- Analyzing document revisions
- Spotting differences in configuration files
- Checking translations
- Validating data transformations

## 🎬 Example Use Cases

### Code Review
```
Original: function hello() { return "Hi"; }
Modified: function hello() { return "Hello World"; }
```

### Document Comparison
```
Original: The quick brown fox
Modified: The quick red fox
```
See exactly which words changed with character-level highlighting!

## 🔧 How It Works

The extension uses advanced diff algorithms to:
1. Compare texts line by line
2. Align removed and added lines horizontally
3. Highlight character-level changes within similar lines
4. Display clear visual indicators for all modifications

## Installation

### For Development

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to compile TypeScript
4. Press `F5` to open a new window with the extension loaded
5. Run the "Open Diff Checker" command

### For Production

1. Run `npm install` to install dependencies
2. Run `npm run compile` to build the extension
3. The extension is ready to use!

## Building

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes (development)
npm run watch
```

## 💡 Tips

- The extension works offline - no data is sent anywhere
- All comparisons happen locally in your editor
- Character-level diff works best on similar lines
- Use synchronized scrolling to navigate large diffs easily

## 🛠️ Requirements

- VS Code or Cursor version 1.74.0 or higher

## 🤝 Contributing

Found a bug or have a feature request? Feel free to open an issue on GitHub!

## 📄 License

MIT License - feel free to use this extension in any way you like!

## ⭐ Support

If you find this extension helpful, please consider:
- Rating it on the marketplace
- Sharing it with your colleagues
- Starring the repository on GitHub

---

**Made with ❤️ for developers who love clean diffs**

# diffcheckerplugin
