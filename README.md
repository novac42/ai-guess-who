# AI Guess Who: Historical Figures (Text-Only)

A text-only historical figure guessing game. You and the local AI each choose a figure, then ask yes/no questions to eliminate candidates and win by identifying the opponent's figure.

This project now ships bilingual UI and prompt text (English + Chinese). The default language is **English**.

## Features

- Text-only gameplay (no image recognition, no image uploads, no OCR).
- Local on-device AI (`LanguageModel` Prompt API).
- In-place language switch between Chinese and English.
- Chinese version keeps the original mixed pool of Chinese and international historical figures.
- English version intentionally excludes `isChineseHistorical` figures so international players only get non-Chinese candidates.

## Browser Support

The game uses the browser's local Prompt API (Chromium-family implementations). If unsupported, the app shows compatibility guidance.

Recommended: Chrome or Edge with the on-device AI feature enabled.

## Local Development

```sh
npm install
npm run dev
```

## Production Build

```sh
npm run build
```

## Deployment

### Project URL

GitHub Pages: [https://novac42.github.io/ai-guess-who/](https://novac42.github.io/ai-guess-who/)

### GitHub Pages (repo deployment)

Since this project can be public, you can deploy it to GitHub Pages with a static build.

1. Build the site:

   ```sh
   npm run build
   ```

2. Publish `dist/` to `gh-pages`.
   The simplest workflow is with [`gh-pages`]:

   ```sh
   npm install --save-dev gh-pages
   ```

   Add scripts (example):

   - `"predeploy": "npm run build"`
   - `"deploy": "gh-pages -d dist"`

   Then run:

   ```sh
   npm run deploy
   ```

3. For repo pages under `https://<user>.github.io/<repo>/`, configure Vite base path if needed:

   ```ts
   // vite.config.ts
   export default defineConfig({
     base: "/ai-guess-who/",
     plugins: [react()],
   });
   ```

   (Adjust the path to your repository name.)

   For user/organization pages at `https://<user>.github.io/`, this base setting is usually not needed.

## Gameplay Guide

1. Start the app and wait for model readiness.
2. Click Start.
3. Check your secret figure and both candidate boards.
4. Ask yes/no questions.
5. Use system responses to eliminate candidates.
6. End your turn for AI to ask.
7. Answer AI questions and continue until one player guesses correctly.

## Development Notes

- Character data is in `src/constants.ts`.
- Language text is in `src/i18n.ts`.
- Core game and AI flow lives in `src/hooks/*`.

[`gh-pages`]: https://www.npmjs.com/package/gh-pages

---

# AI 猜名人：历史人物版（文字版）

一个纯文字版历史人物猜名人游戏。你和本地 AI 各自选择一位人物，通过“是/否”问题排除候选并猜中对方人物即获胜。

现在支持中英文双语界面与提示词，默认语言为**英文**。

## 功能

- 全流程文字交互（不需要图片识别、图片上传或语音）。
- 使用浏览器端本地 AI（`LanguageModel` Prompt API）。
- 可在中文/英文间切换。
- 中文版继续使用原来的中外混合人物池。
- 英文版会过滤 `isChineseHistorical`，默认仅抽取非中国历史人物。

## 浏览器要求

游戏依赖浏览器本地 Prompt API（Chromium 系列实现）。若不支持，会在启动页提示兼容性信息。

建议使用开启本地 AI 能力的 Chrome 或 Edge。

## 本地运行

```sh
npm install
npm run dev
```

## 生产构建

```sh
npm run build
```

## 部署

### 项目地址

GitHub Pages: [https://novac42.github.io/ai-guess-who/](https://novac42.github.io/ai-guess-who/)

### GitHub Pages（仓库公开后可用）

仓库变为 public 后，也可以使用 GitHub Pages 托管静态站点。

1. 先构建站点：

   ```sh
   npm run build
   ```

2. 将 `dist/` 发布到 `gh-pages` 分支。
   可使用 `gh-pages`：

   ```sh
   npm install --save-dev gh-pages
   ```

   在 `package.json` 中添加：

   - `"predeploy": "npm run build"`
   - `"deploy": "gh-pages -d dist"`

   然后运行：

   ```sh
   npm run deploy
   ```

3. 如果是仓库页（`https://<user>.github.io/<repo>/`），可能需要配置 Vite 的 base 路径：

   ```ts
   // vite.config.ts
   export default defineConfig({
     base: "/ai-guess-who/",
     plugins: [react()],
   });
   ```

   （按你仓库名改路径）。

   如果是用户页（`https://<user>.github.io/`）则通常不需要设置 base。

## 玩法流程

1. 打开页面并等待本地 AI 准备完成。
2. 点击开始游戏。
3. 查看自己的秘密人物和候选列表。
4. 提出可回答“是/否”的问题。
5. 根据回答在个人候选列表中排除人物。
6. 结束回合后由 AI 提问。
7. 回答 AI 问题并持续到任一方猜中即结束。

## 开发说明

- 人物数据：`src/constants.ts`
- 多语言文案：`src/i18n.ts`
- 游戏与 AI 主要逻辑：`src/hooks/*`
