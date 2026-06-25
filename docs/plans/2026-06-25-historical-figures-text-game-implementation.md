# Historical Figures Text Game Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the forked AI Guess Who app into a Chinese, text-only historical figures game powered by the browser on-device Prompt API.

**Architecture:** Keep the existing React/Vite game loop and refactor the domain data, UI, and AI prompts from visual character cards to structured text profiles. The AI layer becomes a text-only Prompt API adapter that works with compatible Chrome and Edge implementations via feature detection.

**Tech Stack:** React 18, TypeScript, Vite, browser `LanguageModel` Prompt API, CSS modules.

---

### Task 1: Convert Character Data To Historical Figure Text Profiles

**Files:**
- Modify: `src/types.ts`
- Modify: `src/constants.ts`
- Modify: `src/hooks/useGameState.ts`
- Modify: `src/hooks/useGameLogic.ts`
- Modify: `src/hooks/useAIModel.ts`
- Modify: `src/services/builtInAIService.ts`

**Step 1: Update the shared character type**

In `src/types.ts`, replace image-oriented fields with text profile fields while keeping the `Character` name to reduce churn:

```typescript
export type Character = {
    character_id: string;
    name: string;
    region: string;
    era: string;
    roles: string[];
    tags: string[];
    summary: string;
};
```

Keep `Message`, `GameState`, `GameWinner`, `AIStatus`, `EliminationAnalysisResult`, and `AIQuestionAndAnalysis` unchanged.

**Step 2: Replace `DEFAULT_CHARACTERS` with 24 Chinese text profiles**

In `src/constants.ts`, replace all image paths with the 24 approved historical figures. Use stable ASCII ids and Chinese display text.

Example entry shape:

```typescript
{
    character_id: "confucius",
    name: "孔子",
    region: "中国",
    era: "古代",
    roles: ["思想家", "教育家"],
    tags: ["儒家", "春秋", "经典"],
    summary: "春秋时期思想家和教育家，儒家学派的重要代表。",
}
```

Include these figures: 孔子, 秦始皇, 汉武帝, 李白, 武则天, 岳飞, 成吉思汗, 郑和, 康熙, 慈禧, 孙中山, 鲁迅, 亚历山大大帝, 凯撒, 拿破仑, 林肯, 莎士比亚, 达芬奇, 牛顿, 居里夫人, 爱因斯坦, 甘地, 曼德拉, 马丁·路德·金.

**Step 3: Remove image blob gating from game startup**

In `src/hooks/useGameState.ts`, delete the `characterSet.some((c) => !c.imageBlob)` check and the `Missing character image blobs.` error. Update the initial system message to Chinese:

```typescript
text: `新游戏开始。你抽到的人物是${pSecret.name}。现在轮到你提问。`,
```

**Step 4: Rename loaded default character state in `useAIModel`**

In `src/hooks/useAIModel.ts`, stop importing `loadBlobsForDefaultCharacters`. Replace `defaultCharsWithBlobs` state with `defaultCharacters` or keep the returned property name for minimal App churn but set it directly to `DEFAULT_CHARACTERS` when AI is ready.

Minimal low-churn option:

```typescript
const [defaultCharsWithBlobs, setDefaultCharsWithBlobs] = useState<Character[] | null>(null);

useEffect(() => {
    if (aiStatus === AIStatus.READY && !defaultCharsWithBlobs) {
        setDefaultCharsWithBlobs(DEFAULT_CHARACTERS);
    }
}, [aiStatus, defaultCharsWithBlobs]);
```

**Step 5: Remove data loader export from facade**

In `src/services/builtInAIService.ts`, remove:

```typescript
export { loadBlobsForDefaultCharacters } from "./ai/dataLoader";
```

Leave `src/services/ai/dataLoader.ts` unused for now unless TypeScript complains. Prefer deleting it in a later cleanup task after the app compiles.

**Step 6: Run build**

Run: `npm run build`

Expected: build fails only where UI or AI code still references `image` or `imageBlob`, which will be addressed in later tasks. There should be no errors from `types.ts` or `constants.ts` themselves.

**Step 7: Commit**

```bash
git add src/types.ts src/constants.ts src/hooks/useGameState.ts src/hooks/useGameLogic.ts src/hooks/useAIModel.ts src/services/builtInAIService.ts
git commit -m "feat: add historical figure text data"
```

### Task 2: Make Prompt API Sessions Text-Only And Browser-Compatible

**Files:**
- Modify: `src/services/ai/session.ts`
- Modify: `src/services/ai/types.ts`
- Modify: `src/services/ai/api.ts`
- Modify: `src/services/prompts.ts`

