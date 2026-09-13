import React, { type ComponentPropsWithoutRef, useCallback } from "react";
import { type Character } from "../types";
import { text } from "../i18n";
import styles from "./CharacterCard.module.css";
import { CheckIcon, XIcon } from "./icons";

export type CharacterCardProps = Omit<ComponentPropsWithoutRef<"div">, "onClick"> & {
    /** The character data to display. */
    character: Character;
    /** Whether the card is flipped over (eliminated). */
    isEliminated: boolean;
    /** Callback function when the card is clicked. */
    onClick: (id: string) => void;
    /** The result of the AI's analysis for this card (true/false). */
    analysisResult?: boolean | null;
    /** Labels for AI match states. */
    text: (typeof text)["en"]["characterCard"];
};

/**
 * A candidate card that keeps board scanning focused on the figure name.
 */
function CharacterCard({ character, isEliminated, onClick, analysisResult, text: cardText, className, ...props }: CharacterCardProps) {
    const containerClasses = `${styles.card} ${isEliminated ? styles.isEliminated : ""} ${className || ""}`;

    const handleClick = useCallback(() => {
        onClick(character.character_id);
    }, [character.character_id, onClick]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick(character.character_id);
            }
        },
        [character.character_id, onClick],
    );

    const renderAnalysisOverlay = () => {
        if (analysisResult === null || analysisResult === undefined) return null;

        const icon = analysisResult ? <CheckIcon /> : <XIcon />;
        const overlayClass = analysisResult ? styles.analysisOverlayPositive : styles.analysisOverlayNegative;
        const label = analysisResult ? cardText.match : cardText.mismatch;

        return (
            <div className={`${styles.analysisOverlay} ${overlayClass}`} aria-label={label}>
                {icon}
            </div>
        );
    };

    return (
        <article
            className={containerClasses}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            aria-label={`${character.name} ${isEliminated ? cardText.cardStateEliminated : cardText.cardStateActive}`}
            role="button"
            tabIndex={0}
            {...props}
        >
            <div className={styles.cardHeader}>
                <h3 className={styles.cardName}>{character.name}</h3>
                {renderAnalysisOverlay()}
            </div>
            {isEliminated && <span className={styles.eliminatedBadge}>{cardText.eliminated}</span>}
        </article>
    );
}

export default React.memo(CharacterCard);
