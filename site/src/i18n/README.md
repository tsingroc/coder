# Coder 前端国际化 (i18n) 实现文档

## 概述

本实现为 Coder 前端添加了中文翻译支持，使用 `react-i18next` 框架。

## 默认语言

系统默认语言为**中文（简体）**，缺失翻译时会自动回退到英文。

## 目录结构

```
site/src/i18n/
├── config.ts              # i18next 配置文件
├── index.ts               # 导出常用 hooks
├── react-i18next.d.ts     # TypeScript 类型定义
├── locales/               # 翻译文件目录
│   ├── en/                # 英文翻译（源语言）
│   │   ├── common.json
│   │   ├── login.json
│   │   ├── workspace.json
│   │   └── userSettings.json
│   └── zh-CN/             # 中文翻译（目标语言）
│       ├── common.json
│       ├── login.json
│       ├── workspace.json
│       └── userSettings.json
└── README.md              # 本文档
```

## 如何添加翻译

### 1. 在对应的 JSON 文件中添加翻译键值对

**英文翻译（优先）** - `locales/en/*.json`：
```json
{
  "newKey": "New Text"
}
```

**中文翻译** - `locales/zh-CN/*.json`：
```json
{
  "newKey": "新文本"
}
```

### 2. 在组件中使用翻译

```tsx
import { useTranslation } from "i18n";

export const MyComponent = () => {
  const { t } = useTranslation("login"); // 指定命名空间

  return (
    <div>
      <h1>{t("emailLabel")}</h1>
      <button>{t("passwordSignIn")}</button>
    </div>
  );
};
```

## 命名空间说明

- `common`: 通用词汇（按钮、状态等）
- `login`: 登录页面
- `workspace`: 工作区相关页面
- `userSettings`: 用户设置页面

## 上游更新适配指南

### 方案：独立的翻译文件 + 命名约定

本实现采用独立翻译文件的方式，确保上游更新时影响最小：

1. **翻译文件完全独立**：所有翻译文件位于 `site/src/i18n/locales/` 目录下
2. **组件 Hook 包装**：通过 `useLoginLanguage()` 等 hook 包装翻译，不影响现有代码结构
3. **优雅降级**：缺失翻译自动显示英文原文，不会破坏 UI

### 快速适配上游更新的步骤

#### 情况 1：上游修改了现有页面的文本

**示例**：上游在 LoginPage 添加了新字段 `phoneNumber`

1. 查看上游的 `Language.ts` 变更
2. 在 `locales/zh-CN/login.json` 中添加对应翻译：
   ```json
   {
     "phoneNumberLabel": "电话号码",
     "phoneRequired": "请输入电话号码"
   }
   ```
3. 在 `locales/en/login.json` 中添加英文原文（如果上游没有使用 Language.ts）

#### 情况 2：上游新增了页面需要翻译

1. 创建新的翻译文件，如 `locales/en/newPage.json` 和 `locales/zh-CN/newPage.json`
2. 在 `config.ts` 中导入并注册新命名空间
3. 在新页面组件中使用 `useTranslation("newPage")` hook

#### 情况 3：上游删除了某些字段

翻译文件中的冗余字段不会影响功能，可以保留或手动清理。

## 开发建议

### 查找需要翻译的文本

1. 使用 `grep` 查找硬编码的英文文本：
   ```bash
   grep -r "Email\|Password\|Sign In" site/src/pages/
   ```

2. 查找现有的 `Language.ts` 文件作为参考

### 翻译质量建议

- 保持简洁：按钮文本通常 1-4 个字
- 一致性：相同概念使用相同翻译（如 "Settings" → "设置"）
- 用户友好：使用用户熟悉的术语，避免技术用语

## 测试

### 运行开发服务器
```bash
cd site
pnpm dev
```

### 切换语言测试

在浏览器控制台中：
```javascript
// 切换到中文
i18n.changeLanguage("zh-CN");

// 切换到英文
i18n.changeLanguage("en");
```

### 查看当前语言
```javascript
console.log(i18n.language); // 当前语言
console.log(i18n.languages); // 所有可用语言
```

## 已翻译的页面

✅ **已完成翻译**：
- LoginPage（登录页面）

🔄 **计划翻译**（待上游更新后快速适配）：
- WorkspacesPage（工作区列表）
- WorkspacePage（工作区详情）
- CreateWorkspacePage（创建工作区）
- UserSettingsPage（用户设置下的所有子页面）
- TerminalPage（终端页面）
- ExternalAuthPage（外部认证页面）

## 注意事项

1. **不要修改上游的核心代码**：所有 i18n 相关的改动都在新增文件或独立目录中
2. **保持英文翻译同步**：英文翻译文件应始终是最新的源语言版本
3. **类型安全**：使用 TypeScript 类型定义确保翻译键值的类型安全
4. **测试覆盖**：确保翻译后的页面功能正常，没有布局问题

## 常见问题

### Q: 翻译没有生效？
A: 检查以下几点：
1. 确认翻译键在 JSON 文件中存在
2. 确认命名空间参数正确
3. 清除浏览器缓存和 localStorage

### Q: 如何添加新的语言？
A:
1. 在 `locales/` 下创建新语言目录（如 `ja` 表示日文）
2. 复制现有翻译文件并翻译内容
3. 在 `config.ts` 中导入并注册新语言
4. 在 `detection.options` 中添加语言检测逻辑

### Q: 动态内容如何翻译？
A: 使用插值语法：
```tsx
t("welcomeMessage", { name: userName })
// JSON: "welcomeMessage": "欢迎, {{name}}!"
```

## 贡献指南

在添加或修改翻译时，请确保：
1. 同时更新英文和中文翻译文件
2. 保持 JSON 格式正确
3. 运行 `pnpm format` 格式化文件
4. 测试页面显示正常

---

**最后更新**: 2025-03-13
