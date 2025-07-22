# Quick Deployment Guide

## 🚀 Deploy to Vercel (Recommended - 5 minutes)

### Step 1: Push to GitHub
```bash
# In your project folder
git add .
git commit -m "Market Map Creator - Ready for deployment"
git branch -M main

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/market-map-creator.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Click "New Project" 
4. Select your `market-map-creator` repository
5. Click "Deploy" (Vercel auto-detects Vite settings)
6. Wait 2 minutes for deployment ✅

### Step 3: Share with Team
- Copy your Vercel URL (e.g., `https://market-map-creator-abc123.vercel.app`)
- Share this URL with colleagues
- Everyone can now use the app and save their work!

---

## ⚡ Alternative: Netlify (Drag & Drop)

### Option A: Simple Upload
1. Run `npm run build` in your terminal
2. Go to [netlify.com](https://netlify.com)
3. Drag the `dist` folder to Netlify's deploy area
4. Get instant live URL!

### Option B: GitHub Integration
1. Push code to GitHub (same as Vercel Step 1)
2. On Netlify, click "New site from Git"
3. Connect your GitHub repo
4. Build settings: Command=`npm run build`, Directory=`dist`
5. Deploy!

---

## 📱 Features Your Team Gets

✅ **Auto-save**: Work is automatically saved in browser  
✅ **Export/Import**: Share data via JSON files  
✅ **Multiple Views**: Kanban and Matrix views  
✅ **Multiple Maps**: Create different market maps  
✅ **Real-time**: All changes saved instantly  

## 🔧 Troubleshooting

**Q: Data not saving?**  
A: Check if browser allows localStorage (disable private/incognito mode)

**Q: Want to share data between team members?**  
A: Use Export/Import buttons in the app header

**Q: Need to backup data?**  
A: Click "Export Data" regularly to download backup files

---

## 🎯 Ready to Deploy?

Choose your method:
- **Vercel**: Best for auto-updates from GitHub
- **Netlify**: Great for one-time uploads or GitHub integration

Both are free and will give you a shareable URL in minutes! 