import React, { type ComponentPropsWithoutRef, useCallback } from "react";
import { type Character } from "../types";
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
};

/**
 * A candidate card that keeps board scanning focused on the figure name.
 */
function CharacterCard({ character, isEliminated, onClick, analysisResult, className, ...props }: CharacterCardProps) {
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
        const label = analysisResult ? "AI 判断这个人物符合问题特征。" : "AI 判断这个人物不符合问题特征。";

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
            aria-label={`${character.name}人物卡。${isEliminated ? "已排除。" : "候选中。"}`}
            role="button"
            tabIndex={0}
            {...props}
        >
            <div className={styles.cardHeader}>
                <h3 className={styles.cardName}>{character.name}</h3>
                {renderAnalysisOverlay()}
            </div>
            {isEliminated && <span className={styles.eliminatedBadge}>已排除</span>}
        </article>
    );
}

export default React.memo(CharacterCard);
