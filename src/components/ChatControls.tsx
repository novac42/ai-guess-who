import React, { useEffect, useRef, useState } from "react";
import { GameState, type Message } from "../types";
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
    onPlayerAnswer: (answer: "Yes" | "No") => void;
    /** Callback for when the player confirms they have reviewed the AI analysis. */
    onConfirmAIAnalysis: () => void;
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
                        处理中...
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
                            placeholder="输入一个能用“是/否”回答的问题..."
                            className={styles.textInput}
                            disabled={isLoading}
                            aria-label="你的问题"
                        />
                        <button
                            type="submit"
                            className={`${styles.iconButton} ${styles.sendButton}`}
                            disabled={isLoading || !inputValue}
                            aria-label="发送问题"
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
                        结束回合
                    </button>
                )}

                {showConfirmAnalysisButton && (
                    <button
                        onClick={onConfirmAIAnalysis}
                        className={`${styles.actionButton} ${styles.continueButton}`}
                        disabled={isLoading}
                    >
                        继续回答
                    </button>
                )}

                {showAnswerButtons && (
                    <div className={styles.answerButtons}>
                        <button
                            onClick={() => onPlayerAnswer("Yes")}
                            className={`${styles.actionButton} ${styles.yesButton}`}
                            disabled={isLoading}
                        >
                            是
                        </button>
                        <button
                            onClick={() => onPlayerAnswer("No")}
                            className={`${styles.actionButton} ${styles.noButton}`}
                            disabled={isLoading}
                        >
                            否
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatControls;
