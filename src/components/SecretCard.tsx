import { type Character } from "../types";
import { text } from "../i18n";
import styles from "./SecretCard.module.css";

export type SecretCardProps = {
    /** The character for the secret card. */
    character: Character;
    /** Whether to reveal the character profile. Defaults to true. */
    revealed?: boolean;
    /** Labels for the card. */
    text: (typeof text)["en"]["secretCard"];
    /** Optional class name */
    className?: string;
    /** Optional role/summary joiner. */
    listJoiner?: string;
};

/**
 * A component to display the player's or AI's secret figure profile.
 * It can be shown as a revealed profile or a hidden placeholder.
 */
function SecretCard({ character, revealed = true, text: secretText, className, listJoiner }: SecretCardProps) {
    const joiner = listJoiner ?? "、";
    return (
        <div className={`${styles.cardContainer} ${className || ""}`.trim()}>
            {revealed ? (
                <article className={styles.profile} aria-label={secretText.profileAria.replace("{{name}}", character.name)}>
                    <h3 className={styles.cardName}>{character.name}</h3>
                    <dl className={styles.metaList}>
                        <div>
                            <dt>{secretText.region}</dt>
                            <dd>{character.region}</dd>
                        </div>
                        <div>
                            <dt>{secretText.era}</dt>
                            <dd>{character.era}</dd>
                        </div>
                        <div>
                            <dt>{secretText.roles}</dt>
                            <dd>{character.roles.join(joiner)}</dd>
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
                <div className={styles.placeholder} aria-label={secretText.hiddenAria}>
                    <span>?</span>
                    <p>{secretText.hiddenTitle}</p>
                </div>
            )}
        </div>
    );
}

export default SecretCard;
