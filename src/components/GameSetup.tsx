import React, { type ComponentPropsWithoutRef, useEffect, useRef, useState } from "react";
import { SHOW_EXPLICIT_MODEL_DOWNLOAD_BUTTON } from "../config";
import { AIStatus } from "../types";
import { text } from "../i18n";
import styles from "./GameSetup.module.css";
import { CheckCircleIcon, DownloadIcon, SpinnerIcon, UsersIcon } from "./icons";

type SetupOptionCardProps = ComponentPropsWithoutRef<"button"> & {
    title: string;
    description: string;
    icon: React.ReactNode;
};

function SetupOptionCard({ title, description, icon, ...props }: SetupOptionCardProps) {
    return (
        <button className={styles.optionCard} {...props}>
            <div className={styles.iconWrapper}>{icon}</div>
            <h3 className={styles.cardTitle}>{title}</h3>
            <p className={styles.cardDescription}>{description}</p>
        </button>
    );
}

export type GameSetupProps = {
    /** Callback to start the game with default characters. */
    onStartDefault: () => void;
    /** The current status of the AI model. */
    aiStatus: AIStatus;
    /** A message describing the current AI status. */
    aiStatusMessage: string;
    /** The download progress of the AI model (0-100). */
    downloadProgress: number | null;
    /** Whether the default character data has been loaded. */
    hasDefaultChars: boolean;
    /** Whether the app is in a general loading state. */
    isLoading: boolean;
    /** Whether the AI analysis review mode is enabled. */
    isReviewModeEnabled: boolean;
    /** Callback to set the AI analysis review mode. */
    onSetReviewMode: (isEnabled: boolean) => void;
    /** Callback to initiate the AI model download. */
    onDownload: () => void;
    /** Whether the player has clicked start and is waiting for model preparation. */
    hasPendingStart: boolean;
    setupText: (typeof text)["en"]["setup"];
};

/**
 * The initial setup screen where the player can choose the game mode.
 * It also displays the loading status of the on-device AI model.
 */
function GameSetup({
    onStartDefault,
    aiStatus,
    aiStatusMessage,
    downloadProgress,
    hasDefaultChars,
    isLoading,
    isReviewModeEnabled,
    onSetReviewMode,
    onDownload,
    hasPendingStart,
    setupText,
}: GameSetupProps) {
    const isReady = aiStatus === AIStatus.READY;
    const isPreparingModel =
        aiStatus === AIStatus.INITIALIZING || aiStatus === AIStatus.DOWNLOADING || (hasPendingStart && !isReady);
    const isModelUnavailable = aiStatus === AIStatus.ERROR || aiStatus === AIStatus.UNAVAILABLE;
    const defaultGameDisabled = SHOW_EXPLICIT_MODEL_DOWNLOAD_BUTTON
        ? !isReady || !hasDefaultChars || isLoading
        : isLoading || isPreparingModel || isModelUnavailable || (isReady && !hasDefaultChars);

    const [showComplete, setShowComplete] = useState(false);
    const prevAiStatus = useRef(aiStatus);

    useEffect(() => {
        if (prevAiStatus.current === AIStatus.DOWNLOADING && aiStatus === AIStatus.READY) {
            setShowComplete(true);
            const timer = setTimeout(() => setShowComplete(false), 2000);
            return () => clearTimeout(timer);
        }
        prevAiStatus.current = aiStatus;
    }, [aiStatus]);

    const renderStatus = () => {
        if (showComplete) {
            return (
                <div className={`${styles.statusContainer} ${styles.statusComplete}`} role="status">
                    <CheckCircleIcon />
                    <p className={styles.subtitle}>{setupText.statusReady}</p>
                </div>
            );
        }

        switch (aiStatus) {
            case AIStatus.DOWNLOADABLE:
                if (!SHOW_EXPLICIT_MODEL_DOWNLOAD_BUTTON) {
                    return hasPendingStart ? (
                        <div className={styles.statusContainer} role="status">
                            <p className={styles.statusText}>{setupText.statusPrepareModel}</p>
                            <p className={styles.statusHint}>{setupText.firstUseHint}</p>
                        </div>
                    ) : null;
                }

                return (
                    <div className={styles.statusContainer} role="status">
                        <p className={`${styles.statusText} ${styles.downloadPrompt}`}>{aiStatusMessage}</p>
                        <button onClick={onDownload} className={styles.downloadButton}>
                            <DownloadIcon />
                            {setupText.statusDownloadPrompt}
                        </button>
                    </div>
                );
            case AIStatus.INITIALIZING:
            case AIStatus.DOWNLOADING:
                return (
                    <div className={styles.statusContainer} role="status">
                        {aiStatus === AIStatus.INITIALIZING && <SpinnerIcon className={styles.spinner} />}
                        <p className={styles.statusText}>
                            {hasPendingStart ? setupText.statusPrepareModel : aiStatusMessage}
                        </p>
                        {hasPendingStart && <p className={styles.statusHint}>{setupText.firstUseHint}</p>}
                        {SHOW_EXPLICIT_MODEL_DOWNLOAD_BUTTON &&
                            aiStatus === AIStatus.DOWNLOADING &&
                            downloadProgress !== null && (
                                <div className={styles.progressWrapper}>
                                    <div
                                        className={styles.progressBarContainer}
                                        aria-label={`Downloading local AI model: ${Math.floor(downloadProgress)}%`}
                                        aria-valuenow={downloadProgress}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                    >
                                        <div className={styles.progressBar} style={{ width: `${downloadProgress}%` }}></div>
                                    </div>
                                    <span className={styles.progressPercentage}>{Math.floor(downloadProgress)}%</span>
                                </div>
                            )}
                    </div>
                );
            case AIStatus.UNAVAILABLE:
            case AIStatus.ERROR:
                return (
                    <div className={styles.statusContainer} role="alert">
                        <p className={styles.errorText}>{aiStatusMessage}</p>
                    </div>
                );
            case AIStatus.READY:
                return !hasDefaultChars ? (
                    <div className={styles.statusContainer} role="status">
                        <SpinnerIcon className={styles.spinner} />
                        <p className={styles.subtitle}>{setupText.statusLoadingCards}</p>
                    </div>
                ) : null;
            default:
                return null;
        }
    };

    return (
        <div className={styles.setupContainer}>
            <div className={styles.titleContainer}>
                <h1 className={styles.mainTitle}>{setupText.title}</h1>
                <p className={styles.subtitle}>{setupText.subtitle}</p>
            </div>

            {renderStatus()}

            <div className={styles.optionsGrid}>
                <SetupOptionCard
                    title={setupText.startButtonTitle}
                    description={setupText.startButtonDescription}
                    icon={<UsersIcon />}
                    onClick={onStartDefault}
                    disabled={defaultGameDisabled}
                />
            </div>

            <div className={styles.settingsContainer}>
                <h3 className={styles.settingsTitle}>{setupText.optionsTitle}</h3>
                <label className={styles.settingLabel}>
                    <input
                        type="checkbox"
                        className={styles.settingCheckbox}
                        checked={isReviewModeEnabled}
                        onChange={(e) => onSetReviewMode(e.target.checked)}
                        disabled={!isReady}
                    />
                    {setupText.reviewLabel}
                </label>
                <p className={styles.settingDescription}>{setupText.reviewDescription}</p>
            </div>
        </div>
    );
}

export default GameSetup;
