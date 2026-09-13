import { type Character } from "./types";

export type Language = "en" | "zh";

export const languageOptions: { value: Language; label: string }[] = [
    { value: "en", label: "English" },
    { value: "zh", label: "中文" },
];

export const getLocalizedCharacter = (character: Character, language: Language): Character => {
    if (language === "zh") return character;

    return {
        ...character,
        name: character.name_en ?? character.name,
        region: character.region_en ?? character.region,
        era: character.era_en ?? character.era,
        roles: character.roles_en ?? character.roles,
        tags: character.tags_en ?? character.tags,
        summary: character.summary_en ?? character.summary,
    };
};

export const text = {
    en: {
        app: {
            title: "AI Guess Who: Historical Figures",
            subtitle:
                "Play a text-only historical-figure guessing game against local AI. Ask and answer yes/no questions.",
            errorNotInitialized: "Game did not initialize correctly.",
            restart: "Restart game",
            languageSelectorLabel: "Language",
            browserTitle: "AI Guess Who: Historical Figures",
        },
        layout: {
            sidePanelPlayer: "Your secret figure",
            sidePanelAi: "AI's secret figure",
            toggleHide: "Hide secret figures",
            toggleShow: "Show secret figures",
            boardAiTitle: "AI candidate list",
            boardPlayerTitle: "Your candidate list",
            boardAiHint: "AI eliminates candidates based on your answer.",
            boardPlayerHint: "Click a figure card to eliminate or restore it.",
        },
        setup: {
            title: "AI Guess Who: Historical Figures",
            subtitle: "Ask yes/no questions in English and guess the AI's historical figure.",
            statusReady: "Local AI model is ready.",
            statusPrepareModel: "Preparing the local AI model...",
            firstUseHint: "First use may take a little time.",
            statusDownloadPrompt: "Download local AI model",
            statusLoadingCards: "Loading figure profiles...",
            startButtonTitle: "Start game",
            startButtonDescription: "Randomly choose 5 historical figures from the non-Chinese pool.",
            optionsTitle: "Game options",
            reviewLabel: "Show AI analysis",
            reviewDescription:
                "See how AI evaluates each remaining figure before you answer. This adds one extra step but helps verify AI logic.",
        },
        gameMessages: {
            newGameStart: "Your secret figure is {{name}}. Start asking questions.",
            questionAck: "You can now eliminate candidates. Click \"End Turn\" when you are done.",
            parseFail: "Sorry, I did not parse that correctly. Please try again.",
            aiThinking: "AI is thinking...",
        },
        aiFlow: {
            systemEliminationAll: "AI would eliminate all remaining candidates, so this elimination is blocked.",
            systemNoElimination: "Based on your answer, no candidates were eliminated.",
            systemEliminated: "AI eliminated: {{names}}.",
            winPlayerNoCandidates: "AI had no candidates left. You win.",
            winAIWrongAllEliminated: "AI removed all candidates incorrectly. You win.",
            winAIWonWrongGuess: "AI guessed {{name}} correctly. You lose.",
            winPlayerWonFinal: "AI guessed your secret figure correctly: {{name}}.",
            winAILostFinal: "AI guessed {{name}} wrong, so you win.",
            winConflict: "The final guess does not match. Your secret figure is {{name}}. AI wins.",
            waitingForAnswerReview: "Here is the analysis of remaining candidates. Confirm to continue.",
            playerTurn: "Your turn to answer AI question.",
            aiFallback: "AI cannot think of a suitable question right now. Your turn to ask.",
            nonDiscriminatoryRetry:
                "The previous question is invalid because it can\'t filter any candidate. Ask a question that distinguishes at least one candidate.",
            errorAnswerFormat: "AI returned an invalid answer format.",
        },
        playerFlow: {
            wrongGuessCorrection: "You guessed wrong. AI's secret figure is {{name}}.",
            wrongGuess: "AI wins. The secret figure is {{name}}.",
            correctGuess: "You are correct, the AI\'s secret figure is {{name}}.",
            finalGuessYes: "Yes, the answer is {{name}}.",
            finalGuessNo: "No, the answer is not {{name}}.",
            wrongFinalPrompt: "Could it be {{name}}?",
        },
        chat: {
            processing: "Processing...",
            questionPlaceholder: "Type a question answerable by yes/no...",
            yourQuestionAria: "Your question",
            sendQuestionAria: "Send question",
            endTurn: "End turn",
            continueAnswering: "Continue",
            yes: "Yes",
            no: "No",
        },
        secretCard: {
            profileAria: "{{name}} profile",
            region: "Region",
            era: "Era",
            roles: "Roles",
            hiddenAria: "AI secret figure not revealed yet",
            hiddenTitle: "AI\'s secret figure",
        },
        characterCard: {
            match: "AI says this figure matches the question.",
            mismatch: "AI says this figure does not match the question.",
            eliminated: "Eliminated",
            cardStateActive: "candidate",
            cardStateEliminated: "eliminated",
        },
        prompts: {
            systemPrompt:
                "You are the AI player in a text-only game 'AI Guess Who: Historical Figures'. Your goal is to narrow down the opponent\'s historical figure by asking smart yes/no questions. Use only the supplied character text profiles, and never rely on appearance or external facts.",
            questionPrefix: "Now it is your turn to ask.",
            turnContextIntro: "Context",
            roleLine: "You are the AI player.",
            cluesContext:
                "- The human player secretly chose one figure from the candidate list.\n- They do not know your figure.\n- The list below is your current possible answers.",
            askInstruction: "- Ask one clear yes/no question in English based on the profiles.",
            splitInstruction: "- Ask a question that can split the remaining figures into two non-empty groups.",
            avoidDirectInstruction:
                '- Avoid direct final guesses unless only one figure remains, e.g. "Is it ...?"',
            responseRule:
                'Return one strict JSON object with schema: { "question":"...", "analysis":[{"id":"","name":"","has_feature":true/false,"reasoning":""}] }.',
            analysisIntroLine: "For each remaining candidate, decide whether the question holds and provide one reason.",
            answerQuestionHint: "Use only provided profiles; avoid unclear questions.",
            answerPromptIntro: "You are the AI player. The human is asking about your secret figure.",
            answerContext: "Your secret figure profile:",
            answerQuestionLine: "Human question",
            answerRule: "Return a JSON boolean only: true for yes, false for no.",
            responseRetryPrefix: "Important: last attempt failed.",
        },
        aiModel: {
            initializing: "Initializing local AI model...",
            ready: "Local AI model is ready.",
            downloadable: "Local AI model must be downloaded before starting.",
            unavailable: "Current browser does not support local Prompt API.",
            unavailableNoApi:
                "Current browser does not expose a local Prompt API. Use Chrome/Edge and enable AI features if needed.",
            errorInit: "Failed to initialize local AI.",
            downloading: "Downloading local AI model...",
            downloadingPercent: (percent: number) => `Downloading local AI model... ${percent}%`,
            notReadyForDownload: "Could not find a local AI model, cannot start download.",
            errorDownload: "Error downloading local AI model.",
            newSessionError: "Unable to start a new local AI game session.",
        },
        endGame: {
            playerWins: "You win",
            aiWins: "AI wins",
            playAgain: "Play again",
        },
    },
    zh: {
        app: {
            title: "AI 猜名人：历史人物版",
            subtitle: "使用本地 AI 与对手进行纯文字版猜名人游戏。用“是/否”问题缩小范围，猜出对方人物。",
            errorNotInitialized: "游戏没有正确初始化。",
            restart: "重新开始",
            languageSelectorLabel: "语言",
            browserTitle: "AI 猜名人：历史人物版",
        },
        layout: {
            sidePanelPlayer: "你的秘密人物",
            sidePanelAi: "AI 的秘密人物",
            toggleHide: "隐藏秘密人物",
            toggleShow: "显示秘密人物",
            boardAiTitle: "AI 的候选列表",
            boardPlayerTitle: "你的候选列表",
            boardAiHint: "AI 会根据你的回答排除自己的候选人物。",
            boardPlayerHint: "点击人物卡来排除或恢复候选。",
        },
        setup: {
            title: "AI 猜名人：历史人物版",
            subtitle: "用中文问题挑战本地 AI，猜出对方的历史人物。",
            statusReady: "本地 AI 模型已就绪",
            statusPrepareModel: "正在准备本地 AI 模型...",
            firstUseHint: "首次使用需要一些时间。",
            statusDownloadPrompt: "下载本地 AI 模型",
            statusLoadingCards: "正在加载人物资料...",
            startButtonTitle: "开始游戏",
            startButtonDescription: "从中外历史人物牌库中随机抽取 5 位候选人物。",
            optionsTitle: "游戏选项",
            reviewLabel: "显示 AI 分析过程",
            reviewDescription:
                "在回答 AI 的问题前查看它如何判断候选人物。这个选项会让流程多一步，但更容易检查 AI 是否推理正确。",
        },
        gameMessages: {
            newGameStart: "你的秘密人物是 {{name}}。开始提问吧。",
            questionAck: "你现在可以排除候选人物。完成后点击“结束回合”。",
            parseFail: "抱歉，我刚才没有回答好。请再试一次。",
            aiThinking: "AI 正在思考问题...",
        },
        aiFlow: {
            systemEliminationAll: "AI 的分析会排除所有候选人物，系统已阻止这次排除。",
            systemNoElimination: "根据这个回答，AI 没有排除任何人物。",
            systemEliminated: "AI 排除了：{{names}}。",
            winPlayerNoCandidates: "AI 已经没有可猜的候选人物了。",
            winAIWrongAllEliminated: "AI 错误排除了所有候选人物，你赢了。",
            winAIWonWrongGuess: "AI 猜测{{name}}错误，你赢了。",
            winPlayerWonFinal: "AI 正确猜出了你的秘密人物：{{name}}。",
            winAILostFinal: "AI 猜测{{name}}错误，你赢了。",
            winConflict: "最终猜测的回答不一致。你的秘密人物是{{name}}，本局判定 AI 获胜。",
            waitingForAnswerReview: "下面是 AI 对剩余候选人物的分析。检查后点击“继续回答”。",
            playerTurn: "轮到你回答 AI 的问题。",
            aiFallback: "AI 暂时想不出合适的问题。轮到你提问。",
            nonDiscriminatoryRetry: "上一个问题无效，因为它不能排除任何候选人物。你必须提出能区分候选人物的问题。",
            errorAnswerFormat: "AI 返回了无效的回答格式。",
        },
        playerFlow: {
            wrongGuessCorrection: "你猜错了。AI 的秘密人物是{{name}}。",
            wrongGuess: "AI 获胜：{{name}}。",
            correctGuess: "你正确猜出了 AI 的秘密人物：{{name}}。",
            finalGuessYes: "是，答案就是{{name}}。",
            finalGuessNo: "否，答案不是{{name}}。",
            wrongFinalPrompt: "你的秘密人物是{{name}}吗？",
        },
        chat: {
            processing: "处理中...",
            questionPlaceholder: "输入一个能用“是/否”回答的问题...",
            yourQuestionAria: "你的问题",
            sendQuestionAria: "发送问题",
            endTurn: "结束回合",
            continueAnswering: "继续回答",
            yes: "是",
            no: "否",
        },
        secretCard: {
            profileAria: "{{name}}人物资料",
            region: "地区",
            era: "时代",
            roles: "身份",
            hiddenAria: "AI 的秘密人物尚未揭晓",
            hiddenTitle: "AI 的秘密人物",
        },
        characterCard: {
            match: "AI 判断这个人物符合问题特征。",
            mismatch: "AI 判断这个人物不符合问题特征。",
            eliminated: "已排除",
            cardStateActive: "候选中。",
            cardStateEliminated: "已排除。",
        },
        prompts: {
            systemPrompt:
                "你是中文桌游《AI 猜名人：历史人物版》里的 AI 玩家。你的目标是通过聪明的“是/否”问题缩小候选历史人物范围。你只能依据给定的人物文字资料判断，不能依赖外部知识、图片、声音或外貌信息。",
            questionPrefix: "现在轮到你提问。",
            turnContextIntro: "角色和已知信息：",
            roleLine: "- 你是 AI 玩家。",
            cluesContext:
                "- 人类玩家秘密选择了候选列表中的一位历史人物。\n- 你不知道人类玩家选的是谁。\n- 下方候选列表就是你当前仍可能的答案。",
            askInstruction:
                "- 你需要提出一个中文“是/否”问题，让人类玩家回答后，你可以排除一部分候选人物。",
            splitInstruction: "- 从地区、时代、身份、关键词、简介中找一个明确的二分特征。",
            avoidDirectInstruction:
                '- 除非只剩 1 位候选人物，否则不要直接问“是不是某某”。',
            responseRule:
                "你的完整回答必须是单个合法 JSON 对象，不要添加 Markdown 或额外解释。JSON 必须匹配：\n{\"question\":\"中文是/否问题\",\"analysis\":[...] }。",
            analysisIntroLine: "为每一位候选人物判断该问题是否成立，并给出一句理由。",
            answerQuestionHint: "无法判断时请不要选这个问题，换一个更明确的问题。",
            answerPromptIntro: "你是中文桌游《AI 猜名人：历史人物版》里的 AI 玩家。现在人类玩家正在询问你的秘密历史人物。",
            answerContext: "你的秘密人物资料：",
            answerQuestionLine: "人类玩家的问题",
            answerRule: "你的完整输出必须是一个 JSON boolean：true 表示“是”，false 表示“否”。不要输出任何其他文字。",
            responseRetryPrefix: "重要：上一次尝试失败。",
        },
        aiModel: {
            initializing: "正在初始化本地 AI 模型...",
            ready: "本地 AI 模型已就绪",
            downloadable: "开始游戏前需要先下载本地 AI 模型。",
            unavailable: "当前浏览器不支持本地 Prompt API。",
            unavailableNoApi:
                "当前浏览器没有可用的本地 Prompt API。请使用支持该能力的 Chrome 或 Edge，并按需启用实验性 AI 功能。",
            errorInit: "初始化本地 AI 时发生错误。",
            downloading: "正在下载本地 AI 模型...",
            downloadingPercent: (percent: number) => `正在下载本地 AI 模型... ${percent}%`,
            notReadyForDownload: "没有找到本地 AI 模型，无法开始下载。",
            errorDownload: "下载本地 AI 模型时发生错误。",
            newSessionError: "无法启动新的本地 AI 游戏会话。",
        },
        endGame: {
            playerWins: "你赢了",
            aiWins: "AI 赢了",
            playAgain: "再玩一局",
        },
    },
} as const;

export const replaceTemplate = (template: string, values: Record<string, string>): string =>
    template.replace(/{{(\w+)}}/g, (_, key) => values[key] ?? "");

export const DEFAULT_LANGUAGE: Language = "en";
