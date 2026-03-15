#!/bin/bash

# Cassandra AI - Deployment Script
# Automates deployment to GitHub Pages

set -e  # Exit on error

echo "🔮 Cassandra AI - GitHub Pages Deployment"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if git repo
if [ ! -d .git ]; then
    echo -e "${RED}❌ Error: Not a git repository${NC}"
    echo "Run: git init"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
    echo ""
    git status --short
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 1
    fi
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $CURRENT_BRANCH"

# Check if remote exists
if ! git remote get-url origin &>/dev/null; then
    echo -e "${RED}❌ Error: No 'origin' remote found${NC}"
    echo ""
    echo "Set up your remote first:"
    echo "  git remote add origin https://github.com/YOUR-USERNAME/cassandra-ai-mvp.git"
    exit 1
fi

REMOTE_URL=$(git remote get-url origin)
echo "🌐 Remote: $REMOTE_URL"
echo ""

# Verify critical files exist
echo "🔍 Verifying files..."
REQUIRED_FILES=("index.html" "api.js" "tree-viz.js" "README.md")
MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo -e "${RED}❌ Missing required files:${NC}"
    printf '   - %s\n' "${MISSING_FILES[@]}"
    exit 1
fi

echo -e "${GREEN}✓ All required files present${NC}"
echo ""

# Check for API keys in files (safety check)
echo "🔐 Checking for exposed API keys..."
if grep -r "sk-ant-" --exclude="*.sh" --exclude=".gitignore" --exclude="README.md" . 2>/dev/null; then
    echo -e "${RED}❌ DANGER: API key found in files!${NC}"
    echo "Remove API keys before deploying."
    exit 1
fi
echo -e "${GREEN}✓ No exposed API keys${NC}"
echo ""

# Commit current changes (if any)
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "📝 Committing changes..."
    read -p "Commit message (or press Enter for default): " COMMIT_MSG
    COMMIT_MSG=${COMMIT_MSG:-"Update Cassandra AI - $(date +%Y-%m-%d)"}
    
    git add .
    git commit -m "$COMMIT_MSG"
    echo -e "${GREEN}✓ Changes committed${NC}"
else
    echo "✓ No changes to commit"
fi
echo ""

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin "$CURRENT_BRANCH"
echo -e "${GREEN}✓ Pushed to $CURRENT_BRANCH${NC}"
echo ""

# GitHub Pages info
echo "=========================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Enable GitHub Pages (first time only):"
echo "   • Go to: $REMOTE_URL/settings/pages"
echo "   • Source: Deploy from branch"
echo "   • Branch: main (or master)"
echo "   • Folder: / (root)"
echo "   • Click 'Save'"
echo ""
echo "2. Wait 1-2 minutes for deployment"
echo ""
echo "3. Visit your site:"
echo "   https://YOUR-USERNAME.github.io/cassandra-ai-mvp/"
echo ""
echo "4. (Optional) Set up custom domain:"
echo "   • Settings → Pages → Custom domain"
echo "   • Enter: cassandra-ai.com"
echo "   • Configure DNS (see README.md)"
echo ""
echo "🎉 You're all set!"
echo "=========================================="
