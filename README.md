# Market Map Creator

An interactive market map application to categorize and visualize firms and products with persistent data storage.

## Features

- **Interactive Kanban View**: Organize firms into customizable categories
- **Matrix View**: Cross-reference firms by category and subcategory  
- **Data Persistence**: Automatically saves work to browser localStorage
- **Export/Import**: Share data between colleagues via JSON files
- **Real-time Updates**: All changes are automatically saved
- **Multiple Market Maps**: Create and manage different market maps

## Getting Started

### For Colleagues (Using the Deployed App)

1. Visit the deployed app URL (provided after deployment)
2. Start creating market maps and adding firms
3. Your work is automatically saved in your browser
4. Use Export/Import to share data with teammates

### For Developers

#### Prerequisites
- Node.js (v16 or higher)
- npm

#### Installation
```bash
git clone <repository-url>
cd market-map-creator
npm install
```

#### Development
```bash
npm run dev
```
Open http://localhost:5173 in your browser.

#### Build for Production
```bash
npm run build
```

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

1. **Fork/Clone to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/market-map-creator.git
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite app
   - Click "Deploy"
   - Your app will be live in ~2 minutes!

3. **Share with Colleagues**:
   - Copy the Vercel URL (e.g., `https://market-map-creator.vercel.app`)
   - Share this URL with your team

### Option 2: Netlify

1. **Deploy via Drag & Drop**:
   - Run `npm run build`
   - Go to [netlify.com](https://netlify.com)
   - Drag the `dist` folder to Netlify's deploy area
   - Get your live URL instantly

2. **Deploy via GitHub** (for auto-updates):
   - Push code to GitHub (same as Vercel step 1)
   - Connect Netlify to your GitHub repo
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Deploy!

### Option 3: GitHub Pages

1. **Enable GitHub Pages**:
   ```bash
   npm run build
   # Push the dist folder contents to gh-pages branch
   ```

## Usage Guide

### Creating Your First Market Map

1. **Add Firms**: Use the form at the bottom to add companies
2. **Organize Categories**: Create custom buckets for different market segments
3. **Assign Subcategories**: Tag firms with specific subcategories
4. **Switch Views**: Toggle between Kanban and Matrix views

### Sharing Data with Colleagues

#### Method 1: Export/Import Files
1. Click "Export Data" to download a JSON file
2. Share the file with colleagues via email/Slack
3. Colleagues can use "Import Data" to load your market map

#### Method 2: Shared URL (if using cloud storage)
- All colleagues access the same deployed URL
- Each person's data is saved locally in their browser
- Use export/import to merge data as needed

### Data Management

- **Auto-Save**: All changes are automatically saved to your browser
- **Multiple Maps**: Create different maps for different markets
- **Backup**: Regularly export your data as backup files
- **Recovery**: If you lose data, import from a previous export

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Troubleshooting

### Data Not Saving
- Ensure your browser allows localStorage
- Check if you're in private/incognito mode (localStorage is limited)
- Try clearing browser cache and refreshing

### Import/Export Issues
- Ensure JSON files are valid (not corrupted)
- File must have been exported from this app
- Try using a different browser

### Deployment Issues
- Ensure all dependencies are installed: `npm install`
- Verify build works locally: `npm run build`
- Check that your hosting platform supports single-page applications

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## License

Apache-2.0 License - see LICENSE file for details.
