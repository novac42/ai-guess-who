import { type Character } from "../types";

const formatFigure = (character: Character): string =>
    `${character.name}｜${character.region}｜${character.era}｜${character.roles.join("、")}｜${character.tags.join("、")}｜${character.summary}`;

const formatFigureList = (characters: Character[]): string =>
    characters.map((character, index) => `${index + 1}. ${character.character_id}｜${formatFigure(character)}`).join("\n");

/**
 * Provides the system prompt that defines the AI's strategy for the text-only game.
 */
export const getSystemPrompt = (): string => {
    return `你是中文桌游《AI 猜名人：历史人物版》里的 AI 玩家。你的目标是通过聪明的“是/否”问题缩小候选历史人物范围。你只能依据给定的人物文字资料判断，不能依赖外部知识、图片、声音或外貌信息。好的问题应尽量把候选人物分成两组，例如地区、时代、身份、领域、关键词或简介中的明确事实。`;
};

/**
 * Generates the prompt for the AI to create a strategic question and provide its own
 * analysis of the remaining figures in a single, consistent step.
 */
export const getAIQuestionAndAnalysisPrompt = (
    characters: Character[],
    retryReason?: string,
    lastFailedQuestion?: string,
): string => {
    const failedQuestionInstruction = lastFailedQuestion
        ? `上一次失败的问题是：“${lastFailedQuestion}”。不要再次提出这个问题，也不要提出只有轻微改写的版本。`
        : "";

    const retryInstruction = retryReason
        ? `
重要：上一次尝试失败。原因：${retryReason}
${failedQuestionInstruction}
请重新分析候选人物，选择一个能区分至少一位候选人物、且不会适用于所有人或所有人都不适用的问题。`
        : "";

    return `现在轮到你提问。

角色和已知信息：
- 你是 AI 玩家。
- 人类玩家秘密选择了候选列表中的一位历史人物。
- 你不知道人类玩家选的是谁。
- 下方候选列表就是你当前仍可能的答案。
- 你需要提出一个中文“是/否”问题，让人类玩家回答后，你可以排除一部分候选人物。

${retryInstruction}

候选人物（共 ${characters.length} 位）：
${formatFigureList(characters)}

任务步骤：
1. 只根据上面的人物资料分析，不要使用外部知识。
2. 从地区、时代、身份、关键词、简介中找一个明确的二分特征。
3. 选择最能接近平均切分候选人物的问题。
4. 问题必须是中文 yes/no 问题，例如“这个人物主要活跃在古代吗？”或“这个人物是科学家吗？”。
5. 除非只剩 1 位候选人物，否则不要直接问“是不是某某”。
6. 为每一位候选人物判断该问题的答案是否为“是”，并给出一句中文理由。
7. 如果某个判断无法从资料中确定，请不要选择这个问题，换一个更明确的问题。

输出要求：
你的完整回答必须是单个合法 JSON 对象，不要添加 Markdown 或额外解释。JSON 必须匹配：
{
  "question": "中文是/否问题",
  "analysis": [
    { "id": "候选人物 character_id", "name": "姓名", "has_feature": true, "reasoning": "中文理由" }
  ]
}
analysis 必须包含每一位候选人物，id 必须使用候选列表里的 character_id。`;
};

/**
 * Generates the prompt for the AI to answer a player's question with a simple boolean.
 */
export const getAnswerToPlayerQuestionPrompt = (character: Character, question: string): string => {
    return `你是中文桌游《AI 猜名人：历史人物版》里的 AI 玩家。现在人类玩家正在询问你的秘密历史人物。

你的秘密人物资料：
${formatFigure(character)}

人类玩家的问题：${question}

请只根据这段人物资料判断问题答案。你的完整输出必须是一个 JSON boolean：true 表示“是”，false 表示“否”。不要输出任何其他文字。`;
};
