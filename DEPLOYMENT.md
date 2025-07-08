# Deployment Guide for D&D Spell Ring Manager

This guide shows you how to deploy your spell management app to free hosting platforms that work great on iPad.

## Option 1: Vercel (Recommended for Full-Stack Apps)

**Why Vercel:**
- Free tier with generous limits
- Automatic HTTPS
- Great performance on mobile devices
- Built-in database support

**Steps:**
1. Create account at vercel.com
2. Connect your GitHub (push this code to a GitHub repo first)
3. Import project from GitHub
4. Set environment variables in Vercel dashboard:
   - `DATABASE_URL` (use Vercel's free PostgreSQL or Neon.tech)
5. Deploy automatically

## Option 2: Railway

**Why Railway:**
- Free $5 monthly credit
- Includes free PostgreSQL database
- Simple deployment process

**Steps:**
1. Create account at railway.app
2. Create new project from GitHub repo
3. Add PostgreSQL service
4. Deploy automatically

## Option 3: Render

**Why Render:**
- Free tier for web services
- Free PostgreSQL database (90 days)
- Automatic SSL

**Steps:**
1. Create account at render.com
2. Create web service from GitHub
3. Add PostgreSQL database
4. Set environment variables
5. Deploy

## Option 4: Netlify + Serverless Functions

**Why Netlify:**
- Excellent for frontend hosting
- Serverless functions for API
- Great mobile performance

**Steps:**
1. Build static frontend
2. Convert API to serverless functions
3. Deploy to netlify.com

## Preparing Your Code

Before deploying to any platform, you'll need to:

1. **Push to GitHub:**
   - Create a GitHub repository
   - Push your code there
   - Most platforms deploy from GitHub

2. **Set up Database:**
   - Use the platform's database or Neon.tech (free)
   - Update DATABASE_URL environment variable

3. **Configure Build:**
   - Most platforms auto-detect Node.js apps
   - Build command: `npm run build`
   - Start command: `npm start`

## For iPad Use

Once deployed:
1. Open the app URL in Safari on your iPad
2. Tap the Share button
3. Choose "Add to Home Screen"
4. Your app will behave like a native iPad app

## Recommended Choice

**Vercel** is the best option because:
- Free tier is very generous
- Perfect for React + Node.js apps
- Excellent mobile performance
- Easy database integration
- Automatic deployments from GitHub

Would you like me to help prepare your code for any specific platform?