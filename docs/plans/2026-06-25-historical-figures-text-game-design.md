# AI Guess Who: Historical Figures Text Game Design

## Goal

Build a Chinese-language, text-only version of AI Guess Who for Chinese readers. The game uses mixed Chinese and international historical figures instead of visual character cards.

The game must use the browser on-device Prompt API through a text-only `LanguageModel` session. It must not use image understanding, audio input, camera input, or multimodal prompts.

## Browser And AI Requirements

- Use the browser-provided on-device Prompt API.
- Support Chrome and Edge when they expose a compatible Prompt API entry point.
- Detect capability at runtime instead of hard-coding a browser name.
- Prefer `self.LanguageModel`; fall back to `self.ai?.languageModel`.
- Create text-only sessions without `expectedInputs` for image or audio.
- Show Chinese compatibility guidance when the API is unavailable.

## Game Concept

The first version is a web game named `AI 猜名人：历史人物版`.

Each round randomly selects a subset from a fixed mixed historical figure deck. The player and the AI each receive one secret figure. The player asks Chinese yes/no questions to identify the AI's secret figure. The AI asks Chinese yes/no questions and narrows its own candidate list from the player's answers.

The game remains a board-style deduction game, but every card is text only.

## Figure Deck

Use a fixed initial deck of 24 figures, split evenly between Chinese and international figures.

Chinese figures:

- 孔子
- 秦始皇
- 汉武帝
- 李白
- 武则天
- 岳飞
- 成吉思汗
- 郑和
- 康熙
- 慈禧
- 孙中山
- 鲁迅

International figures:

- 亚历山大大帝
- 凯撒
- 拿破仑
- 林肯
- 莎士比亚
- 达芬奇
- 牛顿
- 居里夫人
- 爱因斯坦
- 甘地
- 曼德拉
- 马丁·路德·金

Each figure should use structured text data:

```typescript
type HistoricalFigure = {
    character_id: string;
    name: string;
    region: string;
    era: string;
    roles: string[];
    tags: string[];
    summary: string;
};
```

The existing `Character` type can be evolved to this shape if that keeps the refactor smaller.

## UI Design

The application stays as a React/Vite web app.

The setup screen should be fully Chinese and focused on starting a default historical figure game. The first version should remove or hide camera-based custom game setup and voice input.

The game screen should show:

- The player's secret figure as a text profile.
- The AI's secret figure hidden until game over.
- The AI candidate board as text cards.
- The player's candidate board as text cards that can be clicked to eliminate or restore figures.
- A Chinese chat/control area for asking questions, answering AI questions, ending turns, and reviewing AI analysis.

Text cards should show name, region, era, roles, tags, and a short summary. Eliminated figures should remain visible but clearly marked as eliminated.

## Prompt Design

All prompts should be Chinese and based only on structured figure text.

When answering the player's question, the AI receives its secret figure's text profile and the player's question. It must return a constrained boolean response when possible.

When asking its own question, the AI receives its remaining candidate profiles and chat history. It must output a JSON object with:

- `question`: a Chinese yes/no question.
- `analysis`: one entry per candidate with `id`, `name`, `has_feature`, and Chinese `reasoning`.

Rules for AI questions:

- Ask only yes/no questions that can be answered from the figure profiles.
- Prefer questions that split the remaining candidate set.
- Avoid direct identity guesses until very few candidates remain.
- Do not ask about images, appearance, audio, camera data, or unknown external facts.

## Removed Or Hidden Scope

The first version should remove or hide runtime dependence on:

- Generated character images.
- Image blobs.
- Camera custom game creation.
- Audio transcription and voice input.
- Multimodal Prompt API inputs.
- English game-facing copy.

## Preserved Scope

Keep the existing game flow where practical:

- On-device model availability and download status.
- Starting and resetting a game.
- Player question turn.
- Player elimination turn.
- AI question turn.
- Optional AI analysis review mode.
- Win/loss dialog.

## Error Handling

When the Prompt API is unavailable, show a Chinese message explaining that the game requires a Chrome or Edge browser with a compatible on-device Prompt API enabled.

When model initialization or download fails, show the failure in Chinese and allow retry through the existing setup flow.

When the model returns malformed JSON for AI question analysis, retry with the existing retry pattern where possible. If it still fails, show a Chinese system message and keep the game recoverable.

## Testing And Verification

Verification should cover:

- TypeScript build passes.
- Default historical figure game starts without image assets.
- Text-only `LanguageModel` sessions are created.
- No runtime path requires image blobs, camera input, or audio input.
- Chinese UI copy displays on setup, board, chat controls, and end-game states.
- Clicking text cards toggles elimination.
- Prompt functions no longer mention visual analysis.
