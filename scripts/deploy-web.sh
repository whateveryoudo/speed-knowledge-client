#!/usr/bin/env bash
# 本地执行：构建前端并 rsync 到 ECS
#
# 用法:
#   cp scripts/deploy.env.example scripts/deploy.env   # 首次
#   ./scripts/deploy-web.sh
#   ./scripts/deploy-web.sh --build-only    # 只 build 不上传
#   ./scripts/deploy-web.sh --upload-only   # 只上传已有 dist
#
# SSH:
#   未配置密钥时会交互式提示输入 ECS 密码（与平时 ssh root@IP 相同）
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

if [[ -f "${SCRIPT_DIR}/deploy.env" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "${SCRIPT_DIR}/deploy.env"
  set +a
fi

ECS_HOST="${ECS_HOST:-8.137.203.142}"
ECS_USER="${ECS_USER:-root}"
ECS_WEB_DIR="${ECS_WEB_DIR:-/var/www/speed-knowledge}"
DIST_DIR="${ROOT_DIR}/apps/web/dist"

DO_BUILD=1
DO_UPLOAD=1

usage() {
  sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'
  echo ""
  echo "选项:"
  echo "  --build-only    仅 pnpm build:web"
  echo "  --upload-only   仅 rsync（需已有 apps/web/dist）"
  echo "  -h, --help      显示帮助"
  exit "${1:-0}"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --build-only)
      DO_UPLOAD=0
      shift
      ;;
    --upload-only)
      DO_BUILD=0
      shift
      ;;
    -h|--help)
      usage 0
      ;;
    *)
      echo "未知参数: $1" >&2
      usage 1
      ;;
  esac
done

build_web() {
  echo "==> 构建前端 (pnpm build:web)"
  cd "${ROOT_DIR}"
  if ! command -v pnpm >/dev/null 2>&1; then
    echo "ERROR: 需要 pnpm" >&2
    exit 1
  fi
  pnpm build:web
  if [[ ! -d "${DIST_DIR}" ]]; then
    echo "ERROR: 构建完成但未找到 ${DIST_DIR}" >&2
    exit 1
  fi
  echo "构建产物: ${DIST_DIR}"
}

upload_dist() {
  if [[ ! -d "${DIST_DIR}" ]]; then
    echo "ERROR: ${DIST_DIR} 不存在，请先构建或使用 --build-only 后再上传" >&2
    exit 1
  fi
  local target="${ECS_USER}@${ECS_HOST}:${ECS_WEB_DIR}/"
  echo ""
  echo "==> 上传到 ECS"
  echo "    ${DIST_DIR}/ -> ${target}"
  echo "    （SSH 未配密钥时会提示输入密码）"
  rsync -avz --delete ${RSYNC_EXTRA:-} -e ssh "${DIST_DIR}/" "${target}"
  echo ""
  echo "完成。访问: http://${ECS_HOST}/"
}

main() {
  echo "ECS: ${ECS_USER}@${ECS_HOST}"
  echo "目录: ${ECS_WEB_DIR}"
  [[ "${DO_BUILD}" -eq 1 ]] && build_web
  [[ "${DO_UPLOAD}" -eq 1 ]] && upload_dist
}

main
