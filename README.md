# SSH Terminal

一款面向个人开发者的 SSH 终端模拟器，使用 Rust + Tauri + React 构建。

## 特性

- :lock: 安全存储：密码使用 Windows DPAPI 加密
- :computer: 终端体验：基于 xterm.js 的流畅终端
- :folder: 连接管理：支持分组、密码/密钥认证
- :art: 专业界面：经典 MobaXterm 风格

## 技术栈

- **前端**: React 18, TypeScript, xterm.js
- **后端**: Rust, Tauri 2.x, russh
- **桌面**: Tauri (Windows)

## 开发

### 环境要求

- Node.js 18+
- pnpm 8+
- Rust 1.75+
- Windows 10/11

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm tauri dev
```

### 构建

```bash
pnpm tauri build
```

## 项目结构

```
ssh-terminal/
├── src/                    # React 前端
│   ├── modules/            # 功能模块
│   │   ├── connection/     # 连接管理
│   │   ├── terminal/      # 终端
│   │   └── settings/       # 设置
│   └── shared/             # 共享组件
├── src-tauri/              # Rust 后端
│   └── src/
│       ├── modules/        # 业务模块
│       └── infrastructure/  # 基础设施
```

## License

MIT
