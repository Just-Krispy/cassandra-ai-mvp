# 🚀 Cassandra AI - Quick Start

**Get your site live in 15 minutes**

---

## 📋 Before You Start

You need:
- [ ] GitHub account
- [ ] Git installed (`git --version` to check)
- [ ] Anthropic API key ([get here](https://console.anthropic.com/))

---

## 🎯 Deploy in 5 Steps

### 1. Test Locally (3 min)

```bash
cd ~/.openclaw/workspace/cassandra-ai-mvp
python3 -m http.server 8000
```

Open http://localhost:8000
- Enter your Anthropic API key when prompted
- Ask a question: "What is consciousness?"
- Verify tree renders

Press Ctrl+C to stop server.

---

### 2. Create GitHub Repo (2 min)

**Via website** (easiest):
1. Go to https://github.com/new
2. Name: `cassandra-ai-mvp`
3. Public (required for free GitHub Pages)
4. **Don't** check "Initialize with README"
5. Click "Create repository"

Copy the URL: `https://github.com/YOUR-USERNAME/cassandra-ai-mvp.git`

---

### 3. Push to GitHub (3 min)

```bash
cd ~/.openclaw/workspace/cassandra-ai-mvp

# Initialize
git init
git add .
git commit -m "Initial commit: Cassandra AI MVP"

# Connect to GitHub (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/cassandra-ai-mvp.git

# Push
git branch -M main
git push -u origin main
```

Verify: Go to your GitHub repo, files should be there.

---

### 4. Enable GitHub Pages (2 min)

1. Go to your repo on GitHub
2. Click **Settings** (top right)
3. Click **Pages** (left sidebar)
4. Under "Build and deployment":
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
5. Click **Save**
6. Wait 2 minutes

Refresh the page. You'll see:
```
✓ Your site is live at https://YOUR-USERNAME.github.io/cassandra-ai-mvp/
```

---

### 5. Test Live Site (2 min)

1. Click the URL or visit it in browser
2. Enter your Anthropic API key
3. Ask: "What is 2+2?"
4. Tree should render ✅

**Congratulations! You're live! 🎉**

---

## 🔄 Future Updates

When you make changes:

```bash
cd ~/.openclaw/workspace/cassandra-ai-mvp
./deploy.sh
```

That's it! The script handles:
- Security checks (no API keys)
- Git commit
- Push to GitHub
- Instructions for you

Site updates in 1-2 minutes automatically.

---

## 🌍 Custom Domain (Optional)

Want `cassandra-ai.com` instead of `username.github.io/cassandra-ai-mvp/`?

**Quick version:**

1. Buy domain (Namecheap, Cloudflare, etc.)
2. Add DNS records:
   ```
   Type    Name    Value
   CNAME   www     YOUR-USERNAME.github.io
   A       @       185.199.108.153
   A       @       185.199.109.153
   A       @       185.199.110.153
   A       @       185.199.111.153
   ```
3. In GitHub: Settings → Pages → Custom domain: `cassandra-ai.com`
4. Enable "Enforce HTTPS"
5. Wait 10-60 min for DNS + 24h for SSL

**Full guide:** See `deployment-guide.md` Step 7

---

## 🆘 Troubleshooting

### "404 Not Found"
- Wait 2-5 minutes after enabling Pages
- Check repo is Public
- Verify branch is "main" in Pages settings

### "API calls failing"
- Check browser console (F12)
- Verify API key is correct
- Test key at https://console.anthropic.com/

### "Tree not showing"
- Check console for JavaScript errors
- Make sure D3.js loaded (Network tab)
- Try simpler question first

### "Changes not showing"
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Wait 2-5 minutes for deployment
- Check Actions tab (is deploy running?)

**Full troubleshooting:** See `deployment-guide.md` Troubleshooting section

---

## 📚 Full Documentation

- **Complete walkthrough**: `deployment-guide.md`
- **Project docs**: `README.md`
- **Contributing**: `CONTRIBUTING.md`
- **Deployment details**: `DEPLOYMENT-SUMMARY.md`

---

## 🔐 Security Reminder

**NEVER commit your API key!**

✅ API key stored in browser localStorage (safe)  
✅ .gitignore blocks `.env` files  
✅ deploy.sh scans for keys before pushing  
✅ GitHub Actions has security check  

**If you accidentally committed a key:**
1. Revoke it immediately at console.anthropic.com
2. See emergency procedure in `deployment-guide.md` Step 5
3. Generate new key
4. Store locally only (never in code)

---

## ✅ Checklist

After completing Quick Start:

- [ ] Site live at GitHub Pages URL
- [ ] Question → API → tree works
- [ ] Tested on mobile device
- [ ] No console errors
- [ ] API key secure (not in GitHub)

**You're ready to share! 🚀**

---

**Need help?** Read `deployment-guide.md` for the full walkthrough.

**Built with 🦞 by Krispy**
