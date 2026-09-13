import React, { useCallback, useState } from "react";
import * as builtInAIService from "../services/builtInAIService.ts";
import { GameState, type Character, type Message } from "../types";
import { getLocalizedCharacter, Language, replaceTemplate, text } from "../i18n";

const getFinalGuessRegex = (language: Language): RegExp => {
    return language === "zh"
        ? /^(?:你的秘密人物是|你猜的?是|你猜是|秘密人物是)(.+?)吗？?$/
        : /^(?:is\s+it|is\s+the|could\s+it\s+be|is\s+that)\s+(.+?)\??$/i;
};

type UsePlayerActionsProps = {
    isLoading: boolean;
    language: Language;
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
    isLoading,
    language,
    setIsLoading,
    addMessage,
    setGameState,
    setWinner,
    setWinReason,
    aiSecret,
    activeCharacters,
}: UsePlayerActionsProps) => {
    const [playerEliminatedChars, setPlayerEliminatedChars] = useState<Set<string>>(new Set());

    const localizedActiveCharacters = activeCharacters.map((char) => getLocalizedCharacter(char, language));

    const findGuessedCharacterName = useCallback(
        (question: string): string | null => {
            const normalizedQuestion = question.trim().toLowerCase();
            const regex = getFinalGuessRegex(language);
            const match = normalizedQuestion.match(regex);

            const matchedName = match?.[1]?.trim();
            if (matchedName) {
                const found = localizedActiveCharacters.find((char) =>
                    normalizedQuestion.includes(char.name.toLowerCase()),
                );
                if (found) return found.name;
            }

            return null;
        },
        [language, localizedActiveCharacters],
    );

    const handlePlayerQuestion = useCallback(
        async (question: string) => {
            if (!question || !aiSecret) return;
            setIsLoading(true);
            addMessage({ sender: "PLAYER", text: question });

            const handleAsNormalQuestion = async () => {
                try {
                    const answer = await builtInAIService.getAnswerToPlayerQuestion(
                        aiSecret,
                        question,
                        language,
                    );
                    addMessage({ sender: "AI", text: answer });
                    addMessage({
                        sender: "SYSTEM",
                        text: text[language].gameMessages.questionAck,
                    });
                    setGameState(GameState.PLAYER_TURN_ELIMINATING);
                } catch (error) {
                    console.error(error);
                    addMessage({ sender: "SYSTEM", text: text[language].gameMessages.parseFail });
                }
            };

            const guessedName = findGuessedCharacterName(question);
            const localizedAiSecret = aiSecret ? getLocalizedCharacter(aiSecret, language) : null;

            if (guessedName && localizedAiSecret) {
                const isActualGuess = localizedActiveCharacters.some((char) => char.name.toLowerCase() === guessedName.toLowerCase());

                if (isActualGuess) {
                    if (guessedName.toLowerCase() === localizedAiSecret.name.toLowerCase()) {
                        addMessage({ sender: "AI", text: replaceTemplate(text[language].playerFlow.finalGuessYes, { name: localizedAiSecret.name }) });
                        setWinner("PLAYER");
                        setWinReason(replaceTemplate(text[language].playerFlow.correctGuess, { name: localizedAiSecret.name }));
                        setGameState(GameState.GAME_OVER);
                    } else {
                        addMessage({
                            sender: "AI",
                            text: replaceTemplate(text[language].playerFlow.finalGuessNo, { name: guessedName }),
                        });
                        addMessage({
                            sender: "SYSTEM",
                            text: replaceTemplate(text[language].playerFlow.wrongGuessCorrection, {
                                name: localizedAiSecret.name,
                            }),
                        });
                        setWinner("AI");
                        setWinReason(replaceTemplate(text[language].playerFlow.wrongGuess, { name: localizedAiSecret.name }));
                    }
                } else {
                    await handleAsNormalQuestion();
                }
            } else {
                await handleAsNormalQuestion();
            }
            setIsLoading(false);
        },
        [aiSecret, localizedActiveCharacters, setIsLoading, addMessage, setGameState, setWinner, setWinReason, language, findGuessedCharacterName],
    );

    const handleEndTurn = useCallback(() => {
        addMessage({ sender: "SYSTEM", text: text[language].gameMessages.aiThinking });
        setGameState(GameState.AI_TURN);
    }, [addMessage, setGameState, language]);

    return {
        playerEliminatedChars,
        setPlayerEliminatedChars,
        handlePlayerQuestion,
        handleEndTurn,
    };
};
