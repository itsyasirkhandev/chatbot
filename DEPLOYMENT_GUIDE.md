# Deployment Guide - GitHub & Vercel

## Step 1: Push to GitHub Repository

### Open Terminal/PowerShell in Project Directory
```bash
cd C:\Users\Admin\Workspace\langchain_streaming_chatbot_ui\gemini-chatbot
```

### Initialize Git (if not already done)
```bash
git init
```

### Configure Git (if first time)
```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Add Remote Repository
```bash
git remote add origin https://github.com/itsyasirkhandev/chatbot.git
```

### Check Remote
```bash
git remote -v
```

### Stage All Files
```bash
git add .
```

### Check What Will Be Committed
```bash
git status
```

**Verify:**
- ✅ `.env.local` should NOT appear (API key is safe)
- ✅ Only source code files should be listed
- ✅ Documentation files should be ignored

### Commit Changes
```bash
git commit -m "Initial commit: AI chatbot with Gemini 2.5 Flash"
```

### Push to GitHub
```bash
# If main branch
git branch -M main
git push -u origin main

# If master branch
git branch -M master
git push -u origin master
```

---

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Website (Recommended)

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Sign in with your GitHub account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Find `itsyasirkhandev/chatbot`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (keep default)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

4. **Add Environment Variables** ⚠️ IMPORTANT
   Click "Environment Variables" and add:
   
   | Name | Value |
   |------|-------|
   | `GEMINI_API_KEY` | `your-actual-api-key-here` |

   **Where to find your API key:**
   - Open your local `.env.local` file
   - Copy the value after `GEMINI_API_KEY=`
   - Paste it in Vercel

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (1-2 minutes)
   - Your app will be live at: `https://your-project.vercel.app`

---

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd C:\Users\Admin\Workspace\langchain_streaming_chatbot_ui\gemini-chatbot
   vercel
   ```

4. **Follow Prompts**
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N** (first time)
   - What's your project's name? **chatbot**
   - In which directory is your code located? **./`**
   - Auto-detected: Next.js, continue? **Y**

5. **Add Environment Variable**
   ```bash
   vercel env add GEMINI_API_KEY
   ```
   - Paste your API key when prompted
   - Select: Production, Preview, Development (all)

6. **Redeploy with Env**
   ```bash
   vercel --prod
   ```

---

## Step 3: Verify Deployment

### Check Your Live Site
1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Test the chatbot
3. Check if API calls work
4. Verify code blocks render correctly

### Common Issues & Solutions

#### Issue: "GEMINI_API_KEY is not defined"
**Solution:**
- Add the environment variable in Vercel dashboard
- Go to Project Settings → Environment Variables
- Add `GEMINI_API_KEY` with your key
- Redeploy

#### Issue: Build fails
**Solution:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Try building locally first: `npm run build`

#### Issue: API calls fail
**Solution:**
- Verify API key is correct in Vercel
- Check if API key has proper permissions
- Review function logs in Vercel dashboard

---

## Step 4: Update Deployment (Future Changes)

### After Making Code Changes
```bash
# Stage changes
git add .

# Commit
git commit -m "Description of changes"

# Push to GitHub
git push origin main
```

**Vercel will automatically:**
- Detect the push
- Build your project
- Deploy the new version
- Live in ~1-2 minutes

---

## Environment Variables Checklist

Ensure these are set in Vercel:

- [x] `GEMINI_API_KEY` - Your Google Gemini API key

**To add more:**
1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add new variables
5. Redeploy if needed

---

## Useful Commands

### View Deployment Logs
```bash
vercel logs
```

### View Environment Variables
```bash
vercel env ls
```

### Remove Deployment
```bash
vercel remove
```

### Link Local to Vercel Project
```bash
vercel link
```

---

## Security Checklist

- [x] `.env.local` is in `.gitignore`
- [x] API key is NOT in code
- [x] API key is added to Vercel dashboard
- [x] GitHub repository is connected
- [x] Automatic deployments enabled

---

## Final URLs

After deployment, you'll have:

- **Production**: `https://chatbot-yourusername.vercel.app`
- **GitHub**: `https://github.com/itsyasirkhandev/chatbot`
- **Vercel Dashboard**: `https://vercel.com/dashboard`

---

## Quick Reference

### Push Updates
```bash
git add .
git commit -m "Update message"
git push origin main
```

### Check Status
```bash
git status
vercel --prod
```

### View Live Site
```bash
vercel --prod --open
```

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **GitHub Help**: https://docs.github.com/

---

## Success! 🎉

Your chatbot is now:
- ✅ Backed up on GitHub
- ✅ Deployed on Vercel
- ✅ Accessible worldwide
- ✅ Automatically updates on push