**Step 1: Remove multimodal session options**

In `src/services/ai/session.ts`, delete:

```typescript
const createOptions = {
    expectedInputs: [{ type: "image" }, { type: "audio" }],
};
```

Replace every `model.create(createOptions)` and spread of `createOptions` with text-only `model.create()` or `model.create({ monitor })` for downloads.

**Step 2: Localize status messages and mention Chrome/Edge**

In `initialize`, replace English status strings with Chinese:

```typescript
onStatusChange(AIStatus.INITIALIZING, "正在初始化本地 AI 模型...");
onStatusChange(AIStatus.READY, "本地 AI 模型已就绪");
```

Unavailable message:

```typescript
"当前浏览器没有可用的本地 Prompt API。请使用支持该能力的 Chrome 或 Edge，并按需启用实验性 AI 功能。"
```

**Step 3: Keep capability detection browser-neutral**

Ensure `getModelEntryPoint` remains:

```typescript
function getModelEntryPoint(): LanguageModel | null {
    if (self.LanguageModel) return self.LanguageModel;
    if (self.ai?.languageModel) return self.ai.languageModel;
    return null;
}
```

**Step 4: Remove audio transcription API**

In `src/services/ai/api.ts`, delete `transcribeAudio`. In `src/services/builtInAIService.ts`, stop exporting it if still present.

**Step 5: Rewrite `getAnswerToPlayerQuestion` as text-only**

Remove the `imageBlob` guard and image content. Use only text:

```typescript
const prompt = getAnswerToPlayerQuestionPrompt(character, question);
const result = await promiseWithTimeout(
    session.prompt(prompt, { responseConstraint: { type: "boolean" } }),
    GENERAL_PROMPT_TIMEOUT_MS,
);
return JSON.parse(result) ? "是" : "否";
```

If `session.prompt` requires structured messages in the current browser, use:

```typescript
session.prompt([{ role: "user", content: [{ type: "text", value: promptText }] }], options)
```

Choose the style already accepted by the project after local build checks. Do not include image or audio parts.

**Step 6: Rewrite `getAIQuestionAndAnalysis` text prompt**

Keep chat history, but only push text content. Do not append character images. The final user content should be:

```typescript
const userContent = [{ type: "text", value: `${systemPrompt}\n\n${turnPrompt}` }];
prompt.push({ role: "user", content: userContent });
```

**Step 7: Rewrite prompt builders in Chinese**

In `src/services/prompts.ts`, add a formatter:

```typescript
const formatFigure = (character: Character): string =>
    `${character.name}｜${character.region}｜${character.era}｜${character.roles.join("、")}｜${character.tags.join("、")}｜${character.summary}`;
```

`getSystemPrompt` should describe a Chinese Guess Who historical figure game.

`getAIQuestionAndAnalysisPrompt` should instruct the model to ask a Chinese yes/no question based on region, era, roles, tags, or summary, and output only JSON.

`getAnswerToPlayerQuestionPrompt` should include the secret figure profile and ask for only boolean output.

Avoid all mentions of image, visual feature, camera, audio, gender-first heuristics, or appearance.

**Step 8: Run build**

Run: `npm run build`

Expected: no TypeScript errors from AI services or prompts. UI image references may remain until Task 3.

**Step 9: Commit**

```bash
git add src/services/ai/session.ts src/services/ai/types.ts src/services/ai/api.ts src/services/prompts.ts src/services/builtInAIService.ts
git commit -m "feat: use text-only prompt api"
```

### Task 3: Replace Image Cards With Chinese Text Cards

**Files:**
- Modify: `src/components/CharacterCard.tsx`
- Modify: `src/components/CharacterCard.module.css`
- Modify: `src/components/SecretCard.tsx`
- Modify: `src/components/SecretCard.module.css`
- Modify: `src/components/GameBoard.tsx`
- Modify: `src/components/GameBoard.module.css`

**Step 1: Refactor `CharacterCard` markup**

Replace image/front/back flip card markup with a text card. Keep props and click behavior.

Suggested structure:

```tsx
<div className={`${styles.card} ${isEliminated ? styles.isEliminated : ""} ${className || ""}`} ...>
    <div className={styles.cardHeader}>
        <h3 className={styles.cardName}>{character.name}</h3>
        {renderAnalysisOverlay()}
    </div>
    <dl className={styles.metaList}>
        <div><dt>地区</dt><dd>{character.region}</dd></div>
        <div><dt>时代</dt><dd>{character.era}</dd></div>
        <div><dt>身份</dt><dd>{character.roles.join("、")}</dd></div>
    </dl>
    <div className={styles.tags}>{character.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
    <p className={styles.summary}>{character.summary}</p>
</div>
```

