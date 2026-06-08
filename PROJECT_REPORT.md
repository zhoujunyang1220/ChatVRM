# ChatVRM — 项目进展报告

> 智能语言学习 AI 聊天应用，集成 3D VRM 虚拟角色、语音交互、多语言对话。

---

## 一、项目概述

ChatVRM 是一个基于 Next.js 的 AI 聊天应用，核心特色：

- **3D 虚拟角色**：使用 VRM 格式的 3D 模型作为 AI 形象，支持面部表情和口型同步
- **语音交互**：支持语音输入（Web Speech API）和语音输出（Edge TTS）
- **多语言对话**：内置 7 种语言（中/英/日/韩/西/法/德）的对话陪练模式
- **实时流式响应**：AI 回复以 SSE 流式输出，逐句显示和朗读
- **双模式界面**：深色/浅色主题 + 台灯交互式切换

---

## 二、技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 13.2.4 (Pages Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS + CSS Variables |
| 动画 | Framer Motion |
| 3D 渲染 | @pixiv/three-vrm (Three.js) |
| AI 后端 | Hugging Face Spaces (Agnes API) |
| TTS | Edge TTS |
| 语音识别 | Web Speech API |
| 构建工具 | webpack (Next.js 内置) |

---

## 三、项目结构

```
src/
├── components/
│   ├── chatBubble.tsx          # 对话气泡组件（用户 & AI）
│   ├── githubLink.tsx          # GitHub 链接
│   ├── iconButton.tsx          # 图标按钮
│   ├── introduction.tsx        # 首次使用引导
│   ├── menu.tsx                # 侧边菜单（设置/配置）
│   ├── messageInput.tsx        # 消息输入框（含语音输入）
│   ├── messageInputContainer.tsx
│   ├── meta.tsx                # SEO / Meta 标签
│   ├── settings.tsx            # 设置面板
│   ├── textButton.tsx          # 文字按钮
│   ├── themeToggle.tsx         # 台灯主题切换组件
│   ├── typingIndicator.tsx     # "正在输入" 动画
│   └── vrmViewer.tsx           # 3D VRM 角色渲染
│
├── features/
│   ├── chat/
│   │   └── openAiChat.ts       # SSE 流式聊天 API 客户端
│   ├── constants/
│   │   ├── elevenLabsParam.ts
│   │   ├── koeiroParam.ts
│   │   ├── languagePresets.ts  # 7 种语言预设
│   │   ├── systemPromptConstants.ts
│   │   └── vrmModelPresets.ts
│   ├── messages/
│   │   ├── messageMiddleOut.ts # 消息上下文裁剪
│   │   ├── messages.ts
│   │   └── speakCharacter.ts   # TTS + 口型同步
│   └── vrmViewer/
│       └── viewerContext.tsx
│
├── pages/
│   ├── api/
│   │   ├── chat.ts             # SSE 代理 → HF Spaces 后端
│   │   └── tts.ts              # TTS 代理
│   └── index.tsx               # 主页面
│
├── services/
│   └── websocketService.ts     # WebSocket 服务
│
└── styles/
    └── globals.css             # 全局样式 / 主题变量
```

---

## 四、当前功能状态

### ✅ 已完成

#### 1. AI 对话
- [x] SSE 流式 AI 响应
- [x] 逐句分割 + 实时显示
- [x] 自动 TTS 朗读
- [x] 消息上下文管理（MessageMiddleOut 裁剪）
- [x] 后端冷启动预预热

#### 2. 多语言支持
- [x] 7 种语言预设（English / 中文 / 日本語 / 한국어 / Español / Français / Deutsch）
- [x] 切换语言时自动切换系统提示词
- [x] 语音识别语言自动适配
- [x] TTS 语音自动切换
- [x] 切换语言时清空对话历史

#### 3. VRM 虚拟角色
- [x] 3D 模型加载与渲染
- [x] 面部表情 / 口型同步
- [x] 多模型切换（默认 + 4 个预设 + 自定义上传）
- [x] 唇形同步（viseme）

#### 4. 语音交互
- [x] 语音输入（Web Speech API）
- [x] 语音输出（Edge TTS）
- [x] 语音输入时视觉反馈（脉冲动画）
- [x] WebSocket 实时语音流

#### 5. UI / UX
- [x] 玻璃拟态设计（glassmorphism）
- [x] 深色 / 浅色主题切换
- [x] 台灯交互式主题切换（可拖拽拉线）
- [x] 台灯开关时随机颜色变化
- [x] 台灯眼睛表情（睁眼/闭眼）
- [x] 拉线拖拽音效（Web Audio API）
- [x] 对话气泡（用户 & AI）
- [x] "正在输入" 动画
- [x] 设置面板（语言/模型/声音/背景）

#### 6. 工程化
- [x] Capacitor Android 打包支持
- [x] 安全区域适配（notch 屏幕）
- [x] 键盘弹出适配
- [x] 本地存储持久化（主题/设置/对话历史）

### 🚧 进行中 / 待完善

- [ ] 对话上下文跨页面持久化
- [ ] TTS 语音流中断处理
- [ ] 移动端触摸体验优化
- [ ] VRM 模型表情适配更多模型
- [ ] 离线模式 / PWA 支持

---

## 五、台灯交互设计

台灯主题切换是项目的特色交互，核心逻辑：

```
用户拖拽拉线 → 超过 50px 阈值 → "咔哒"音效 → 随机 hue → CSS 变量更新 → 主题切换
```

- **拖拽拉线**：使用 Pointer Events API，拉线底部固定在台灯上，拖拽时拉线自然伸长
- **弹性回弹**：松手后拉线通过 framer-motion 弹簧动画弹回
- **随机颜色**：每次开关生成随机 hue（0-360），通过 `--shade-hue` CSS 变量联动页面
- **眼睛表情**：灯罩上有两只眼睛，开灯时瞳孔朝上（精神），关灯时朝下（睡着）
- **音效**：Web Audio API 合成机械拉线声 + 开关咔哒声

### CSS 变量体系

```css
--on: 0 | 1           /* 台灯状态 */
--shade-hue: 0-360     /* 当前随机色相 */
```

---

## 六、关键配置说明

### 环境变量
项目使用 `.env.local` 配置后端地址：
```
NEXT_PUBLIC_API_URL=https://your-backend.com
```

### 后端接口格式
AI 后端返回 SSE 流，每行格式：
```
data: {"type": "chunk", "content": "回复文本"}
data: {"type": "done"}
```

### 语言预设
`src/features/constants/languagePresets.ts` — 每种语言包含：
- `systemPrompt`：语言专用系统提示词
- `speechRecognitionLang`：语音识别 BCP 47 代码
- `recommendedVoiceId`：推荐 TTS 声音

---

## 七、启动方式

```bash
cd ChatVRM
npm install
npm run dev -p 3006
```

---

## 八、下一步开发建议

1. **AI 回复质量优化**：当前后端冷启动延迟较长（30-60s），可考虑使用流式唤醒或保活机制
2. **对话持久化**：当前用 localStorage 保存，可迁移到 IndexedDB 或后端存储
3. **语音交互增强**：支持语音中断（当前需等 AI 说完才能继续输入）
4. **VRM 模型丰富**：添加更多自定义模型，支持模型预览
5. **国际化**：UI 界面本身目前为英文，可添加完整 i18n
6. **台灯交互扩展**：台灯当前控制深浅色模式，可扩展为控制更多页面氛围参数
7. **PWA 支持**：添加 Service Worker 和离线能力
