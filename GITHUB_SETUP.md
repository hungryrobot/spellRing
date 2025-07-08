# GitHub Setup Guide

Follow these steps to get your D&D spell app on GitHub and deploy to Vercel.

## Step 1: Download Your Code

1. **Download project**: In Replit, click the three dots menu → Download as ZIP
2. **Extract files**: Unzip the downloaded file to your computer
3. **Clean up**: The extracted folder will contain your project files

## Step 2: Create GitHub Repository

1. **Go to GitHub**: Visit [github.com](https://github.com) and sign in (or create account)
2. **New repository**: Click the "+" icon → "New repository"
3. **Repository settings**:
   - Name: `dnd-spell-ring-manager` (or your preferred name)
   - Description: "D&D Ring of Spell Storing Manager"
   - Set to **Public** (required for free Vercel deployment)
   - **Don't** check "Add a README file" (we already have one)
4. **Create repository**: Click "Create repository"

## Step 3: Upload Your Code

### Option A: Using GitHub Web Interface (Easiest)

1. **Upload files**: On your new repository page, click "uploading an existing file"
2. **Drag and drop**: Drag all your project files (not the folder, just the contents)
3. **Commit**: 
   - Commit message: "Initial commit - D&D Spell Ring Manager"
   - Click "Commit changes"

### Option B: Using Git Commands (If you have Git installed)

```bash
# Navigate to your project folder
cd path/to/your/extracted/project

# Initialize git
git init

# Add GitHub remote (replace with your username and repo name)
git remote add origin https://github.com/YOUR_USERNAME/dnd-spell-ring-manager.git

# Add all files
git add .

# Commit
git commit -m "Initial commit - D&D Spell Ring Manager"

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

1. **Go to Vercel**: Visit [vercel.com](https://vercel.com)
2. **Sign up**: Use your GitHub account to sign in
3. **Import project**: Click "New Project" → Import from GitHub
4. **Select repository**: Choose your `dnd-spell-ring-manager` repository
5. **Configure project**:
   - Framework Preset: **Other** (auto-detected)
   - Root Directory: `./` (leave default)
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

## Step 5: Add Database

### Option A: Use Neon (Recommended - Free Forever)

1. **Go to Neon**: Visit [neon.tech](https://neon.tech)
2. **Sign up**: Create free account
3. **Create database**: 
   - Database name: `spellring`
   - Region: Choose closest to you
4. **Get connection string**: Copy the PostgreSQL connection string
5. **Add to Vercel**: 
   - Go to your Vercel project settings
   - Environment Variables → Add new
   - Name: `DATABASE_URL`
   - Value: Your Neon connection string
   - Save

### Option B: Use Vercel PostgreSQL

1. **In Vercel project**: Go to Storage tab
2. **Create database**: Click "Create" → PostgreSQL
3. **Connect**: Vercel will automatically add DATABASE_URL environment variable

## Step 6: Deploy & Test

1. **Deploy**: Click "Deploy" in Vercel
2. **Wait**: Deployment takes 2-3 minutes
3. **Get URL**: Copy your app URL (like `yourapp.vercel.app`)
4. **Test**: Open URL in browser to verify it works

## Step 7: Set Up Database Schema

1. **Open your app**: Go to your Vercel URL
2. **Upload CSV**: Use the Setup page to upload your spell data
3. **The app will automatically create database tables**

## Step 8: Add to iPad

1. **Open Safari**: On your iPad, go to your Vercel URL
2. **Add to home screen**: 
   - Tap the Share button (square with arrow)
   - Scroll down and tap "Add to Home Screen"
   - Name it "D&D Spells" or your preference
   - Tap "Add"

## Troubleshooting

**Build fails?**
- Check that all files uploaded correctly
- Verify package.json is in the root directory

**Database connection error?**
- Double-check DATABASE_URL environment variable
- Ensure database URL includes `?sslmode=require` for Neon

**App loads but no spells?**
- Upload CSV data through the Setup page
- Check browser console for errors

**Need help?**
- Check Vercel deployment logs
- Ensure GitHub repository is public
- Verify all files are committed

Your app will be live and accessible from any device with internet!