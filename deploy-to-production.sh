#!/bin/bash

# Deploy from dev to production script
# Usage: ./deploy-to-production.sh

set -e  # Exit on any error

echo "🚀 Starting deployment from dev to production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEV_REPO_PATH="/Users/seandinwiddie/GitHub/preview.adultstherapy.com"
PROD_REPO_PATH="/Users/seandinwiddie/Documents/GitHub/adultstherapy.com"

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

# Check if we're in the right directory
if [ ! -d "$DEV_REPO_PATH" ] || [ ! -d "$PROD_REPO_PATH" ]; then
    print_error "Repository paths not found. Please check the paths in the script."
    exit 1
fi

# Step 1: Check for uncommitted changes in both repos
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

cd "$PROD_REPO_PATH"
if ! git diff-index --quiet HEAD --; then
    print_warning "Production repository has uncommitted changes. These will be lost. Continue? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled"
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

print_warning "Do you want to proceed with deployment? (y/n)"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    print_error "Deployment cancelled"
    exit 1
fi

# Step 4: Sync files from dev to production (preserving production CNAME)
print_status "Syncing files from dev to production..."
cd "$PROD_REPO_PATH"
rsync -av --exclude='.git' --exclude='.DS_Store' --exclude='CNAME' --delete "$DEV_REPO_PATH/" "$PROD_REPO_PATH/"

# Ensure production CNAME is correct
echo "adultstherapy.com" > "$PROD_REPO_PATH/CNAME"
print_status "Production CNAME set to: adultstherapy.com"

# Step 5: Commit changes in production
print_status "Committing changes in production repository..."
cd "$PROD_REPO_PATH"
git add .

# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
    print_status "No changes to commit - repositories are already in sync"
else
    # Get the latest commit message from dev for reference
    cd "$DEV_REPO_PATH"
    LATEST_DEV_COMMIT=$(git log -1 --pretty=format:"%s")
    
    cd "$PROD_REPO_PATH"
    git commit -m "Deploy from dev: $LATEST_DEV_COMMIT"
    print_status "Changes committed in production repository"
fi

# Step 6: Push to production
print_warning "Push changes to production remote? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    git push origin main
    print_status "Changes pushed to production remote"
else
    print_status "Changes committed locally but not pushed to remote"
fi

echo ""
print_status "🎉 Deployment completed successfully!"
print_status "Production CNAME preserved: adultstherapy.com"

# Step 7: Optional cleanup of old deployment branches
echo ""
print_warning "Clean up old deployment branches? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    print_status "Cleaning up old deployment branches..."
    
    # Clean up in production repo
    OLD_BRANCHES=$(git branch --list "deploy-from-dev-*" | sed 's/^[ *]*//' | xargs)
    if [ -n "$OLD_BRANCHES" ]; then
        # Clean up local branches
        for branch in $OLD_BRANCHES; do
            git branch -D "$branch" 2>/dev/null && print_status "Deleted local branch: $branch" || true
        done
        
        # Clean up remote branches  
        for branch in $OLD_BRANCHES; do
            git push origin --delete "$branch" 2>/dev/null && print_status "Deleted remote branch: $branch" || true
        done
        
        print_status "Production deployment branches cleaned up"
    else
        print_status "No old deployment branches found in production"
    fi
    
    # Clean up in dev repo if accessible
    if [ -d "$DEV_REPO_PATH" ]; then
        cd "$DEV_REPO_PATH"
        DEV_OLD_BRANCHES=$(git branch --list "deploy-from-dev-*" | sed 's/^[ *]*//' | xargs)
        if [ -n "$DEV_OLD_BRANCHES" ]; then
            for branch in $DEV_OLD_BRANCHES; do
                git branch -D "$branch" 2>/dev/null && print_status "Deleted dev branch: $branch" || true
            done
            print_status "Development deployment branches cleaned up"
        fi
        cd "$PROD_REPO_PATH"
    fi
    
    print_status "🧹 Branch cleanup completed"
fi

echo ""
echo "Next steps:"
echo "- Test the production site"
echo "- Verify custom domain is working"
echo "- Monitor for any issues"
echo ""
print_info "To clean up branches anytime, run: ./cleanup-deployment-branches.sh"