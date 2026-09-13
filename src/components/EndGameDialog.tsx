import { type ComponentPropsWithoutRef } from "react";
import { type GameWinner } from "../types";
import { text } from "../i18n";
import styles from "./EndGameDialog.module.css";

export type EndGameDialogProps = ComponentPropsWithoutRef<"div"> & {
    /** The winner of the game. If null, the dialog is not rendered. */
    winner: GameWinner;
    /** The reason why the game ended. */
    reason: string;
    /** Callback function to start a new game. */
    onPlayAgain: () => void;
    /** Labels for end-game copy. */
    text: (typeof text)["en"]["endGame"];
};

/**
 * A modal dialog that appears at the end of the game to announce the winner.
 */
function EndGameDialog({ winner, reason, onPlayAgain, text: endGameText, className, ...props }: EndGameDialogProps) {
    if (!winner) return null;

    const isPlayerWin = winner === "PLAYER";
    const title = isPlayerWin ? endGameText.playerWins : endGameText.aiWins;
    const titleClass = isPlayerWin ? styles.winTitle : styles.loseTitle;

    return (
        <div
            className={`${styles.overlay} ${className || ""}`}
            role="dialog"
            aria-labelledby="end-game-title"
            aria-modal="true"
            {...props}
        >
            <div className={styles.dialog}>
                <h2 id="end-game-title" className={`${styles.title} ${titleClass}`}>
                    {title}
                </h2>
                <p className={styles.reason}>{reason}</p>
                <button onClick={onPlayAgain} className={styles.playAgainButton}>
                    {endGameText.playAgain}
                </button>
            </div>
        </div>
    );
}

export default EndGameDialog;
