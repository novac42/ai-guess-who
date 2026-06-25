import { type Character } from "../types";
import styles from "./SecretCard.module.css";

export type SecretCardProps = {
    /** The character for the secret card. */
    character: Character;
    /** Whether to reveal the character profile. Defaults to true. */
    revealed?: boolean;
};

/**
 * A component to display the player's or AI's secret character card.
 * It can be shown as a revealed card or a hidden placeholder.
 */
function SecretCard({ character, revealed = true }: SecretCardProps) {
    return (
        <div className={styles.cardContainer}>
            {revealed ? (
                <article className={styles.profile} aria-label={`${character.name}人物资料`}>
                    <h3 className={styles.cardName}>{character.name}</h3>
                    <dl className={styles.metaList}>
                        <div>
                            <dt>地区</dt>
                            <dd>{character.region}</dd>
                        </div>
                        <div>
                            <dt>时代</dt>
                            <dd>{character.era}</dd>
                        </div>
                        <div>
                            <dt>身份</dt>
                            <dd>{character.roles.join("、")}</dd>
                        </div>
                    </dl>
                    <div className={styles.tags}>
                        {character.tags.map((tag) => (
                            <span key={tag}>{tag}</span>
                        ))}
                    </div>
                    <p className={styles.summary}>{character.summary}</p>
                </article>
            ) : (
                <div className={styles.placeholder} aria-label="AI 的秘密人物尚未揭晓">
                    <span>?</span>
                    <p>AI 的秘密人物</p>
                </div>
            )}
        </div>
    );
}

export default SecretCard;
