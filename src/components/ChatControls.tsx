import React, { useEffect, useRef, useState } from "react";
import { GameState, type Message } from "../types";
import { text } from "../i18n";
import styles from "./ChatControls.module.css";
import { SendIcon } from "./icons";

export type ChatControlsProps = {
    /** The list of messages to display in the chat log. */
    messages: Message[];
    /** The current state of the game. */
    gameState: GameState;
    /** A boolean indicating if an operation is in progress. */
    isLoading: boolean;
    /** Callback for when the player submits a question. */
    onPlayerQuestion: (question: string) => void;
    /** Callback for when the player ends their turn. */
    onEndTurn: () => void;
    /** Callback for when the player answers the AI's question. */
    onPlayerAnswer: (answer: "yes" | "no") => void;
    /** Callback for when the player confirms they have reviewed the AI analysis. */
    onConfirmAIAnalysis: () => void;
    chatText: (typeof text)["en"]["chat"];
};

/**
 * A component that handles the chat interface, including message display,
 * text input, and action buttons.
 */
function ChatControls({
    messages,
    gameState,
    isLoading,
    onPlayerQuestion,
    onEndTurn,
    onPlayerAnswer,
    onConfirmAIAnalysis,
    chatText,
}: ChatControlsProps) {
    const [inputValue, setInputValue] = useState("");
    const chatLogRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to the latest message
    useEffect(() => {
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && !isLoading) {
            onPlayerQuestion(inputValue);
            setInputValue("");
        }
    };

    const renderMessage = (msg: Message, index: number) => {
        let messageStyle;
        switch (msg.sender) {
            case "PLAYER":
                messageStyle = styles.playerMessage;
                break;
            case "AI":
                messageStyle = styles.aiMessage;
                break;
            case "SYSTEM":
            default:
                messageStyle = styles.systemMessage;
                break;
        }
        return (
            <div key={index} className={`${styles.message} ${messageStyle}`}>
                {msg.text}
            </div>
        );
    };

    const showInputForm = gameState === GameState.PLAYER_TURN_ASKING;
    const showEndTurnButton = gameState === GameState.PLAYER_TURN_ELIMINATING;
    const showConfirmAnalysisButton = gameState === GameState.PLAYER_REVIEWING_AI_ANALYSIS;
    const showAnswerButtons = gameState === GameState.AI_TURN_WAITING_FOR_ANSWER;

    return (
        <div className={styles.controlsContainer}>
            <div ref={chatLogRef} className={styles.chatLog} aria-live="polite">
                {messages.map(renderMessage)}
                {isLoading && (
                    <div className={`${styles.message} ${styles.systemMessage} ${styles.loadingMessage}`}>
                        {chatText.processing}
                    </div>
                )}
            </div>

            <div className={styles.actionsContainer}>
                {showInputForm && (
                    <form onSubmit={handleSubmit} className={styles.inputForm}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={chatText.questionPlaceholder}
                            className={styles.textInput}
                            disabled={isLoading}
                            aria-label={chatText.yourQuestionAria}
                        />
                        <button
                            type="submit"
                            className={`${styles.iconButton} ${styles.sendButton}`}
                            disabled={isLoading || !inputValue}
                            aria-label={chatText.sendQuestionAria}
                        >
                            <SendIcon />
                        </button>
                    </form>
                )}

                {showEndTurnButton && (
                    <button
                        onClick={onEndTurn}
                        className={`${styles.actionButton} ${styles.endTurnButton}`}
                        disabled={isLoading}
                    >
                        {chatText.endTurn}
                    </button>
                )}

                {showConfirmAnalysisButton && (
                    <button
                        onClick={onConfirmAIAnalysis}
                        className={`${styles.actionButton} ${styles.continueButton}`}
                        disabled={isLoading}
                    >
                        {chatText.continueAnswering}
                    </button>
                )}

                {showAnswerButtons && (
                    <div className={styles.answerButtons}>
                        <button
                            onClick={() => onPlayerAnswer("yes")}
                            className={`${styles.actionButton} ${styles.yesButton}`}
                            disabled={isLoading}
                        >
                            {chatText.yes}
                        </button>
                        <button
                            onClick={() => onPlayerAnswer("no")}
                            className={`${styles.actionButton} ${styles.noButton}`}
                            disabled={isLoading}
                        >
                            {chatText.no}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatControls;
