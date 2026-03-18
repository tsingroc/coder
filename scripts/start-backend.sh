#!/usr/bin/env bash
#
# Coder 后端启动脚本
# 直接使用 go run 启动后端，加载 .env.local 环境变量
#

set -euo pipefail

SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }

# 检查 .env.local 文件
ENV_FILE="${PROJECT_ROOT}/.env.local"
if [ ! -f "$ENV_FILE" ]; then
    echo "错误: .env.local 文件不存在"
    exit 1
fi

# 加载环境变量
log_info "加载环境变量从 .env.local"
set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

# 设置默认值
export CODER_HTTP_ADDRESS="${CODER_HTTP_ADDRESS:-0.0.0.0:3000}"
export CODER_ACCESS_URL="${CODER_ACCESS_URL:-http://localhost:8080}"
export CODER_DANGEROUS_ALLOW_CORS_REQUESTS="${CODER_DANGEROUS_ALLOW_CORS_REQUESTS:-true}"
export CODER_SWAGGER_ENABLE="${CODER_SWAGGER_ENABLE:-true}"

# 显示配置
log_info "======================================"
log_info "Coder 后端启动"
log_info "======================================"
echo ""
echo "访问 URL:       ${CODER_ACCESS_URL} (前端地址)"
echo "后端地址:       ${CODER_HTTP_ADDRESS}"
echo "数据库:         ${CODER_PG_CONNECTION_URL%%@*}@***"
echo ""

cd "$PROJECT_ROOT"

# 启动后端
log_info "启动后端..."
exec go run ./cmd/coder server \
    --http-address="${CODER_HTTP_ADDRESS}" \
    --swagger-enable \
    --dangerous-allow-cors-requests=true \
    --access-url="${CODER_ACCESS_URL}"