Update `aria-label` to Chinese.

**Step 2: Refactor `SecretCard`**

When revealed, show the same text profile fields. When hidden, show a Chinese placeholder:

```tsx
<div className={styles.placeholder} aria-label="AI 的秘密人物尚未揭晓">
    <span>?</span>
    <p>AI 的秘密人物</p>
</div>
```

**Step 3: Update CSS modules**

Remove image sizing and flip-specific CSS. Use stable text-card dimensions with responsive constraints:

- Cards should not resize on hover or elimination.
- Use compact type sizes for board cards.
- Use visible eliminated state with opacity and line-through or overlay text.
- Avoid large rounded decorative cards; keep radius at 8px or less.

**Step 4: Run build**

Run: `npm run build`

Expected: no `character.image` TypeScript errors from card components.

**Step 5: Commit**

```bash
git add src/components/CharacterCard.tsx src/components/CharacterCard.module.css src/components/SecretCard.tsx src/components/SecretCard.module.css src/components/GameBoard.tsx src/components/GameBoard.module.css
git commit -m "feat: render historical figures as text cards"
```

### Task 4: Localize Game Flow And Remove Voice/Custom Entrypoints

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/GameSetup.tsx`
- Modify: `src/components/GameSetup.module.css`
- Modify: `src/components/ChatControls.tsx`
- Modify: `src/components/ChatControls.module.css`
- Modify: `src/components/EndGameDialog.tsx`
- Modify: `src/hooks/usePlayerActions.ts`
- Modify: `src/hooks/useAIActions.ts`
- Modify: `src/hooks/useGameSettings.ts` if copy appears there

**Step 1: Remove custom setup route from App**

In `src/App.tsx`, remove `CustomGameSetup` import and the `GameState.CUSTOM_SETUP` render path. Keep `GameState.CUSTOM_SETUP` enum only if removing it causes broad churn.

In setup props, remove or ignore `onStartCustom`, `onStartWithCustomSet`, and `hasCustomSet` if Task 4 also updates `GameSetupProps`.

**Step 2: Simplify and localize `GameSetup`**

Show title `AI 猜名人：历史人物版` and subtitle `用中文问题挑战本地 AI，猜出对方的历史人物。`

Keep one primary card/button: `开始游戏`.

Keep analysis review checkbox with Chinese copy.

Localize download/status button text:

- `下载本地 AI 模型`
- `正在加载人物资料...`
- `本地 AI 模型已就绪`

Remove camera/custom option cards and related icons.

**Step 3: Remove voice input from `ChatControls`**

Delete `useSpeechToText` import and all mic state/toggle logic. Remove mic button. Keep text input and send button.

Localize UI copy:

- Placeholder: `输入一个能用“是/否”回答的问题...`
- Loading: `处理中...`
- End turn: `结束回合`
- Continue: `继续回答`
- Yes: `是`
- No: `否`

Keep prop type `onPlayerAnswer: (answer: "Yes" | "No") => void` for now unless updating all internals. Button labels can be Chinese while values remain English.

**Step 4: Localize player action messages**

In `src/hooks/usePlayerActions.ts`, update final guess detection to support Chinese patterns:

```typescript
const FINAL_GUESS_REGEX = /^(?:是|是不是|是.*吗|你的.*是)\s*(.*?)\??？?$/i;
```

If this is too permissive, use a helper that checks whether the question includes a known active character name and starts with `是`, `是不是`, or contains `吗`.

Localize messages:

- `你现在可以排除候选人物。完成后点击“结束回合”。`
- `抱歉，我刚才没有回答好。请再试一次。`

When normal AI answers return `是`/`否`, display them directly.

**Step 5: Localize AI action messages**

In `src/hooks/useAIActions.ts`, update final guess string:

```typescript
const guess = `你的秘密人物是${aiRemainingChars[0].name}吗？`;
```

Update answer display to Chinese:

```typescript
addMessage({ sender: "PLAYER", text: answer === "Yes" ? "是" : "否" });
```

Localize system and win reason strings.

**Step 6: Localize board labels in `App.tsx`**

Update visible labels:

- `你的秘密人物`
- `AI 的秘密人物`
- `AI 的候选列表`
- `你的候选列表`
- `点击人物卡来排除或恢复候选。`
- `AI 会根据你的回答排除自己的候选人物。`
- Toggle labels: `隐藏秘密人物` / `显示秘密人物`

**Step 7: Run build**

Run: `npm run build`

Expected: no references to `useSpeechToText` from rendered components. Build passes or only fails on unused deleted files addressed in Task 5.

**Step 8: Commit**

```bash
git add src/App.tsx src/components/GameSetup.tsx src/components/GameSetup.module.css src/components/ChatControls.tsx src/components/ChatControls.module.css src/components/EndGameDialog.tsx src/hooks/usePlayerActions.ts src/hooks/useAIActions.ts src/hooks/useGameSettings.ts
git commit -m "feat: localize historical figure game flow"
```

### Task 5: Remove Dead Multimodal And Custom Game Code

**Files:**
- Delete: `src/hooks/useSpeechToText.ts`
- Delete: `src/components/CustomGameSetup.tsx`
- Delete: `src/components/CustomGameSetup.module.css`
- Delete: `src/services/ai/dataLoader.ts`
- Delete or stop using: `src/services/dbService.ts`
- Modify: `src/hooks/useGameLogic.ts`
- Modify: `src/hooks/useGameSettings.ts`
- Modify: `src/types.ts`
- Modify: `README.md`

**Step 1: Remove imports and handlers for custom sets**

In `src/hooks/useGameLogic.ts`, remove `dbService` import, `hasCustomSet`, `setHasCustomSet`, and `handleStartWithCustomSet` if no UI consumes them. Keep `startGame` and `handleStartDefault`.

In `src/hooks/useGameSettings.ts`, remove custom-set local storage logic if present. Keep only review mode logic.

**Step 2: Remove unused enum state**

In `src/types.ts`, remove `CUSTOM_SETUP` from `GameState` if no code references it after Task 4.

**Step 3: Delete unused files**

Use `apply_patch` delete patches or `rm` only for generated/unneeded files after confirming no imports remain:

```bash
rg "CustomGameSetup|useSpeechToText|loadBlobsForDefaultCharacters|dbService|CUSTOM_SETUP" src
```

Expected before deletion: no hits that are active imports or enum cases.

**Step 4: Update README**

Rewrite README in concise Chinese. Cover:

- Game purpose.
- Requires compatible Chrome or Edge with on-device Prompt API.
- Text-only, no images or server AI calls.
- Install and run commands.

Do not retain hosted link to the original upstream demo as the primary play URL.

**Step 5: Run search checks**

Run:

```bash
rg "imageBlob|type: \"image\"|type: \"audio\"|camera|Camera|microphone|Mic|Transcribing|CustomGameSetup|dbService|loadBlobs" src README.md
```

Expected: no runtime references. Mentions in comments should also be removed unless they explain removed constraints in docs.

**Step 6: Run build**

Run: `npm run build`

Expected: PASS.

**Step 7: Commit**

```bash
git add -A
git commit -m "chore: remove multimodal and custom game paths"
```

### Task 6: Final Verification And Browser Smoke Test

**Files:**
- Modify only files needed for fixes found during verification.

**Step 1: Format**

Run: `npm run format`

Expected: Prettier completes successfully.

**Step 2: Build**

Run: `npm run build`

Expected: Vite build succeeds.

**Step 3: Start dev server**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite prints a local URL, usually `http://127.0.0.1:5173/`.

