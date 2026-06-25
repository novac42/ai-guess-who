# Setup Download And Candidate Card Iteration Plan

## Goal

Refine the setup and board experience for the Chinese historical figure game:

- Keep the title on one line.
- Hide the explicit model download button by default.
- Prepare or download the model after the player clicks `开始游戏`.
- Show only small status text during model preparation.
- Remove progress-bar emphasis from the default player flow.
- Show only figure names on candidate cards.

## Design

### 1. Keep The Title On One Line

Modify `src/components/GameSetup.module.css`.

Use a constrained responsive title size and prevent wrapping:

```css
.mainTitle {
    white-space: nowrap;
    font-size: clamp(1.55rem, 7vw, 2.6rem);
}
```

Remove the current large desktop override that can force wrapping. Keep the title centered and avoid negative letter spacing.

### 2. Add A Developer Switch For Explicit Model Download

Create `src/config.ts`:

```typescript
export const SHOW_EXPLICIT_MODEL_DOWNLOAD_BUTTON = false;
```

Default behavior when `false`:

- The setup screen shows only `开始游戏` as the primary action.
- If the model is ready, clicking `开始游戏` starts the game.
- If the model is downloadable, clicking `开始游戏` starts model download/preparation.
- During initialization or download, disable the start button.
- Show small status text such as `正在准备本地 AI 模型...` and `首次使用需要一些时间`.
- Do not show the explicit download button.
- Do not show a prominent progress bar.
- When the model becomes ready after the user's click, start the game automatically.

Developer behavior when `true`:

- Show the explicit `下载本地 AI 模型` button.
- Keep `开始游戏` disabled until the model is ready.
- This mode is for development and browser capability testing.

### 3. Adjust Setup Flow State

Modify:

- `src/components/GameSetup.tsx`
- `src/hooks/useGameLogic.ts`
- `src/hooks/useAIModel.ts`

The setup component should receive enough state and callbacks to distinguish:

- model ready
- model downloadable
- model downloading
- user has requested start

The game logic should preserve the user's intent to start once the model becomes ready. Avoid starting a game automatically on page load; auto-start only after a user click.

### 4. Simplify Candidate Cards

Modify:

- `src/components/CharacterCard.tsx`
- `src/components/CharacterCard.module.css`

Candidate cards should display only:

- figure name
- optional AI analysis icon
- eliminated state

Remove visible region, era, role, tags, and summary from candidate cards.

Keep the full `Character` data model unchanged because AI prompts still need structured figure metadata.

Keep `SecretCard` more detailed for now so the player can see their own secret figure context.

## Verification

Run:

```sh
npm run build
```

Manual checks:

1. `AI 猜名人：历史人物版` stays on one line on mobile and desktop.
2. Default setup page does not show a separate download button.
3. Clicking `开始游戏` starts model preparation when the model is not ready.
4. Model preparation uses small status text and no prominent progress bar.
5. When the model becomes ready after a user click, the game starts.
6. Candidate board cards show only figure names.
7. Secret figure cards still show enough detail for the player.
8. AI prompts still receive full figure data.

## Publish

After implementation:

```sh
npm run build
git add -A
git commit -m "feat: simplify setup and candidate cards"
git push origin master
```

GitHub Pages deployment should run from the existing workflow.
