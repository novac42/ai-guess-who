import { useMemo } from "react";
import { type Character, type EliminationAnalysisResult } from "../types";
import { text } from "../i18n";
import CharacterCard from "./CharacterCard";
import styles from "./GameBoard.module.css";

export type GameBoardProps = {
    /** The full list of characters to display on the board. */
    characters: Character[];
    /** A set of IDs for characters that should be shown as eliminated. */
    eliminatedChars: Set<string>;
    /** A callback function for when a character card is clicked. */
    onCardClick?: (id: string) => void;
    /** The AI's analysis of the characters for the current question. */
    analysis?: EliminationAnalysisResult[];
    /** Labels for the character card. */
    cardText: (typeof text)["en"]["characterCard"];
};

/**
 * Renders a grid of CharacterCard components for the game board.
 */
function GameBoard({ characters, eliminatedChars, onCardClick = () => {}, analysis, cardText }: GameBoardProps) {
    const analysisMap = useMemo(() => {
        if (!analysis) return null;
        const map = new Map<string, boolean>();
        for (const result of analysis) {
            map.set(result.id, result.has_feature);
        }
        return map;
    }, [analysis]);

    return (
        <div className={styles.boardContainer}>
            <div className={styles.boardGrid}>
                {characters.map((char) => (
                    <CharacterCard
                        key={char.character_id}
                        character={char}
                        isEliminated={eliminatedChars.has(char.character_id)}
                        onClick={onCardClick}
                        analysisResult={analysisMap ? (analysisMap.get(char.character_id) ?? null) : null}
                        text={cardText}
                    />
                ))}
            </div>
        </div>
    );
}

export default GameBoard;
