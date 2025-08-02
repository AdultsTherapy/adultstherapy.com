#!/bin/bash

# Deploy from dev to production via Pull Request
# Usage: ./deploy-via-pr.sh

set -e  # Exit on any error

echo "🚀 Starting deployment via Pull Request..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEV_REPO_PATH="/Users/seandinwiddie/GitHub/preview.adultstherapy.com"
PROD_REPO_PATH="/Users/seandinwiddie/Documents/GitHub/adultstherapy.com"
BRANCH_NAME="deploy-from-dev-$(date +%Y%m%d-%H%M%S)"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "$DEV_REPO_PATH" ] || [ ! -d "$PROD_REPO_PATH" ]; then
    print_error "Repository paths not found. Please check the paths in the script."
    exit 1
fi

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is not installed. Please install it first:"
    echo "  brew install gh"
    echo "  gh auth login"
    exit 1
fi

# Step 1: Check for uncommitted changes in dev repo
echo "🔍 Checking for uncommitted changes..."

cd "$DEV_REPO_PATH"
if ! git diff-index --quiet HEAD --; then
    print_warning "Dev repository has uncommitted changes. Commit them first? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "Pre-deployment commit: $(date)"
        print_status "Changes committed in dev repository"
    else
        print_error "Please commit or stash changes in dev repository before deploying"
        exit 1
    fi
fi

# Step 2: Get latest changes from dev
print_status "Pulling latest changes from dev repository..."
cd "$DEV_REPO_PATH"
git pull origin main

# Step 3: Show what will be deployed
echo "📋 Changes to be deployed:"
git log --oneline -5

print_warning "Do you want to proceed with creating a Pull Request? (y/n)"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    print_error "Deployment cancelled"
    exit 1
fi

# Step 4: Create new branch in production repo
print_status "Creating new branch in production repository..."
cd "$PROD_REPO_PATH"
git checkout -b "$BRANCH_NAME"
print_status "Created branch: $BRANCH_NAME"

# Step 5: Sync files from dev to production (preserving production CNAME)
print_status "Syncing files from dev to production..."
rsync -av --exclude='.git' --exclude='.DS_Store' --exclude='CNAME' --delete "$DEV_REPO_PATH/" "$PROD_REPO_PATH/"

# Ensure production CNAME is correct
echo "adultstherapy.com" > "$PROD_REPO_PATH/CNAME"
print_status "Production CNAME set to: adultstherapy.com"

# Step 6: Commit changes in production
print_status "Committing changes in production repository..."
cd "$PROD_REPO_PATH"
git add .

# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
    print_status "No changes to commit - repositories are already in sync"
    git checkout main
    git branch -D "$BRANCH_NAME"
    print_error "No changes to deploy. Exiting."
    exit 1
else
    # Get the latest commit message from dev for reference
    cd "$DEV_REPO_PATH"
    LATEST_DEV_COMMIT=$(git log -1 --pretty=format:"%s")
    
    cd "$PROD_REPO_PATH"
    git commit -m "Deploy from dev: $LATEST_DEV_COMMIT"
    print_status "Changes committed in production repository"
fi

# Step 7: Push branch to remote
print_status "Pushing branch to remote repository..."
git push origin "$BRANCH_NAME"
print_status "Branch pushed to remote"

# Step 8: Create Pull Request
print_status "Creating Pull Request..."
PR_TITLE="Deploy from dev: $(date +%Y-%m-%d)"
PR_BODY="## Deployment Summary

This PR deploys changes from the development environment to production.

### Changes Included:
- Latest updates from dev repository
- Production CNAME preserved: \`adultstherapy.com\`
- All files synced from dev to production

### Pre-deployment Checklist:
- [ ] Dev changes tested and working
- [ ] CNAME file preserved for production domain

### Post-deployment Tasks:
- [ ] Test production site functionality
- [ ] Verify custom domain is working
- [ ] Monitor for any issues

### Latest Dev Commit:
\`\`\`
$LATEST_DEV_COMMIT
\`\`\`

### Files Changed:
\`\`\`
$(git diff --name-only main..HEAD)
\`\`\`
"

# Create PR using GitHub CLI
PR_URL=$(gh pr create \
    --title "$PR_TITLE" \
    --body "$PR_BODY" \
    --base main \
    --head "$BRANCH_NAME" \
    --repo AdultsTherapy/adultstherapy.com)

if [ $? -eq 0 ]; then
    print_status "Pull Request created successfully!"
    echo "🔗 PR URL: $PR_URL"
else
    print_error "Failed to create Pull Request"
    print_info "You can create it manually at: https://github.com/AdultsTherapy/adultstherapy.com/compare/main...$BRANCH_NAME"
fi

# Step 9: Return to main branch
print_status "Switching back to main branch..."
git checkout main

echo ""
print_status "🎉 Pull Request deployment workflow completed!"
print_status "Production CNAME preserved: adultstherapy.com"
echo ""
echo "Next steps:"
echo "1. Review the Pull Request at: $PR_URL"
echo "2. Test the changes in the PR branch"
echo "3. Merge the PR when ready"
echo "4. Monitor production after merge"
echo ""
print_info "To merge the PR via command line:"
echo "  gh pr merge $PR_URL --merge"
echo ""
print_warning "Would you like to automatically merge this PR now? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    # Step 10: Auto-merge the PR
    print_status "Merging Pull Request automatically..."
    if gh pr merge "$PR_URL" --merge; then
        print_status "Pull Request merged successfully!"
        
        # Step 11: Clean up branches after successful merge
        print_status "Cleaning up deployment branches..."
        
        # Delete local branch
        git branch -D "$BRANCH_NAME" 2>/dev/null || print_warning "Local branch already cleaned up"
        
        # Delete remote branch
        git push origin --delete "$BRANCH_NAME" 2>/dev/null || print_warning "Remote branch already cleaned up"
        
        print_status "Branch cleanup completed"
        
        # Step 12: Clean up any old deployment branches
        print_status "Checking for old deployment branches to clean up..."
        OLD_BRANCHES=$(git branch --list "deploy-from-dev-*" | grep -v "$BRANCH_NAME" | xargs)
        if [ -n "$OLD_BRANCHES" ]; then
            print_warning "Found old deployment branches: $OLD_BRANCHES"
            print_warning "Delete these old branches? (y/n)"
            read -r cleanup_response
            if [[ "$cleanup_response" =~ ^[Yy]$ ]]; then
                # Clean up old local branches
                echo "$OLD_BRANCHES" | xargs -r git branch -D 2>/dev/null || true
                
                # Clean up old remote branches
                for branch in $OLD_BRANCHES; do
                    git push origin --delete "$branch" 2>/dev/null || true
                done
                print_status "Old deployment branches cleaned up"
            fi
        fi
        
        echo ""
        print_status "🎉 Deployment completed successfully!"
        print_status "✅ PR merged: $PR_URL"
        print_status "🧹 Branches cleaned up automatically"
        print_status "🌐 Production is now live with latest changes"
    else
        print_error "Failed to merge PR automatically"
        echo "You can merge it manually at: $PR_URL"
    fi
else
    echo ""
    print_info "PR created but not merged. Manual steps:"
    echo "1. Review and merge: $PR_URL"
    echo "2. Clean up branch: git branch -D $BRANCH_NAME && git push origin --delete $BRANCH_NAME"
fi