import React, { useCallback, useEffect, useState } from "react";
import * as builtInAIService from "../services/builtInAIService.ts";
import { GameState, type Character, type EliminationAnalysisResult, type Message } from "../types";

const FINAL_GUESS_REGEX = /你的秘密人物是(.+?)吗？?$/;

type UseAIActionsProps = {
    gameState: GameState;
    messages: Message[];
    playerSecret: Character | null;
    isReviewModeEnabled: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    addMessage: (message: Message) => void;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    setWinner: React.Dispatch<React.SetStateAction<"PLAYER" | "AI" | null>>;
    setWinReason: React.Dispatch<React.SetStateAction<string>>;
};

/**
 * Manages all state and logic related to the AI's turn and its interactions.
 */
export const useAIActions = ({
    gameState,
    messages,
    playerSecret,
    isReviewModeEnabled,
    setIsLoading,
    addMessage,
    setGameState,
    setWinner,
    setWinReason,
}: UseAIActionsProps) => {
    const [aiRemainingChars, setAiRemainingChars] = useState<Character[]>([]);
    const [lastAIQuestion, setLastAIQuestion] = useState<string>("");
    const [lastAIAnalysis, setLastAIAnalysis] = useState<EliminationAnalysisResult[]>([]);
    const [isAIFinalGuess, setIsAIFinalGuess] = useState(false);

    // Effect to handle the AI's turn logic
    useEffect(() => {
        const handleAITurn = async () => {
            if (gameState !== GameState.AI_TURN) return;
            setIsLoading(true);
            setIsAIFinalGuess(false);

            if (aiRemainingChars.length === 1) {
                const guess = `你的秘密人物是${aiRemainingChars[0].name}吗？`;
                setLastAIQuestion(guess);
                setIsAIFinalGuess(true);
                addMessage({ sender: "AI", text: guess });
                setGameState(GameState.AI_TURN_WAITING_FOR_ANSWER);
                setIsLoading(false);
                return;
            }

            if (aiRemainingChars.length === 0) {
                setWinner("PLAYER");
                setWinReason("AI 已经没有可猜的候选人物了。");
                setGameState(GameState.GAME_OVER);
                setIsLoading(false);
                return;
            }

            const MAX_AI_RETRIES = 3;
            let retryReason: string | undefined = undefined;
            let lastFailedQuestion: string | undefined = undefined;

            for (let attempt = 1; attempt <= MAX_AI_RETRIES; attempt++) {
                try {
                    const { question, analysis } = await builtInAIService.getAIQuestionAndAnalysis(
                        aiRemainingChars,
                        messages,
                        retryReason,
                        lastFailedQuestion,
                    );

                    const positiveFeatures = analysis.filter((res) => res.has_feature).length;
                    if (positiveFeatures === 0 || positiveFeatures === analysis.length) {
                        retryReason =
                            "上一个问题无效，因为它不能排除任何候选人物。你必须提出能区分候选人物的问题。";
                        lastFailedQuestion = question;
                        throw new Error("AI generated a non-discriminatory question.");
                    }

                    setLastAIQuestion(question);
                    setLastAIAnalysis(analysis);

                    addMessage({ sender: "AI", text: question });
                    if (isReviewModeEnabled) {
                        addMessage({
                            sender: "SYSTEM",
                            text: "下面是 AI 对剩余候选人物的分析。检查后点击“继续回答”。",
                        });
                        setGameState(GameState.PLAYER_REVIEWING_AI_ANALYSIS);
                    } else {
                        addMessage({ sender: "SYSTEM", text: "轮到你回答 AI 的问题。" });
                        setGameState(GameState.AI_TURN_WAITING_FOR_ANSWER);
                    }

                    setIsLoading(false);
                    return;
                } catch (error) {
                    console.warn(`AI question generation attempt ${attempt} failed:`, error);
                    if (error instanceof Error && error.message !== "AI generated a non-discriminatory question.") {
                        retryReason = `The last attempt failed with an error: ${error.message}. Please try generating a completely different question.`;
                    }
                    if (attempt === MAX_AI_RETRIES) {
                        console.error("AI failed to generate a valid question after multiple retries.");
                        addMessage({ sender: "SYSTEM", text: "AI 暂时想不出合适的问题。轮到你提问。" });
                        setGameState(GameState.PLAYER_TURN_ASKING);
                        setIsLoading(false);
                        return;
                    }
                }
            }
        };
        handleAITurn();
    }, [
        gameState,
        aiRemainingChars,
        messages,
        isReviewModeEnabled,
        setIsLoading,
        addMessage,
        setGameState,
        setWinner,
        setWinReason,
    ]);

    const handleConfirmAIAnalysis = useCallback(() => {
        setGameState(GameState.AI_TURN_WAITING_FOR_ANSWER);
    }, [setGameState]);

    const handlePlayerAnswer = useCallback(
        async (answer: "Yes" | "No") => {
            if (!lastAIQuestion || !playerSecret) return;
            setIsLoading(true);
            addMessage({ sender: "PLAYER", text: answer === "Yes" ? "是" : "否" });

            if (isAIFinalGuess) {
                const guessMatch = lastAIQuestion.trim().match(FINAL_GUESS_REGEX);
                const guessedName = guessMatch ? guessMatch[1].trim() : "";
                if (guessedName) {
                    const isCorrectGuess = guessedName.toLowerCase() === playerSecret.name.toLowerCase();
                    if (isCorrectGuess && answer === "Yes") {
                        setWinner("AI");
                        setWinReason(`AI 正确猜出了你的秘密人物：${playerSecret?.name}。`);
                    } else if (!isCorrectGuess && answer === "No") {
                        setWinner("PLAYER");
                        setWinReason(`AI 猜测${guessedName}错误，你赢了。`);
                    } else {
                        setWinner("AI");
                        setWinReason(`最终猜测的回答不一致。你的秘密人物是${playerSecret?.name}，本局判定 AI 获胜。`);
                    }
                    setGameState(GameState.GAME_OVER);
                    setIsLoading(false);
                    return;
                }
            }

            await new Promise((resolve) => setTimeout(resolve, 500));
            const eliminatedIds = new Set<string>();
            if (answer === "Yes") {
                lastAIAnalysis.forEach((char) => {
                    if (!char.has_feature) eliminatedIds.add(char.id);
                });
            } else {
                lastAIAnalysis.forEach((char) => {
                    if (char.has_feature) eliminatedIds.add(char.id);
                });
            }

            if (eliminatedIds.size === aiRemainingChars.length && aiRemainingChars.length > 0) {
                console.warn("AI logic would have eliminated all characters. Preventing this action.");
                addMessage({
                    sender: "SYSTEM",
                    text: "AI 的分析会排除所有候选人物，系统已阻止这次排除。",
                });
            } else {
                const eliminatedNames = aiRemainingChars
                    .filter((c) => eliminatedIds.has(c.character_id))
                    .map((c) => c.name)
                    .join(", ");
                if (eliminatedNames) {
                    addMessage({ sender: "SYSTEM", text: `AI 排除了：${eliminatedNames}。` });
                } else {
                    addMessage({ sender: "SYSTEM", text: `根据这个回答，AI 没有排除任何人物。` });
                }

                const newRemainingChars = aiRemainingChars.filter((c) => !eliminatedIds.has(c.character_id));
                setAiRemainingChars(newRemainingChars);

                if (newRemainingChars.length === 0) {
                    setWinner("PLAYER");
                    setWinReason(`AI 错误排除了所有候选人物，你赢了。`);
                    setGameState(GameState.GAME_OVER);
                    setIsLoading(false);
                    return;
                }
            }

            setGameState(GameState.PLAYER_TURN_ASKING);
            setIsLoading(false);
        },
        [
            lastAIQuestion,
            playerSecret,
            aiRemainingChars,
            isAIFinalGuess,
            lastAIAnalysis,
            setIsLoading,
            addMessage,
            setGameState,
            setWinner,
            setWinReason,
        ],
    );

    return {
        aiRemainingChars,
        setAiRemainingChars,
        lastAIAnalysis,
        setLastAIAnalysis,
        setIsAIFinalGuess,
        handlePlayerAnswer,
        handleConfirmAIAnalysis,
    };
};
