# Coder Fork仓库GitHub Actions配置指南

本文档说明如何将Coder项目的GitHub Actions工作流适配到fork仓库`tsingroc/coder`中。

## 概述

原Coder项目的GitHub Actions包含多个限制条件，阻止其在fork仓库中正常工作：
- `if: github.repository_owner == 'coder'` - 限制只在官方仓库运行
- 使用官方的secrets和变量
- 依赖特定的基础架构

## 快速开始

### 1. Docker镜像构建工作流

已创建`.github/workflows/docker-build-fork.yaml`，支持：

**触发条件**：
- 推送到`main`或`develop`分支
- 创建版本标签（`v*`）
- Pull Request
- 手动触发

**功能**：
- ✅ 构建多架构Docker镜像（amd64, arm64, armv7）
- ✅ 推送到您的容器仓库 `ghcr.io/tsingroc/coder`
- ✅ 自动版本标记
- ✅ 缓存优化

**使用方法**：

```bash
# 方法1：推送到main分支自动触发
git push origin main

# 方法2：创建版本标签
git tag v2.0.0-custom
git push origin v2.0.0-custom

# 方法3：手动触发（在GitHub Actions页面）
# 点击 "Docker Build (Fork)" -> "Run workflow"
# 选择 "push_image" = true
```

### 2. 需要修改的原工作流

以下工作流包含`github.repository_owner == 'coder'`限制，需要修改：

| 工作流文件                           | 限制条件数 | 建议                               |
|--------------------------------------|------------|----------------------------------|
| `.github/workflows/docker-base.yaml` | 1          | 使用新的docker-build-fork.yaml替代 |
| `.github/workflows/release.yaml`     | 2          | 复制为release-fork.yaml并修改      |
| `.github/workflows/ci.yaml`          | 多处       | 仅在需要CI时修改                   |
| `.github/workflows/security.yaml`    | 2          | 可选：安全扫描                      |

### 3. 禁用不需要的工作流

对于fork仓库，建议禁用以下工作流：

```bash
# 在GitHub仓库设置中禁用：
# Settings -> Actions -> Workflows
# 禁用：
# - docker-base（使用docker-build-fork代替）
# - release（如果不需要官方发布流程）
# - deploy-docs、dogfood等
```

## 配置步骤

### 步骤1：设置仓库权限

1. 进入GitHub仓库：`https://github.com/tsingroc/coder`
2. **Settings** → **Actions** → **General**
3. 确保**Workflow permissions**设置为**Read and write permissions**
4. 勾选**Allow GitHub Actions to create and approve pull requests**

### 步骤2：配置容器仓库

1. 在GitHub上创建个人访问令牌（PAT）：
   - **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
   - 勾选 `write:packages` 和 `read:packages`
   - 生成并保存token

2. 或者使用内置的`GITHUB_TOKEN`（推荐）

### 步骤3：测试工作流

```bash
# 克隆您的fork仓库
git clone https://github.com/tsingroc/coder.git
cd coder

# 创建测试分支
git checkout -b test/docker-build

# 添加工作流文件（如果还没有）
git add .github/workflows/docker-build-fork.yaml
git commit -m "Add Docker build workflow for fork"
git push origin test/docker-build

# 创建Pull Request测试
# 或直接推送到main分支测试
git checkout main
git merge test/docker-build
git push origin main
```

### 步骤4：验证Docker镜像

构建成功后，验证镜像：

```bash
# 拉取并测试镜像
docker pull ghcr.io/tsingroc/coder:latest

# 运行容器测试
docker run --rm ghcr.io/tsingroc/coder:latest --help

# 查看镜像信息
docker inspect ghcr.io/tsingroc/coder:latest
```

## 高级配置

### 修改release工作流

如果需要发布功能，创建`release-fork.yaml`：

```yaml
# 基于原release.yaml，但移除以下限制：
# - if: github.repository_owner == 'coder'
# - 官方secrets的依赖
# - depot.dev的依赖（可选）

# 关键修改：
# 1. 将所有 `github.repository_owner == 'coder' && 'depot-xxx' || 'ubuntu-latest'`
#    改为 `'ubuntu-latest'`
# 2. 移除 `if: github.repository_owner == 'coder'` 条件
# 3. 替换官方secrets为您的secrets
```

### 自定义基础镜像

如果想使用自己的基础镜像：

```yaml
# 在docker-build-fork.yaml中修改：
BASE_IMAGE: ghcr.io/tsingroc/coder-base:latest

# 或使用Alpine直接：
BASE_IMAGE: alpine:3.23
```

### 设置secrets（可选）

在GitHub仓库中添加secrets：

**Settings** → **Secrets and variables** → **Actions**

可选secrets：
- `DOCKER_PASSWORD` - 如果使用Docker Hub
- `CODESIGN_CERTIFICATE` - 代码签名证书
- 等等...

## 故障排除

### 问题1：工作流没有触发

**解决方案**：
1. 检查工作流文件语法：`yamllint .github/workflows/docker-build-fork.yaml`
2. 确认分支名称正确
3. 检查**Actions**标签页是否有错误信息

### 问题2：镜像推送失败

**解决方案**：
1. 确认仓库权限设置为"Read and write"
2. 检查容器仓库是否可见：**Settings** → **Actions** → **General**
3. 验证`GITHUB_TOKEN`权限

### 问题3：构建超时

**解决方案**：
```yaml
# 在工作流中添加超时设置
jobs:
  build:
    timeout-minutes: 300
    steps:
      # ... steps
```

### 问题4：多架构构建失败

**解决方案**：
```yaml
# 使用Docker buildx的emulate模式
platforms: linux/amd64,linux/arm64
# 或分别构建每个架构
```

## 监控和维护

### 查看工作流状态

```bash
# 使用gh CLI查看工作流
gh workflow list
gh workflow view "Docker Build (Fork)"
gh run list --workflow="Docker Build (Fork)"
```

### 定期更新依赖

定期更新GitHub Actions版本：

```bash
# 查看过时的Actions
gh repo view tsingroc/coder --json actions

# 或使用：https://github.com/tsingroc/coder/actions
```

## 最佳实践

1. **安全性**：
   - 不要在fork中暴露官方secrets
   - 使用`GITHUB_TOKEN`而不是个人PAT
   - 定期审查工作流权限

2. **性能**：
   - 使用Docker层缓存
   - 并行构建多架构镜像
   - 只在必要时推送镜像

3. **可维护性**：
   - 保持工作流简单
   - 清理不需要的工作流
   - 定期检查和更新Actions版本

## 相关资源

- [GitHub Actions文档](https://docs.github.com/en/actions)
- [Docker Buildx文档](https://docs.docker.com/buildx/working-with-buildx/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [原Coder仓库](https://github.com/coder/coder)

## 支持

如有问题，请：
1. 检查Actions运行日志
2. 查看本文档的故障排除部分
3. 在您的fork仓库创建Issue