Keep the server running until browser smoke test is complete.

**Step 4: Smoke test in browser**

Open the local URL in a compatible browser. Verify:

- Setup page is Chinese.
- Browser compatibility copy mentions Chrome/Edge Prompt API when unavailable.
- Start button becomes usable when the model is ready.
- Starting a game shows text cards, not images.
- Player secret card is text.
- AI secret card is hidden.
- Submitting a Chinese question uses the text Prompt API.
- Elimination card clicks toggle visibly.
- End-turn flow reaches AI question generation.

If local machine/browser cannot provide Prompt API during automated verification, document that limitation and still verify build plus static UI path as far as possible.

**Step 5: Final source search**

Run:

```bash
rg "image|audio|camera|microphone|voice|Transcribing|Ask with voice|Generated|jpeg|imageBlob" src README.md
```

Expected: no game-facing runtime dependency on image/audio/camera. Allow `image` only if it appears in generic browser docs outside runtime; prefer removing all hits for clarity.

**Step 6: Commit verification fixes**

If formatting or smoke-test fixes changed files:

```bash
git add -A
git commit -m "fix: polish historical figure text game"
```

If no changes occurred, do not create an empty commit.

**Step 7: Push fork branch**

Run:

```bash
git status --short --branch
git push origin master
```

Expected: local `master` pushes to `novac42/ai-guess-who`.
