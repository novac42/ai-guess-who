import { type Character } from "../types";
import { getLocalizedCharacter, Language, text } from "../i18n";

const listJoiner = (language: Language): string => (language === "zh" ? "、" : ", ");
const itemSeparator = (language: Language): string => (language === "zh" ? "｜" : " | ");

const formatFigure = (character: Character, language: Language): string => {
    const localized = getLocalizedCharacter(character, language);
    const sep = itemSeparator(language);
    const joiner = listJoiner(language);

    return [
        localized.name,
        localized.region,
        localized.era,
        localized.roles.join(joiner),
        localized.tags.join(joiner),
        localized.summary,
    ].join(sep);
};

export const getSystemPromptByLanguage = (language: Language): string => {
    return text[language].prompts.systemPrompt;
};

export const getSystemPrompt = (language: Language): string => {
    return getSystemPromptByLanguage(language);
};

const toLanguage = (language: Language, englishText: string, chineseText: string): string => {
    return language === "zh" ? chineseText : englishText;
};

const buildCandidateList = (characters: Character[], language: Language): string => {
    return characters
        .map((character, index) => {
            const localized = getLocalizedCharacter(character, language);
            return `${index + 1}. ${localized.character_id}${itemSeparator(language)} ${formatFigure(localized, language)}`;
        })
        .join("\n");
};

/**
 * Generates the prompt for the AI to create a strategic question and provide its own
 * analysis of the remaining figures in a single, consistent step.
 */
export const getAIQuestionAndAnalysisPrompt = (
    characters: Character[],
    language: Language,
    retryReason?: string,
    lastFailedQuestion?: string,
): string => {
    const prompt = text[language].prompts;
    const chars = buildCandidateList(characters, language);

    const retryInstruction = retryReason
        ? `
${prompt.responseRetryPrefix}
${toLanguage(language, `Reason: ${retryReason}`, `原因：${retryReason}`)}
${lastFailedQuestion ? toLanguage(language, `Do not repeat: "${lastFailedQuestion}"`, `请不要重复问题：${lastFailedQuestion}`) : ""}
`
        : "";

    return `${prompt.questionPrefix}

${prompt.turnContextIntro}
${prompt.roleLine}
${prompt.cluesContext}
${prompt.askInstruction}
${retryInstruction}

${toLanguage(language, `Candidates (total ${characters.length}):`, `候选人物（共 ${characters.length} 位）：`)}
${chars}

1. ${prompt.analysisIntroLine}
2. ${toLanguage(language, "Ask a question that can split candidates into two groups.", "提出一个能把候选人物分成两组的问题。")}
3. ${prompt.splitInstruction}
4. ${prompt.avoidDirectInstruction}
5. ${toLanguage(language, "Do not ask questions that are too vague to answer from profiles.", "不提无法从资料判断的问题。")}

${prompt.responseRule}
${prompt.answerQuestionHint}
${toLanguage(
    language,
    "analysis must include every remaining character and use character_id for id.",
    "analysis 必须包含每位候选人物并使用 character_id 作为 id。",
)}
`;
};

/**
 * Generates the prompt for the AI to answer a player's question with a simple boolean.
 */
export const getAnswerToPlayerQuestionPrompt = (
    character: Character,
    question: string,
    language: Language,
): string => {
    const localized = getLocalizedCharacter(character, language);
    const prompt = text[language].prompts;

    return `${prompt.answerPromptIntro}

${prompt.answerContext}
${formatFigure(localized, language)}

${prompt.answerQuestionLine}：${question}

${prompt.answerRule}
`;
};
