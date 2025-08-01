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
BACKUP_DIR="/tmp/adultstherapy-backup-$(date +%Y%m%d-%H%M%S)"
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

# Step 1: Create backup of production
print_status "Creating backup of production repository..."
cp -r "$PROD_REPO_PATH" "$BACKUP_DIR"
print_status "Backup created at: $BACKUP_DIR"

# Step 2: Check for uncommitted changes in dev repo
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

# Step 3: Get latest changes from dev
print_status "Pulling latest changes from dev repository..."
cd "$DEV_REPO_PATH"
git pull origin main

# Step 4: Show what will be deployed
echo "📋 Changes to be deployed:"
git log --oneline -5

print_warning "Do you want to proceed with creating a Pull Request? (y/n)"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    print_error "Deployment cancelled"
    exit 1
fi

# Step 5: Create new branch in production repo
print_status "Creating new branch in production repository..."
cd "$PROD_REPO_PATH"
git checkout -b "$BRANCH_NAME"
print_status "Created branch: $BRANCH_NAME"

# Step 6: Backup production-specific files
print_status "Backing up production-specific files..."
cp CNAME /tmp/prod-CNAME-backup 2>/dev/null || print_warning "No CNAME file found in production"

# Step 7: Sync files from dev to production (excluding environment-specific files)
print_status "Syncing files from dev to production..."
rsync -av --exclude='.git' --exclude='.DS_Store' --exclude='CNAME' --delete "$DEV_REPO_PATH/" "$PROD_REPO_PATH/"

# Step 8: Restore production-specific files
print_status "Restoring production-specific files..."
if [ -f /tmp/prod-CNAME-backup ]; then
    cp /tmp/prod-CNAME-backup "$PROD_REPO_PATH/CNAME"
    rm /tmp/prod-CNAME-backup
    print_status "Production CNAME file restored"
else
    # If no backup exists, create the correct production CNAME
    echo "adultstherapy.com" > "$PROD_REPO_PATH/CNAME"
    print_status "Production CNAME file created with correct domain"
fi

# Step 9: Commit changes in production
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

# Step 10: Push branch to remote
print_status "Pushing branch to remote repository..."
git push origin "$BRANCH_NAME"
print_status "Branch pushed to remote"

# Step 11: Create Pull Request
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
- [ ] Production backup created
- [ ] CNAME file preserved for production domain

### Post-deployment Tasks:
- [ ] Test production site functionality
- [ ] Verify custom domain is working
- [ ] Monitor for any issues
- [ ] Remove backup when satisfied

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

# Step 12: Return to main branch
print_status "Switching back to main branch..."
git checkout main

echo ""
print_status "🎉 Pull Request deployment workflow completed!"
print_status "Backup available at: $BACKUP_DIR"
print_status "Production CNAME preserved: adultstherapy.com"
echo ""
echo "Next steps:"
echo "1. Review the Pull Request at: $PR_URL"
echo "2. Test the changes in the PR branch"
echo "3. Merge the PR when ready"
echo "4. Monitor production after merge"
echo "5. Remove backup when satisfied: rm -rf $BACKUP_DIR"
echo ""
print_info "To merge the PR via command line:"
echo "  gh pr merge $PR_URL --merge" 