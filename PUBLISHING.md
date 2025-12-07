# Publishing Guide - Diff Checker Extension

This guide will walk you through publishing your extension to the VS Code Marketplace.

## Prerequisites

Before publishing, you need:

1. **Microsoft Account** - Create one at https://account.microsoft.com if you don't have one
2. **Azure DevOps Organization** - For generating a Personal Access Token (PAT)
3. **Publisher Name** - A unique name for publishing extensions

## Step 1: Create an Azure DevOps Organization

1. Go to https://dev.azure.com
2. Sign in with your Microsoft account
3. Click "Create new organization"
4. Choose a name for your organization

## Step 2: Generate a Personal Access Token (PAT)

1. In Azure DevOps, click on your profile icon (top right)
2. Click **"Personal access tokens"**
3. Click **"+ New Token"**
4. Configure the token:
   - **Name**: "VS Code Extension Publishing" (or any name)
   - **Organization**: Select "All accessible organizations"
   - **Expiration**: Choose your preferred expiration (recommended: 90 days)
   - **Scopes**: Click "Show all scopes" and select:
     - ✅ **Marketplace** → **Manage**
5. Click **"Create"**
6. **IMPORTANT**: Copy and save the token immediately (you won't see it again!)

## Step 3: Create a Publisher

1. Go to https://marketplace.visualstudio.com/manage
2. Sign in with the same Microsoft account
3. Click **"Create publisher"**
4. Fill in the form:
   - **ID**: Your unique publisher ID (lowercase, no spaces) - e.g., "yourname"
   - **Name**: Display name - e.g., "Your Name"
   - **Email**: Your contact email
5. Click **"Create"**

## Step 4: Update package.json

Update these fields in `package.json`:

```json
{
  "publisher": "your-publisher-id",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/diffcheckerplugin"
  },
  "bugs": {
    "url": "https://github.com/yourusername/diffcheckerplugin/issues"
  },
  "homepage": "https://github.com/yourusername/diffcheckerplugin#readme"
}
```

## Step 5: Create an Icon

The extension needs a 128x128 PNG icon. You can:

### Option A: Use Online Tool
1. Go to https://www.canva.com or https://www.figma.com
2. Create a 128x128 px image
3. Design your icon (suggestion: use symbols like ⇄, ⟷, or split view icons)
4. Export as `icon.png`
5. Save it in the root directory

### Option B: Use This SVG Template
Create an SVG file and convert it to PNG:

```svg
<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" fill="#4CAF50" rx="20"/>
  <rect x="15" y="35" width="45" height="60" fill="#fff" rx="5"/>
  <rect x="68" y="35" width="45" height="60" fill="#fff" rx="5"/>
  <path d="M 60 60 L 68 60" stroke="#fff" stroke-width="3"/>
  <path d="M 60 68 L 68 68" stroke="#fff" stroke-width="3"/>
</svg>
```

Convert SVG to PNG at: https://cloudconvert.com/svg-to-png

### Option C: Skip Icon for Now
Remove the `"icon": "icon.png"` line from package.json

## Step 6: Install VSCE (VS Code Extension Manager)

```bash
npm install -g @vscode/vsce
```

## Step 7: Package Your Extension

```bash
# Make sure everything is compiled
npm run compile

# Package the extension
vsce package
```

This creates a `.vsix` file (e.g., `diffchecker-plugin-1.0.0.vsix`)

## Step 8: Test the Packaged Extension (Optional)

Before publishing, test the packaged version:

1. Open VS Code / Cursor
2. Go to Extensions view
3. Click "..." menu → "Install from VSIX..."
4. Select your `.vsix` file
5. Test the extension

## Step 9: Publish to Marketplace

### Using Command Line

```bash
# Login with your Personal Access Token
vsce login your-publisher-id

# It will prompt for your PAT - paste it

# Publish the extension
vsce publish
```

### Using Web Interface

1. Go to https://marketplace.visualstudio.com/manage
2. Click on your publisher name
3. Click **"+ New extension"** → **"Visual Studio Code"**
4. Drag and drop your `.vsix` file
5. Click **"Upload"**

## Step 10: Update Future Versions

When you make changes:

```bash
# Update version in package.json (e.g., 1.0.0 → 1.1.0)

# Compile changes
npm run compile

# Publish update
vsce publish
```

Or use automatic version bump:

```bash
vsce publish patch  # 1.0.0 → 1.0.1
vsce publish minor  # 1.0.0 → 1.1.0
vsce publish major  # 1.0.0 → 2.0.0
```

## Troubleshooting

### "Publisher not found"
- Make sure you created a publisher at marketplace.visualstudio.com/manage
- Ensure the publisher ID in package.json matches exactly

### "Missing icon.png"
- Either create an icon.png file or remove the icon field from package.json

### "Missing repository"
- Either add a GitHub repository or remove repository fields from package.json

### "PAT token invalid"
- Generate a new token with correct scopes (Marketplace → Manage)
- Make sure token hasn't expired

## Tips

- ✅ Add meaningful keywords to improve discoverability
- ✅ Include screenshots in README (marketplace shows them)
- ✅ Keep README clear and concise
- ✅ Respond to user reviews and issues
- ✅ Update regularly with bug fixes and features

## Resources

- [VS Code Publishing Guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Marketplace Publisher Portal](https://marketplace.visualstudio.com/manage)
- [Extension Manifest Reference](https://code.visualstudio.com/api/references/extension-manifest)

---

Good luck with your extension! 🚀

