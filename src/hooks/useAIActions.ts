import React, { useCallback, useEffect, useState } from "react";
import * as builtInAIService from "../services/builtInAIService.ts";
import { type Character, type EliminationAnalysisResult, type Message, type GameState } from "../types";
import { getLocalizedCharacter, Language, replaceTemplate, text } from "../i18n";

const getFinalGuessRegex = (language: Language): RegExp => {
    return language === "zh"
        ? /你的秘密人物是(.+?)吗？?$/
        : /^(?:is\s+it|could\s+it\s+be|is\s+that|is\s+the|is\s+your)\\s+(.+?)\??$/i;
};

type UseAIActionsProps = {
    gameState: GameState;
    messages: Message[];
    playerSecret: Character | null;
    isReviewModeEnabled: boolean;
    language: Language;
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
    language,
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
    const finalGuessRegex = getFinalGuessRegex(language);

    const getDisplayName = useCallback(
        (character: Character) => getLocalizedCharacter(character, language).name,
        [language],
    );

    // Effect to handle the AI's turn logic
    useEffect(() => {
        const handleAITurn = async () => {
            if (gameState !== GameState.AI_TURN) return;
            setIsLoading(true);
            setIsAIFinalGuess(false);

            if (aiRemainingChars.length === 1) {
                const guess = replaceTemplate(text[language].playerFlow.wrongFinalPrompt, {
                    name: getDisplayName(aiRemainingChars[0]),
                });
                setLastAIQuestion(guess);
                setIsAIFinalGuess(true);
                addMessage({ sender: "AI", text: guess });
                setGameState(GameState.AI_TURN_WAITING_FOR_ANSWER);
                setIsLoading(false);
                return;
            }

            if (aiRemainingChars.length === 0) {
                setWinner("PLAYER");
                setWinReason(text[language].aiFlow.winPlayerNoCandidates);
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
                        language,
                        retryReason,
                        lastFailedQuestion,
                    );

                    const positiveFeatures = analysis.filter((res) => res.has_feature).length;
                    if (positiveFeatures === 0 || positiveFeatures === analysis.length) {
                        retryReason = text[language].aiFlow.nonDiscriminatoryRetry;
                        lastFailedQuestion = question;
                        throw new Error("AI generated a non-discriminatory question.");
                    }

                    setLastAIQuestion(question);
                    setLastAIAnalysis(analysis);

                    addMessage({ sender: "AI", text: question });
                    if (isReviewModeEnabled) {
                        addMessage({
                            sender: "SYSTEM",
                            text: text[language].aiFlow.waitingForAnswerReview,
                        });
                        setGameState(GameState.PLAYER_REVIEWING_AI_ANALYSIS);
                    } else {
                        addMessage({
                            sender: "SYSTEM",
                            text: text[language].aiFlow.playerTurn,
                        });
                        setGameState(GameState.AI_TURN_WAITING_FOR_ANSWER);
                    }

                    setIsLoading(false);
                    return;
                } catch (error) {
                    console.warn(`AI question generation attempt ${attempt} failed:`, error);
                    if (error instanceof Error && error.message !== "AI generated a non-discriminatory question.") {
                        retryReason = `${text[language].aiFlow.playerTurn} ${error.message}`;
                    }
                    if (attempt === MAX_AI_RETRIES) {
                        console.error("AI failed to generate a valid question after multiple retries.");
                        addMessage({ sender: "SYSTEM", text: text[language].aiFlow.aiFallback });
                        setGameState(GameState.PLAYER_TURN_ASKING);
                        setIsLoading(false);
                        return;
                    }
                }
            }
        };
        void handleAITurn();
    }, [
        gameState,
        aiRemainingChars,
        messages,
        isReviewModeEnabled,
        language,
        setIsLoading,
        addMessage,
        setGameState,
        setWinner,
        setWinReason,
        getDisplayName,
    ]);

    const handleConfirmAIAnalysis = useCallback(() => {
        setGameState(GameState.AI_TURN_WAITING_FOR_ANSWER);
    }, [setGameState]);

    const handlePlayerAnswer = useCallback(
        async (answer: "yes" | "no") => {
            if (!lastAIQuestion || !playerSecret) return;
            setIsLoading(true);
            const normalizedAnswerText = answer === "yes" ? text[language].chat.yes : text[language].chat.no;
            addMessage({ sender: "PLAYER", text: normalizedAnswerText });

            if (isAIFinalGuess) {
                const guessMatch = lastAIQuestion.trim().match(finalGuessRegex);
                const guessedName = guessMatch ? guessMatch[1].trim() : "";
                if (guessedName) {
                    const normalizedGuessedName = guessedName.toLowerCase();
                    const playerName = getDisplayName(playerSecret).toLowerCase();
                    const matches = normalizedGuessedName === playerName;
                    if (matches && answer === "yes") {
                        setWinner("AI");
                        setWinReason(
                            replaceTemplate(text[language].aiFlow.winPlayerWonFinal, {
                                name: getDisplayName(playerSecret),
                            }),
                        );
                    } else if (!matches && answer === "no") {
                        setWinner("PLAYER");
                        setWinReason(replaceTemplate(text[language].aiFlow.winAILostFinal, {
                            name: guessedName,
                        }));
                    } else {
                        setWinner("AI");
                        setWinReason(
                            replaceTemplate(text[language].aiFlow.winConflict, {
                                name: getDisplayName(playerSecret),
                            }),
                        );
                    }
                    setGameState(GameState.GAME_OVER);
                    setIsLoading(false);
                    return;
                }
            }

            await new Promise((resolve) => setTimeout(resolve, 500));
            const eliminatedIds = new Set<string>();
            const listJoiner = language === "zh" ? "、" : ", ";
            const isYesAnswer = answer === "yes";

            if (isYesAnswer) {
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
                    text: text[language].aiFlow.systemEliminationAll,
                });
            } else {
                const eliminatedNames = aiRemainingChars
                    .filter((c) => eliminatedIds.has(c.character_id))
                    .map((char) => getDisplayName(char))
                    .join(listJoiner);
                if (eliminatedNames) {
                    addMessage({
                        sender: "SYSTEM",
                        text: replaceTemplate(text[language].aiFlow.systemEliminated, {
                            names: eliminatedNames,
                        }),
                    });
                } else {
                    addMessage({ sender: "SYSTEM", text: text[language].aiFlow.systemNoElimination });
                }

                const newRemainingChars = aiRemainingChars.filter((c) => !eliminatedIds.has(c.character_id));
                setAiRemainingChars(newRemainingChars);

                if (newRemainingChars.length === 0) {
                    setWinner("PLAYER");
                    setWinReason(text[language].aiFlow.winAIWrongAllEliminated);
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
            language,
            getDisplayName,
            finalGuessRegex,
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
