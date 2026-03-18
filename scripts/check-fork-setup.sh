#!/usr/bin/env bash

# Quick check script for fork repository setup
# Run this to verify your fork is ready for GitHub Actions

set -euo pipefail

echo "=== Coder Fork Repository Check ==="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if we're in the right repository
echo "1. Checking repository..."
if git remote get-url origin 2>/dev/null | grep -q "tsingroc/coder"; then
    check_pass "In tsingroc/coder repository"
else
    check_fail "Not in tsingroc/coder repository"
    echo "   Current: $(git remote get-url origin 2>/dev/null || echo 'No origin remote')"
fi

# Check workflow files
echo ""
echo "2. Checking workflow files..."
if [[ -f ".github/workflows/docker-build-fork.yaml" ]]; then
    check_pass "docker-build-fork.yaml exists"
else
    check_fail "docker-build-fork.yaml missing"
fi

if [[ -f ".github/workflows/release-fork.yaml" ]]; then
    check_pass "release-fork.yaml exists"
else
    check_fail "release-fork.yaml missing"
fi

# Check documentation
echo ""
echo "3. Checking documentation..."
if [[ -f "FORK_SETUP_GUIDE.md" ]]; then
    check_pass "FORK_SETUP_GUIDE.md exists"
else
    check_warn "FORK_SETUP_GUIDE.md missing"
fi

# Check Go environment
echo ""
echo "4. Checking build environment..."
if command -v go &> /dev/null; then
    check_pass "Go installed ($(go version | awk '{print $3}'))"
else
    check_fail "Go not installed"
fi

if command -v docker &> /dev/null; then
    check_pass "Docker installed"
else
    check_fail "Docker not installed"
fi

# Check for required Go tools
echo ""
echo "5. Checking Go build tools..."
missing_tools=0

if command -v sqlc &> /dev/null; then
    check_pass "sqlc installed"
else
    check_warn "sqlc not installed (run: go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest)"
    missing_tools=1
fi

if command -v mockgen &> /dev/null; then
    check_pass "mockgen installed"
else
    check_warn "mockgen not installed (run: go install github.com/golang/mock/mockgen@v1.7.0-rc-1)"
    missing_tools=1
fi

if command -v protoc-gen-go-drpc &> /dev/null; then
    check_pass "protoc-gen-go-drpc installed"
else
    check_warn "protoc-gen-go-drpc not installed (run: go install storj.io/drpc/cmd/protoc-gen-go-drpc@latest)"
    missing_tools=1
fi

# Check if build is possible
echo ""
echo "6. Testing build capability..."
if [[ $missing_tools -eq 0 ]] && command -v go &> /dev/null; then
    if [[ -d "coderd/database" ]]; then
        check_pass "Can attempt build"
        echo ""
        echo "   To test build, run: make build-slim"
    else
        check_fail "Not in Coder repository root"
    fi
else
    check_warn "Cannot test build (missing dependencies)"
fi

# Summary
echo ""
echo "=== Summary ==="
echo ""
echo "Required for GitHub Actions to work:"
echo "  ✓ Fork repository (tsingroc/coder)"
echo "  ✓ Workflow files in .github/workflows/"
echo "  ✓ Go and Docker installed"
echo "  ✓ Repository permissions configured"
echo ""
echo "Next steps:"
echo "  1. Configure repository permissions at:"
echo "     https://github.com/tsingroc/coder/settings/actions"
echo ""
echo "  2. Push changes to trigger workflow:"
echo "     git push origin main"
echo ""
echo "  3. Monitor workflow at:"
echo "     https://github.com/tsingroc/coder/actions"
echo ""
echo "  4. For detailed setup, see: FORK_SETUP_GUIDE.md"
echo ""
