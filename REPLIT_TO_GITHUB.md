# Deploy Directly from Replit to GitHub

If you can't find the download option, we can push your code directly from Replit to GitHub!

## Step 1: Create GitHub Repository

1. **Go to GitHub.com** and sign in (or create account)
2. **Click the "+" icon** → "New repository"
3. **Repository settings:**
   - Name: `dnd-spell-ring-manager`
   - Description: "D&D Ring of Spell Storing Manager"
   - Set to **Public**
   - **Don't** check "Add a README file"
4. **Create repository**
5. **Copy the repository URL** (looks like: `https://github.com/YOUR_USERNAME/dnd-spell-ring-manager.git`)

## Step 2: Push from Replit Console

In your Replit console (Shell tab), run these commands:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your code
git commit -m "Initial commit - D&D Spell Ring Manager"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/dnd-spell-ring-manager.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note:** Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 3: If Git asks for credentials

When you push, GitHub might ask for your username and password:
- **Username:** Your GitHub username
- **Password:** Use a Personal Access Token (not your regular password)

### To create a Personal Access Token:
1. **GitHub Settings** → Developer settings → Personal access tokens → Tokens (classic)
2. **Generate new token** with "repo" permissions
3. **Copy the token** and use it as your password

## Step 4: Deploy to Vercel

Once your code is on GitHub:
1. **Go to Vercel.com** and sign in with GitHub
2. **Import your repository**
3. **Add DATABASE_URL** environment variable
4. **Deploy!**

## Alternative: Manual Upload to GitHub

If Git doesn't work:
1. **Create the repository** on GitHub
2. **Click "uploading an existing file"**
3. **Select all files** from your Replit project
4. **Drag them** to the GitHub upload area
5. **Commit changes**

Your code will be ready for Vercel deployment!