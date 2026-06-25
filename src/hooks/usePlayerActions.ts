import React, { useCallback, useState } from "react";
import * as builtInAIService from "../services/builtInAIService.ts";
import { GameState, type Character, type Message } from "../types";

const ENGLISH_FINAL_GUESS_REGEX = /^(?:is it|is the person|is the character|is your? character)\s+(.*?)\??$/i;

const findGuessedCharacterName = (question: string, activeCharacters: Character[]): string | null => {
    const normalizedQuestion = question.trim().toLowerCase();
    const englishMatch = normalizedQuestion.match(ENGLISH_FINAL_GUESS_REGEX);
    if (englishMatch) return englishMatch[1].trim();

    const includesGuessCue =
        normalizedQuestion.startsWith("是") ||
        normalizedQuestion.includes("秘密人物") ||
        normalizedQuestion.includes("吗") ||
        normalizedQuestion.includes("？");

    if (!includesGuessCue) return null;

    const match = activeCharacters.find((char) => normalizedQuestion.includes(char.name.toLowerCase()));
    return match?.name ?? null;
};

type UsePlayerActionsProps = {
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    addMessage: (message: Message) => void;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    setWinner: React.Dispatch<React.SetStateAction<"PLAYER" | "AI" | null>>;
    setWinReason: React.Dispatch<React.SetStateAction<string>>;
    aiSecret: Character | null;
    activeCharacters: Character[];
};

/**
 * Manages all state and logic related to the player's turn.
 */
export const usePlayerActions = ({
    setIsLoading,
    addMessage,
    setGameState,
    setWinner,
    setWinReason,
    aiSecret,
    activeCharacters,
}: UsePlayerActionsProps) => {
    const [playerEliminatedChars, setPlayerEliminatedChars] = useState<Set<string>>(new Set());

    const handlePlayerQuestion = useCallback(
        async (question: string) => {
            if (!question || !aiSecret) return;
            setIsLoading(true);
            addMessage({ sender: "PLAYER", text: question });

            const handleAsNormalQuestion = async () => {
                try {
                    const answer = await builtInAIService.getAnswerToPlayerQuestion(aiSecret, question);
                    addMessage({ sender: "AI", text: answer });
                    addMessage({
                        sender: "SYSTEM",
                        text: `你现在可以排除候选人物。完成后点击“结束回合”。`,
                    });
                    setGameState(GameState.PLAYER_TURN_ELIMINATING);
                } catch (error) {
                    console.error(error);
                    addMessage({ sender: "SYSTEM", text: "抱歉，我刚才没有回答好。请再试一次。" });
                }
            };

            const guessedName = findGuessedCharacterName(question, activeCharacters);

            if (guessedName) {
                const isActualGuess = activeCharacters.some(
                    (char) => char.name.toLowerCase() === guessedName.toLowerCase(),
                );

                if (isActualGuess) {
                    if (guessedName.toLowerCase() === aiSecret.name.toLowerCase()) {
                        addMessage({ sender: "AI", text: `是，答案就是${aiSecret.name}。` });
                        setWinner("PLAYER");
                        setWinReason(`你正确猜出了 AI 的秘密人物：${aiSecret.name}。`);
                        setGameState(GameState.GAME_OVER);
                    } else {
                        addMessage({ sender: "AI", text: `否，答案不是${guessedName}。` });
                        addMessage({
                            sender: "SYSTEM",
                            text: `你猜错了。AI 的秘密人物是${aiSecret.name}。`,
                        });
                        setWinner("AI");
                        setWinReason(`你猜错了。AI 的秘密人物是${aiSecret.name}。`);
                        setGameState(GameState.GAME_OVER);
                    }
                } else {
                    await handleAsNormalQuestion();
                }
            } else {
                await handleAsNormalQuestion();
            }
            setIsLoading(false);
        },
        [aiSecret, activeCharacters, setIsLoading, addMessage, setGameState, setWinner, setWinReason],
    );

    const handleEndTurn = useCallback(() => {
        addMessage({ sender: "SYSTEM", text: "AI 正在思考问题..." });
        setGameState(GameState.AI_TURN);
    }, [addMessage, setGameState]);

    return {
        playerEliminatedChars,
        setPlayerEliminatedChars,
        handlePlayerQuestion,
        handleEndTurn,
    };
};
