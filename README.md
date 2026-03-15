# 🔮 Cassandra AI - Recursive Thought Navigator

> **"Ask any question. See how I think through it — step by step, branch by branch."**

Cassandra AI is an interactive visualization tool that maps AI reasoning in real-time. Watch as Claude Sonnet 4.5 breaks down complex questions into thought trees, exploring multiple reasoning paths simultaneously.

[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20GitHub%20Pages-brightgreen)](https://[YOUR-USERNAME].github.io/cassandra-ai-mvp/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🎯 What It Does

- **Ask anything** — philosophy, science, creative problems, technical questions
- **Watch AI think** — see reasoning unfold in real-time as an interactive tree
- **Explore branches** — click nodes to expand thinking paths
- **Track confidence** — visual indicators show certainty levels
- **Follow the flow** — animated connections show how thoughts build on each other

**Perfect for:**
- Understanding how AI solves complex problems
- Teaching critical thinking and recursive reasoning
- Exploring philosophical questions visually
- Debugging AI decision-making processes
- Building intuition about LLM reasoning patterns

---

## 🚀 Live Demo

👉 **[Try it now](https://[YOUR-USERNAME].github.io/cassandra-ai-mvp/)**

![Cassandra AI Demo](demo.gif)

---

## 🏗️ How It Works

### Architecture

```
┌─────────────────┐
│   User Input    │
│  (Question)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Layer     │◄─── Anthropic Claude API
│   (api.js)      │     (Sonnet 4.5 + Extended Thinking)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Tree Builder   │
│  (tree-viz.js)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   D3.js Viz     │
│ (Interactive)   │
└─────────────────┘
```

**Data Flow:**
1. User enters question → Frontend captures input
2. API layer sends to Claude Sonnet 4.5 with extended thinking enabled
3. Streaming response breaks reasoning into nodes
4. Tree builder parses nodes and relationships
5. D3.js renders interactive, expandable tree
6. User can click nodes to explore branches deeper

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | HTML5 + Vanilla JS | Clean, fast UI |
| **Visualization** | D3.js v7 | Interactive tree rendering |
| **AI Engine** | Claude Sonnet 4.5 | Recursive reasoning |
| **API** | Anthropic API | Extended thinking mode |
| **Hosting** | GitHub Pages | Static deployment |
| **Version Control** | Git + GitHub | Source management |

**Why these choices?**
- **No build step** — pure HTML/CSS/JS for rapid iteration
- **D3.js** — industry standard for data visualization
- **Claude Sonnet 4.5** — best-in-class reasoning capabilities
- **GitHub Pages** — free, fast, SSL included

---

## 💻 Local Development

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Anthropic API key ([get one here](https://console.anthropic.com/))
- Basic command line knowledge

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/[YOUR-USERNAME]/cassandra-ai-mvp.git
   cd cassandra-ai-mvp
   ```

2. **Set up API key**
   
   **Option A: Environment variable (recommended)**
   ```bash
   export ANTHROPIC_API_KEY="sk-ant-..."
   ```
   
   **Option B: Local config file**
   ```bash
   echo 'const ANTHROPIC_API_KEY = "sk-ant-...";' > config.local.js
   ```
   Then add to `index.html` before `api.js`:
   ```html
   <script src="config.local.js"></script>
   ```

3. **Run local server**
   ```bash
   # Python 3
   python3 -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js (if you have npx)
   npx http-server -p 8000
   
   # PHP
   php -S localhost:8000
   ```

4. **Open in browser**
   ```
   http://localhost:8000
   ```

### Development Tips

- **Hot reload**: Use browser dev tools and refresh after changes
- **Console debugging**: Check browser console for API errors
- **Network tab**: Monitor API calls and responses
- **Local storage**: API key is stored in browser localStorage (never committed)

---

## 🔐 API Key Setup

### Getting Your Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-`)

### Security Best Practices

⚠️ **NEVER commit API keys to Git**

**For local development:**
- Use environment variables
- Use `config.local.js` (already in `.gitignore`)
- Store in browser localStorage only

**For production:**
- Use GitHub Secrets (if using Actions)
- Proxy API calls through a backend (future enhancement)
- Consider rate limiting and usage monitoring

**What's protected:**
- `.gitignore` blocks all `.env` files
- `config.local.js` is ignored by default
- No API keys in source code

---

## 🚢 Deployment

### GitHub Pages (Current)

**Automatic deployment:**
```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# GitHub Actions auto-deploys to Pages
# Live in ~1-2 minutes
```

**Manual deployment:**
```bash
./deploy.sh
```

**Custom domain setup:**

1. Go to repo **Settings → Pages**
2. Under "Custom domain", enter: `cassandra-ai.com`
3. Wait for DNS check (✓ appears when ready)
4. Enable "Enforce HTTPS"

**DNS Configuration (at your registrar):**
```
Type    Name    Value
CNAME   www     [YOUR-USERNAME].github.io
A       @       185.199.108.153
A       @       185.199.109.153
A       @       185.199.110.153
A       @       185.199.111.153
```

SSL certificate is automatic via GitHub.

### Future Deployment Options

- **Vercel**: One-click deploy, edge functions
- **Netlify**: Serverless functions, form handling
- **Cloudflare Pages**: Global CDN, R2 storage
- **Custom VPS**: Full control, backend API

---

## 🗺️ Roadmap

### ✅ MVP (Current)
- [x] Basic question input
- [x] Claude Sonnet 4.5 integration
- [x] D3.js tree visualization
- [x] Real-time streaming
- [x] Interactive node expansion
- [x] GitHub Pages deployment

### 🔄 Beta (Next 4-6 weeks)
- [ ] **Enhanced UI**
  - Confidence heatmaps
  - Thought duration indicators
  - Branch comparison mode
  - Dark mode toggle
- [ ] **Advanced Features**
  - Save/load thought trees
  - Export as PNG/SVG
  - Share via URL
  - Search within tree
- [ ] **Performance**
  - Lazy loading for large trees
  - WebWorker for parsing
  - Caching layer

### 🚀 Launch (Q2 2026)
- [ ] **Backend API**
  - Rate limiting
  - Usage analytics
  - API key management
  - Multi-user support
- [ ] **Premium Features**
  - GPT-4, Gemini integration
  - Comparative reasoning (multi-model)
  - Historical tree archives
  - Team collaboration
- [ ] **Marketing**
  - Product Hunt launch
  - Demo videos
  - Blog post series
  - Twitter/X campaign

### 🌟 Future Vision
- Mobile app (React Native)
- VS Code extension
- Reasoning API for developers
- Educational curriculum integration

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Quick Start

1. **Fork the repo**
2. **Create a branch**: `git checkout -b feature/amazing-feature`
3. **Make changes**: Follow code style below
4. **Test locally**: Ensure everything works
5. **Commit**: `git commit -m "Add amazing feature"`
6. **Push**: `git push origin feature/amazing-feature`
7. **Open PR**: Describe your changes

### Code Style

**JavaScript:**
- Use modern ES6+ syntax
- Prefer `const`/`let` over `var`
- Comment complex logic
- Keep functions small and focused

**HTML/CSS:**
- Semantic HTML5 tags
- BEM naming for classes
- Mobile-first responsive design
- Accessible (ARIA labels, keyboard nav)

**Git Commits:**
- Present tense: "Add feature" not "Added feature"
- Descriptive: "Fix tree rendering bug" not "Fix bug"
- Reference issues: "Close #123: Add dark mode"

### What We're Looking For

**High Priority:**
- [ ] Performance optimizations
- [ ] Browser compatibility fixes
- [ ] Accessibility improvements
- [ ] Documentation updates

**Medium Priority:**
- [ ] New visualization modes
- [ ] UI/UX enhancements
- [ ] Test coverage
- [ ] Refactoring

**Ideas Welcome:**
- Novel interaction patterns
- Alternative AI model integrations
- Export/share features
- Educational use cases

### Code Review Process

1. Automated checks must pass (linting, etc.)
2. At least one maintainer approval required
3. All discussions resolved
4. Squash and merge to main

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

**TL;DR**: Free to use, modify, distribute. Just keep the license notice.

---

## 🙏 Acknowledgments

- **Anthropic** — Claude API and extended thinking
- **D3.js** — Visualization framework
- **GitHub** — Hosting and CI/CD
- **Community** — Beta testers and contributors

---

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/[YOUR-USERNAME]/cassandra-ai-mvp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/[YOUR-USERNAME]/cassandra-ai-mvp/discussions)
- **Twitter**: [@YourHandle](https://twitter.com/YourHandle)
- **Email**: your.email@example.com

---

**Built with 🦞 by Krispy**

*"The best way to understand intelligence is to watch it think."*
