#!/usr/bin/env bash
# Digital Controller Tuning (ILM 310305dB) - GitHub Pages Deployment Script
set -e

echo "=== Building Digital Controller Tuning Simulator ==="
npm run build

# Check if git repository is initialized
if [ ! -d ".git" ]; then
  echo "Error: Not a git repository."
  exit 1
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $BRANCH"

# Deploy dist folder to gh-pages branch
echo "=== Deploying dist to gh-pages branch ==="

# Check if gh-pages branch exists locally or remotely
if git show-ref --verify --quiet refs/heads/gh-pages; then
  echo "Local gh-pages branch exists."
fi

# Create a temporary orphan branch or worktree
TMP_DIR=$(mktemp -d)
cp -r dist/* "$TMP_DIR/"

CURRENT_COMMIT=$(git rev-parse --short HEAD)

# If gh-pages worktree exists, remove it
git worktree prune

WORKTREE_DIR=".gh-pages-deploy"
rm -rf "$WORKTREE_DIR"

if git show-ref --verify --quiet refs/heads/gh-pages; then
  git worktree add -B gh-pages "$WORKTREE_DIR" gh-pages
else
  git worktree add --orphan -B gh-pages "$WORKTREE_DIR"
fi

rm -rf "$WORKTREE_DIR"/*
cp -r "$TMP_DIR"/* "$WORKTREE_DIR/"

cd "$WORKTREE_DIR"
git add --all
if git diff --staged --quiet; then
  echo "No changes to deploy."
else
  git commit -m "Deploy ILM 310305dB simulator to GitHub Pages [commit: $CURRENT_COMMIT]"
  echo "Committed deployment bundle to gh-pages branch."
fi

cd ..
git worktree remove --force "$WORKTREE_DIR"
rm -rf "$TMP_DIR"

echo "=== Deployment build complete! ==="
echo "To push to GitHub Pages: git push origin gh-pages"
