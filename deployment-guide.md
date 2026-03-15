# 🚀 Cassandra AI - Deployment Guide

**Complete step-by-step instructions for deploying to GitHub Pages**

---

## 📋 Prerequisites Checklist

Before you start, make sure you have:

- [ ] GitHub account ([sign up here](https://github.com/join))
- [ ] Git installed locally ([download here](https://git-scm.com/downloads))
- [ ] Code files ready (from other agents)
- [ ] Anthropic API key ([get one here](https://console.anthropic.com/))
- [ ] Command line access (Terminal on Mac/Linux, Git Bash on Windows)

---

## 🎬 Step 1: Create GitHub Repository

### Option A: Via GitHub Website (Easiest)

1. Go to https://github.com/new
2. Fill in:
   - **Repository name**: `cassandra-ai-mvp`
   - **Description**: "Interactive AI reasoning visualizer - watch Claude think in real-time"
   - **Visibility**: Public (required for free GitHub Pages)
   - **Initialize**: ❌ Don't check "Add README" (we already have one)
3. Click **Create repository**
4. Copy the repository URL (looks like: `https://github.com/YOUR-USERNAME/cassandra-ai-mvp.git`)

### Option B: Via Command Line

```bash
# Install GitHub CLI if you haven't
# Mac: brew install gh
# Windows: winget install GitHub.cli

# Login
gh auth login

# Create repo
gh repo create cassandra-ai-mvp --public --description "Interactive AI reasoning visualizer"
```

---

## 🔧 Step 2: Initialize Local Repository

Navigate to your project folder:

```bash
cd ~/.openclaw/workspace/cassandra-ai-mvp
```

Initialize Git and link to GitHub:

```bash
# Initialize git repo
git init

# Add all files
git add .

# Check what will be committed (should NOT include any API keys!)
git status

# Verify .gitignore is working
git status --ignored

# Make first commit
git commit -m "Initial commit: Cassandra AI MVP"

# Link to GitHub (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/cassandra-ai-mvp.git

# Check remote is set correctly
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

**Verify**: Go to `https://github.com/YOUR-USERNAME/cassandra-ai-mvp` and confirm files are there.

---

## 🌐 Step 3: Enable GitHub Pages

### Manual Setup (First Time)

1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. Scroll down to **Pages** (left sidebar)
4. Under "Build and deployment":
   - **Source**: Deploy from a branch
   - **Branch**: main (or master)
   - **Folder**: / (root)
5. Click **Save**
6. Wait 1-2 minutes
7. Refresh the page — you'll see a success message with your URL:
   ```
   Your site is live at https://YOUR-USERNAME.github.io/cassandra-ai-mvp/
   ```

### Using GitHub Actions (Automated)

The included `.github/workflows/deploy.yml` will auto-deploy on every push to main.

**To enable:**

1. Go to repo **Settings → Pages**
2. Under "Build and deployment":
   - **Source**: GitHub Actions
3. Push any change to main — Actions will auto-deploy

**Monitor deployments:**
- Go to **Actions** tab in your repo
- Click on the latest workflow run
- Green checkmark = success ✅
- Red X = failed ❌ (check logs)

---

## 🎨 Step 4: Test Your Deployment

1. **Open your site**: `https://YOUR-USERNAME.github.io/cassandra-ai-mvp/`

2. **Verify functionality**:
   - [ ] Page loads without errors
   - [ ] Input field accepts text
   - [ ] API key prompt appears (if not set)
   - [ ] Entering API key works
   - [ ] Submitting a question triggers API call
   - [ ] Tree visualization renders
   - [ ] Nodes are clickable/interactive

3. **Test on multiple devices**:
   - Desktop browser (Chrome, Firefox, Safari)
   - Mobile browser (phone, tablet)
   - Different screen sizes

4. **Check browser console** (F12 → Console):
   - No errors (red text)
   - API calls successful (Network tab)

---

## 🔐 Step 5: Secure Your API Key

**CRITICAL**: Never commit API keys to GitHub!

### For Users of Your App

When someone visits your site, they need to:

1. Get their own Anthropic API key from https://console.anthropic.com/
2. Enter it in the prompt when first visiting
3. Key is stored in browser localStorage (never leaves their machine)

### Verification Checklist

Run these checks BEFORE every deployment:

```bash
# 1. Check .gitignore is working
git status --ignored

# 2. Search for API keys in tracked files
git grep "sk-ant-" || echo "✅ No API keys found"

# 3. Check what's staged for commit
git diff --cached

# 4. Verify no secrets in commit history
git log --all --full-history --source -- '*.env*'
```

### If You Accidentally Committed a Key

**DO THIS IMMEDIATELY**:

1. **Revoke the key** at https://console.anthropic.com/
2. **Remove from Git history**:
   ```bash
   # Install BFG Repo Cleaner
   brew install bfg  # Mac
   # or download from https://rtyley.github.io/bfg-repo-cleaner/
   
   # Remove key from history
   bfg --replace-text <(echo 'sk-ant-YOUR-KEY==>REDACTED')
   
   # Force push (overwrites history)
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force
   ```
3. **Generate new API key**
4. **Update locally** (using localStorage or config.local.js)

---

## 🚀 Step 6: Deploy Updates (Future Changes)

### Quick Deploy

Use the automated script:

```bash
cd ~/.openclaw/workspace/cassandra-ai-mvp
./deploy.sh
```

The script will:
- Check for API keys (safety)
- Verify required files exist
- Commit changes
- Push to GitHub
- Provide next steps

### Manual Deploy

```bash
# 1. Make your changes to files
# 2. Test locally first!
python3 -m http.server 8000
# Open http://localhost:8000

# 3. Stage changes
git add .

# 4. Check what changed
git status
git diff --staged

# 5. Commit
git commit -m "Describe your changes here"

# 6. Push
git push origin main

# 7. Wait 1-2 minutes for auto-deploy
# 8. Verify at your GitHub Pages URL
```

---

## 🌍 Step 7: Custom Domain Setup (Optional)

Want `cassandra-ai.com` instead of `your-username.github.io/cassandra-ai-mvp/`?

### Buy a Domain

Options:
- **Namecheap**: ~$10/year, easy to use
- **Cloudflare Registrar**: At-cost pricing, best privacy
- **Google Domains**: Now Squarespace
- **Porkbun**: Cheap, good support

### Configure DNS

At your domain registrar, add these DNS records:

```
Type    Name    Value                           TTL
CNAME   www     YOUR-USERNAME.github.io         3600
A       @       185.199.108.153                 3600
A       @       185.199.109.153                 3600
A       @       185.199.110.153                 3600
A       @       185.199.111.153                 3600
```

**Wait 5-60 minutes for DNS propagation.**

### Enable on GitHub

1. Go to repo **Settings → Pages**
2. Under "Custom domain", enter: `cassandra-ai.com`
3. Click **Save**
4. Wait for DNS check (green checkmark appears)
5. Enable **Enforce HTTPS** (GitHub auto-generates SSL cert)

**Verify**: Visit `https://cassandra-ai.com` (wait up to 24h for cert)

---

## 🔧 Troubleshooting

### "404 - There isn't a GitHub Pages site here"

**Solutions**:
- Check GitHub Pages is enabled (Settings → Pages)
- Verify branch is set to `main` (or `master`)
- Wait 2-5 minutes after first enabling Pages
- Check repository is Public (required for free Pages)

### "API calls failing"

**Check**:
- Browser console for errors (F12)
- API key is set in localStorage (Application tab → Local Storage)
- API key is valid (test at https://console.anthropic.com/)
- No CORS errors (should be none with Anthropic API)

### "Tree not rendering"

**Debug**:
- Check browser console for JavaScript errors
- Verify D3.js loaded (Network tab)
- Check API response format in Network tab
- Test with simple question first: "What is 2+2?"

### "GitHub Actions failing"

**Steps**:
1. Go to Actions tab in repo
2. Click the failed workflow
3. Click the failed job
4. Read the error logs
5. Common issues:
   - API key in files (security check fails) → remove it
   - Missing required files → verify all files committed
   - Syntax errors → test locally first

### "Changes not showing up"

**Try**:
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
- Wait 2-5 minutes for Pages to rebuild
- Check Actions tab — is deployment still running?
- Try incognito/private browsing window

### "Custom domain not working"

**Verify**:
- DNS records correct (use https://dnschecker.org/)
- DNS has propagated (can take 24-48h)
- Custom domain field in GitHub shows green checkmark
- Try both www and non-www versions
- HTTPS cert may take 24h to generate

---

## 📊 Monitoring & Analytics

### Built-in GitHub Insights

- **Traffic**: Settings → Insights → Traffic
  - Page views
  - Unique visitors
  - Referring sites
- **Actions**: See deployment history and success rate

### Add Analytics (Optional)

**Google Analytics**:
```html
<!-- Add to index.html before </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Plausible** (privacy-friendly):
```html
<script defer data-domain="cassandra-ai.com" src="https://plausible.io/js/script.js"></script>
```

---

## 🎯 Best Practices

### Before Every Deploy

- [ ] Test locally first
- [ ] Check for API keys (`git grep "sk-ant-"`)
- [ ] Review git diff (`git diff`)
- [ ] Write meaningful commit messages
- [ ] Verify .gitignore is working

### Regular Maintenance

- [ ] **Weekly**: Check GitHub Issues/Discussions
- [ ] **Monthly**: Review analytics, update README if needed
- [ ] **Quarterly**: Dependency updates (D3.js, etc.)
- [ ] **Annually**: Renew domain (if using custom domain)

### Security

- [ ] Never commit API keys
- [ ] Keep dependencies updated
- [ ] Monitor for security advisories (GitHub will alert you)
- [ ] Use HTTPS always (automatic with GitHub Pages)
- [ ] Review permissions for GitHub Actions

---

## 🆘 Getting Help

### Self-Service

1. **Check this guide** — most answers are here
2. **Search GitHub Issues** — someone may have had same problem
3. **Browser DevTools** — check Console and Network tabs
4. **GitHub Docs** — https://docs.github.com/pages

### Ask for Help

- **GitHub Issues**: https://github.com/YOUR-USERNAME/cassandra-ai-mvp/issues
- **Discussions**: https://github.com/YOUR-USERNAME/cassandra-ai-mvp/discussions
- **Discord**: _(link your community if you have one)_
- **Email**: your.email@example.com

### When Asking

Include:
- What you tried
- What happened vs what you expected
- Error messages (full text)
- Browser console logs
- Link to your repo (if public)

---

## ✅ Deployment Checklist

Use this checklist for every deployment:

### Pre-Deploy
- [ ] All files from other agents added to repo
- [ ] Tested locally (http://localhost:8000)
- [ ] No API keys in code (`git grep "sk-ant-"`)
- [ ] .gitignore working (`git status --ignored`)
- [ ] Meaningful commit message prepared

### Deploy
- [ ] Run `./deploy.sh` or manual deploy steps
- [ ] Push successful (no errors)
- [ ] GitHub Actions passing (if enabled)
- [ ] Wait 2-5 minutes for Pages rebuild

### Post-Deploy
- [ ] Site loads at GitHub Pages URL
- [ ] No console errors (F12)
- [ ] Test core functionality (input → API → viz)
- [ ] Test on mobile device
- [ ] Share link with someone to QA

---

## 🎉 Success Criteria

You've successfully deployed when:

✅ Site is live at `https://YOUR-USERNAME.github.io/cassandra-ai-mvp/`  
✅ Users can enter questions and see AI reasoning trees  
✅ No console errors or broken functionality  
✅ API key storage works (localStorage)  
✅ Mobile-responsive design works  
✅ GitHub Actions auto-deploying (if enabled)  

**Congratulations! You're live! 🚀**

---

## 📞 Next Steps

1. **Share it!**
   - Post to Twitter/X
   - Share in Discord communities
   - Submit to Product Hunt (when ready)

2. **Gather feedback**
   - Enable GitHub Discussions
   - Create feedback form
   - Monitor analytics

3. **Iterate**
   - Follow roadmap in README.md
   - Prioritize based on user feedback
   - Keep deploying improvements

---

**Built with 🦞 by Krispy**

*Questions? Found a bug? Open an issue!*
