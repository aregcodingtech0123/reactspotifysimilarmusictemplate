# 🚀 GitHub Deployment Guide

Step-by-step guide to deploy your Music Recommendation System to GitHub.

## Prerequisites

- Git installed and configured
- GitHub account
- GitHub repository created (or you'll create one)

## Step-by-Step Deployment Commands

### Step 1: Initialize Git Repository (if not already initialized)

```bash
# Navigate to project root
cd "c:\Users\User-pc\Desktop\kendi projelerim\reactspotifysimilarmusictemplate-main\reactspotifysimilarmusictemplate-main"

# Initialize git (if not already done)
git init
```

### Step 2: Check Current Status

```bash
# Check git status
git status

# See what files will be committed
git status --short
```

### Step 3: Add All Files to Staging

```bash
# Add all files to staging area
git add .

# Verify what's staged
git status
```

### Step 4: Create Initial Commit

```bash
# Create your first commit
git commit -m "Initial commit: AI-powered music recommendation system

- Full-stack application with React frontend
- Multi-service backend (Express, NestJS, FastAPI)
- PostgreSQL database with Prisma ORM
- ChromaDB vector store for AI embeddings
- Deezer API integration for real music data
- Google Gemini AI for recommendations
- User authentication with JWT and OAuth
- Complete documentation and setup guides"
```

### Step 5: Create GitHub Repository

**Option A: Using GitHub Website**
1. Go to https://github.com/new
2. Repository name: `music-app` (or your preferred name)
3. Description: "AI-powered music recommendation system with React, FastAPI, and Google Gemini"
4. Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

**Option B: Using GitHub CLI** (if installed)
```bash
gh repo create music-app --public --description "AI-powered music recommendation system"
```

### Step 6: Add Remote Repository

```bash
# Add GitHub repository as remote origin
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/music-app.git

# Verify remote was added
git remote -v
```

### Step 7: Rename Main Branch (if needed)

```bash
# Check current branch name
git branch

# If branch is named 'master', rename to 'main'
git branch -M main
```

### Step 8: Push to GitHub

```bash
# Push code to GitHub
git push -u origin main

# If you get authentication error, you may need to:
# - Use Personal Access Token instead of password
# - Or set up SSH keys
```

### Step 9: Verify Deployment

1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/music-app`
2. Verify all files are uploaded
3. Check that README.md displays correctly
4. Verify .gitignore is working (no .env files visible)

## Additional GitHub Setup

### Add Repository Topics

On GitHub repository page:
1. Click the gear icon ⚙️ next to "About"
2. Add topics: `react`, `fastapi`, `postgresql`, `ai`, `music`, `recommendation-system`, `chromadb`, `gemini`

### Add Repository Description

Update repository description to:
```
AI-powered music recommendation system with React frontend, FastAPI backend, PostgreSQL database, and Google Gemini AI embeddings
```

### Enable GitHub Pages (Optional)

If you want to host documentation:
1. Go to Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` / `docs` folder
4. Save

## Post-Deployment Checklist

- [ ] README.md displays correctly
- [ ] All documentation files are visible
- [ ] .gitignore is working (no sensitive files committed)
- [ ] No .env files in repository
- [ ] License file is present
- [ ] Contributing guidelines are visible
- [ ] Setup instructions are clear

## Security Reminders

**IMPORTANT:** Before pushing, ensure:

1. **No sensitive data in code:**
   ```bash
   # Check for API keys or secrets
   git grep "AIzaSy"  # Google API key pattern
   git grep "postgres://"  # Database URLs
   ```

2. **All .env files are ignored:**
   ```bash
   # Verify .env files won't be committed
   git check-ignore .env
   git check-ignore backend/.env
   git check-ignore scripts/.env
   ```

3. **Remove any committed secrets:**
   ```bash
   # If you accidentally committed secrets, remove them:
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch backend/.env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

## Updating Repository

After making changes:

```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push origin main
```

## Branching Strategy (Optional)

For collaborative development:

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push feature branch
git push origin feature/new-feature

# Create Pull Request on GitHub
# After PR is merged, update main branch
git checkout main
git pull origin main
```

## Troubleshooting

### Authentication Issues

**Error: "Authentication failed"**
- Use Personal Access Token instead of password
- Generate token: GitHub → Settings → Developer settings → Personal access tokens
- Use token as password when pushing

**Error: "Permission denied"**
- Check repository ownership
- Verify SSH keys if using SSH URL
- Use HTTPS URL instead

### Large Files

**Error: "File too large"**
- GitHub has 100MB file limit
- Use Git LFS for large files:
  ```bash
  git lfs install
  git lfs track "*.mp3"
  git add .gitattributes
  ```

### Accidental Commit of Secrets

If you committed secrets:
1. Remove from git history (see Security Reminders above)
2. Rotate all exposed API keys
3. Update .env files with new keys
4. Force push (if necessary): `git push --force origin main`

## Next Steps

- Set up GitHub Actions for CI/CD (optional)
- Add issue templates
- Set up branch protection rules
- Configure repository settings
- Add collaborators

---

**Your repository is now live on GitHub! 🎉**

Share it with: `https://github.com/YOUR_USERNAME/music-app`
