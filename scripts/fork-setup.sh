#!/usr/bin/env bash

# Coder Fork Setup Script
# This script helps you set up your tsingroc/coder fork for GitHub Actions

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        log_error "gh CLI not found. Please install it from https://cli.github.com/"
        log_info "Or on macOS: brew install gh"
        log_info "On Linux: https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
        return 1
    fi
    return 0
}

check_git() {
    if ! command -v git &> /dev/null; then
        log_error "git not found. Please install git."
        return 1
    fi
    return 0
}

verify_fork() {
    log_info "Verifying fork repository..."

    # Check if we're in the fork repo
    if ! git remote get-url origin | grep -q "tsingroc/coder"; then
        log_error "Not in tsingroc/coder repository. Please cd to the correct directory."
        return 1
    fi

    log_info "✓ Verified tsingroc/coder repository"
    return 0
}

setup_workflows() {
    log_info "Setting up GitHub Actions workflows for fork..."

    # Check if workflow files exist
    if [[ ! -f ".github/workflows/docker-build-fork.yaml" ]]; then
        log_error "docker-build-fork.yaml not found. Please ensure you have the latest code."
        return 1
    fi

    if [[ ! -f ".github/workflows/release-fork.yaml" ]]; then
        log_error "release-fork.yaml not found. Please ensure you have the latest code."
        return 1
    fi

    log_info "✓ Workflow files exist"
    return 0
}

disable_original_workflows() {
    log_warn "The following workflows should be disabled in GitHub:"
    echo ""
    echo "  📋 Workflows to disable:"
    echo "     - docker-base"
    echo "     - release (original)"
    echo "     - deploy-docs (if not needed)"
    echo "     - dogfood (if not needed)"
    echo ""
    echo "  📝 To disable:"
    echo "     1. Go to: https://github.com/tsingroc/coder/actions"
    echo "     2. Click on 'Workflow permissions' in the left sidebar"
    echo "     3. Find the workflow you want to disable"
    echo "     4. Click 'Disable workflow'"
    echo ""

    read -p "Have you disabled these workflows? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warn "Please disable them manually later."
    fi
}

configure_repository_permissions() {
    log_info "Checking repository permissions..."

    # Try to get repository info
    if gh repo view &> /dev/null; then
        # Check if Actions are enabled
        if gh api repos/tsingroc/coder | grep -q '"private": false'; then
            log_info "✓ Repository is public"
        else
            log_warn "Repository is private. Some features may be limited."
        fi
    fi

    log_info ""
    log_info "📝 Manual Step: Configure Repository Permissions"
    echo ""
    echo "  1. Go to: https://github.com/tsingroc/coder/settings/actions"
    echo "  2. Set 'Workflow permissions' to: 'Read and write permissions'"
    echo "  3. Enable: 'Allow GitHub Actions to create and approve pull requests'"
    echo "  4. Click 'Save'"
    echo ""

    read -p "Have you configured the permissions? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warn "Please configure them manually."
    fi
}

test_local_build() {
    log_info "Testing local build (optional)..."
    echo ""
    read -p "Do you want to test building Coder locally? This may take a while. (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Building Coder slim binary..."
        if make build-slim; then
            log_info "✓ Build successful!"
            ls -lh build/coder-slim_*
        else
            log_error "Build failed. Please check the error messages above."
            return 1
        fi
    fi
    return 0
}

create_test_branch() {
    log_info "Creating test branch..."

    # Stash any uncommitted changes
    git stash push -m "Auto-stash before setup" || true

    # Create or checkout test branch
    if git rev-parse --verify test-setup &>/dev/null; then
        git checkout test-setup
        git pull origin test-setup || git branch -D test-setup
    fi

    git checkout -b test-setup || git checkout test-setup

    log_info "✓ Created/tested test-setup branch"
}

push_test_workflow() {
    log_info "Preparing to push workflow changes..."

    # Check if there are changes to commit
    if [[ -n "$(git status --porcelain)" ]]; then
        git add .github/workflows/*.yaml
        git add FORK_SETUP_GUIDE.md
        git commit -m "Add GitHub Actions workflows for fork repository

- Add docker-build-fork.yaml for automated Docker builds
- Add release-fork.yaml for simplified releases
- Add FORK_SETUP_GUIDE.md with setup instructions
- Remove repository owner restrictions

Refs: #fork-setup"
        log_info "✓ Committed workflow changes"
    else
        log_info "No changes to commit"
    fi

    log_info ""
    log_info "📝 Manual Step: Push and Test"
    echo ""
    echo "  Run the following command to push the changes:"
    echo "    git push origin test-setup"
    echo ""
    echo "  Then create a Pull Request or merge to main to trigger the workflow."
    echo ""

    read -p "Do you want to push now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if git push origin test-setup; then
            log_info "✓ Pushed to test-setup branch"
            log_info ""
            log_info "Next steps:"
            echo "  1. Create a Pull Request: https://github.com/tsingroc/coder/compare/main...test-setup"
            echo "  2. Or merge directly: git checkout main && git merge test-setup && git push origin main"
            echo "  3. Check Actions: https://github.com/tsingroc/coder/actions"
        else
            log_error "Push failed. Please check your Git credentials and try manually."
        fi
    fi
}

print_summary() {
    log_info ""
    log_info "=== Setup Summary ==="
    echo ""
    echo "✓ Fork repository verified"
    echo "✓ Workflow files prepared"
    echo "✓ Documentation created"
    echo ""
    log_info "📚 Next Steps:"
    echo ""
    echo "1. Push changes to trigger the Docker build workflow:"
    echo "   git push origin test-setup"
    echo ""
    echo "2. Monitor the workflow at:"
    echo "   https://github.com/tsingroc/coder/actions"
    echo ""
    echo "3. Test the Docker image:"
    echo "   docker pull ghcr.io/tsingroc/coder:latest"
    echo "   docker run --rm ghcr.io/tsingroc/coder:latest --help"
    echo ""
    echo "4. For releases, use the 'Release (Fork)' workflow:"
    echo "   https://github.com/tsingroc/coder/actions/workflows/release-fork.yaml"
    echo ""
    echo "📖 Full documentation: FORK_SETUP_GUIDE.md"
    echo ""
    log_info "Happy coding! 🚀"
}

# Main execution
main() {
    echo "Coder Fork Repository Setup Script"
    echo "=================================="
    echo ""

    # Check prerequisites
    if ! check_git; then
        exit 1
    fi

    if ! check_gh_cli; then
        log_warn "gh CLI is recommended but not required. Continuing without it..."
    fi

    # Verify fork
    if ! verify_fork; then
        exit 1
    fi

    # Setup workflows
    if ! setup_workflows; then
        exit 1
    fi

    # Configure repository
    configure_repository_permissions

    # Disable original workflows
    disable_original_workflows

    # Test local build (optional)
    if ! test_local_build; then
        log_warn "Local build test failed, but continuing..."
    fi

    # Create test branch
    create_test_branch

    # Push test workflow
    push_test_workflow

    # Print summary
    print_summary
}

# Run main
main "$@"
