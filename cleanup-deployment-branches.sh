#!/bin/bash

# Clean up deployment branches utility
# Usage: ./cleanup-deployment-branches.sh

set -e  # Exit on any error

echo "🧹 Cleaning up deployment branches..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
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

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Function to clean up branches in a repository
cleanup_repo_branches() {
    local repo_path=$1
    local repo_name=$2
    
    if [ ! -d "$repo_path" ]; then
        print_error "$repo_name repository not found at: $repo_path"
        return 1
    fi
    
    echo "🔍 Checking $repo_name repository for deployment branches..."
    cd "$repo_path"
    
    # Find deployment branches
    DEPLOYMENT_BRANCHES=$(git branch --list "deploy-from-dev-*" | sed 's/^[ *]*//' | xargs)
    
    if [ -n "$DEPLOYMENT_BRANCHES" ]; then
        print_warning "Found deployment branches in $repo_name: $DEPLOYMENT_BRANCHES"
        print_warning "Delete these branches? (y/n)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            # Clean up local branches
            for branch in $DEPLOYMENT_BRANCHES; do
                git branch -D "$branch" 2>/dev/null && print_status "Deleted local branch: $branch" || true
            done
            
            # Clean up remote branches  
            for branch in $DEPLOYMENT_BRANCHES; do
                git push origin --delete "$branch" 2>/dev/null && print_status "Deleted remote branch: $branch" || true
            done
            
            print_status "$repo_name deployment branches cleaned up"
        else
            print_info "Skipping $repo_name branch cleanup"
        fi
    else
        print_status "$repo_name has no deployment branches to clean up"
    fi
}

# Clean up dev repository branches
echo "📁 Cleaning development repository..."
cleanup_repo_branches "$(pwd)" "Development"

# Clean up production repository branches  
if [ -d "$PROD_REPO_PATH" ]; then
    echo ""
    echo "📁 Cleaning production repository..."
    cleanup_repo_branches "$PROD_REPO_PATH" "Production"
else
    print_warning "Production repository not found, skipping production cleanup"
fi

echo ""
print_status "🎉 Branch cleanup completed!"
print_info "All deployment branches have been cleaned up"