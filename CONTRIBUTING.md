# Contributing to Cassandra AI

Thanks for considering contributing! This project thrives on community input.

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR-USERNAME/cassandra-ai-mvp.git`
3. **Create a branch**: `git checkout -b feature/your-feature-name`
4. **Make changes** and test locally
5. **Commit**: `git commit -m "Add your feature"`
6. **Push**: `git push origin feature/your-feature-name`
7. **Open a Pull Request** on GitHub

## 🎯 What We're Looking For

### High Priority
- Performance optimizations
- Browser compatibility fixes
- Accessibility improvements (ARIA, keyboard nav, screen readers)
- Documentation improvements
- Bug fixes

### Medium Priority
- New visualization modes
- UI/UX enhancements
- Test coverage
- Code refactoring

### Ideas Welcome
- Novel interaction patterns
- Alternative AI model integrations (GPT-4, Gemini, etc.)
- Export/share features (PNG, SVG, shareable URLs)
- Educational use cases

## 📝 Code Style

### JavaScript
- **ES6+**: Use modern syntax (`const`, `let`, arrow functions, async/await)
- **No var**: Prefer `const` by default, `let` when reassignment needed
- **Comments**: Explain *why*, not *what* (code should be self-documenting)
- **Functions**: Keep small and focused (single responsibility)
- **Naming**: camelCase for variables/functions, PascalCase for classes

**Example**:
```javascript
// Good
const fetchReasoningTree = async (question) => {
  const response = await callAnthropicAPI(question);
  return parseTreeNodes(response);
};

// Avoid
var x = function(q) {
  // lots of logic here
  // ... 50 lines later
};
```

### HTML/CSS
- **Semantic HTML**: Use appropriate tags (`<nav>`, `<section>`, `<article>`)
- **BEM naming**: `.block__element--modifier` for CSS classes
- **Mobile-first**: Responsive design with mobile as baseline
- **Accessibility**: ARIA labels, keyboard navigation, focus states

### Git Commits
- **Present tense**: "Add feature" not "Added feature"
- **Descriptive**: Explain what and why
- **Reference issues**: "Close #123: Add dark mode toggle"
- **Small commits**: One logical change per commit

**Good commit messages**:
```
Add confidence heatmap visualization

- Color nodes based on Claude's confidence scores
- Update tree-viz.js with gradient color scale
- Add legend explaining color mapping

Closes #45
```

## 🧪 Testing

Before submitting a PR:

1. **Test locally**:
   ```bash
   python3 -m http.server 8000
   # Open http://localhost:8000
   ```

2. **Browser testing**:
   - Chrome (latest)
   - Firefox (latest)
   - Safari (latest)
   - Edge (latest)

3. **Mobile testing**:
   - iOS Safari
   - Chrome Android
   - Various screen sizes

4. **Console check**:
   - Open DevTools (F12)
   - No errors in Console
   - Network calls successful

5. **Functionality**:
   - Enter question → tree renders
   - Click nodes → expand/collapse
   - Zoom/pan working
   - API key storage works

## 📋 Pull Request Process

1. **Update documentation** if you changed APIs or added features
2. **Add yourself to contributors** in README.md (optional)
3. **Describe your changes** clearly in the PR description
4. **Link related issues**: "Fixes #123" or "Related to #456"
5. **Wait for review** — maintainer will review within 48 hours
6. **Address feedback** if requested
7. **Squash commits** if asked (we'll guide you)

### PR Template

```markdown
## Description
Brief summary of what changed and why.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Testing
How did you test this?

## Screenshots
(if UI changes)

## Checklist
- [ ] Tested locally
- [ ] No console errors
- [ ] Works on mobile
- [ ] Documentation updated
- [ ] No API keys in code
```

## 🐛 Bug Reports

Found a bug? Open an issue with:

1. **Description**: What happened vs what you expected
2. **Steps to reproduce**: Detailed steps to recreate the bug
3. **Environment**: Browser, OS, device
4. **Screenshots/logs**: Console errors, network logs
5. **Expected behavior**: What should happen instead

**Use this template**:
```markdown
**Bug Description**
Tree doesn't render after submitting question.

**Steps to Reproduce**
1. Open site
2. Enter API key
3. Type question: "What is consciousness?"
4. Click submit
5. Tree doesn't appear

**Environment**
- Browser: Chrome 120
- OS: macOS 14.2
- Device: MacBook Pro

**Console Errors**
```
TypeError: Cannot read property 'nodes' of undefined
  at buildTree (tree-viz.js:45)
```

**Expected**
Tree should render with reasoning nodes.
```

## 💡 Feature Requests

Want a new feature? Open a discussion or issue:

1. **Use case**: Why do you need this?
2. **Proposed solution**: How should it work?
3. **Alternatives considered**: Other ways to solve it
4. **Additional context**: Mockups, examples, references

## 🔒 Security

Found a security vulnerability? **Don't open a public issue.**

Email directly: your.email@example.com

We'll respond within 24 hours.

## 📜 Code of Conduct

### Our Standards

**Do**:
- Be respectful and constructive
- Welcome newcomers
- Focus on the best outcome for the project
- Give and receive feedback gracefully

**Don't**:
- Use aggressive or demeaning language
- Harass or troll others
- Share others' private information
- Act unprofessionally

### Enforcement

Violations may result in:
1. Warning
2. Temporary ban
3. Permanent ban

Contact: your.email@example.com

## 🎓 Learning Resources

New to contributing? Start here:

- [How to Fork a Repo](https://docs.github.com/en/get-started/quickstart/fork-a-repo)
- [Creating a Pull Request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)
- [D3.js Documentation](https://d3js.org/)
- [Anthropic API Docs](https://docs.anthropic.com/)

## 🏆 Recognition

Contributors will be:
- Added to README.md contributors section
- Mentioned in release notes
- Credited in commit history

Significant contributors may be invited as maintainers.

## 📞 Questions?

- **General questions**: [GitHub Discussions](https://github.com/YOUR-USERNAME/cassandra-ai-mvp/discussions)
- **Bug reports**: [GitHub Issues](https://github.com/YOUR-USERNAME/cassandra-ai-mvp/issues)
- **Security**: your.email@example.com

---

**Thank you for contributing! 🦞**
