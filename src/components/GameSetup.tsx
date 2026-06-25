import React, { type ComponentPropsWithoutRef, useEffect, useRef, useState } from "react";
import { AIStatus } from "../types";
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
}: GameSetupProps) {
    const isReady = aiStatus === AIStatus.READY;
    const defaultGameDisabled = !isReady || !hasDefaultChars || isLoading;

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
                    <p className={styles.subtitle}>本地 AI 模型已就绪</p>
                </div>
            );
        }

        switch (aiStatus) {
            case AIStatus.DOWNLOADABLE:
                return (
                    <div className={styles.statusContainer} role="status">
                        <p className={`${styles.subtitle} ${styles.downloadPrompt}`}>{aiStatusMessage}</p>
                        <button onClick={onDownload} className={styles.downloadButton}>
                            <DownloadIcon />
                            下载本地 AI 模型
                        </button>
                    </div>
                );
            case AIStatus.INITIALIZING:
            case AIStatus.DOWNLOADING:
                return (
                    <div className={styles.statusContainer} role="status">
                        {aiStatus === AIStatus.INITIALIZING && <SpinnerIcon className={styles.spinner} />}
                        <p className={styles.subtitle}>{aiStatusMessage}</p>
                        {aiStatus === AIStatus.DOWNLOADING && downloadProgress !== null && (
                            <div className={styles.progressWrapper}>
                                <div
                                    className={styles.progressBarContainer}
                                    aria-label={`正在下载本地 AI 模型：${Math.floor(downloadProgress)}%`}
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
                        <p className={styles.subtitle}>正在加载人物资料...</p>
                    </div>
                ) : null;
            default:
                return null;
        }
    };

    return (
        <div className={styles.setupContainer}>
            <div className={styles.titleContainer}>
                <h1 className={styles.mainTitle}>AI 猜名人：历史人物版</h1>
                <p className={styles.subtitle}>用中文问题挑战本地 AI，猜出对方的历史人物。</p>
            </div>

            {renderStatus()}

            <div className={styles.optionsGrid}>
                <SetupOptionCard
                    title="开始游戏"
                    description="从中外历史人物牌库中随机抽取 12 位候选人物。"
                    icon={<UsersIcon />}
                    onClick={onStartDefault}
                    disabled={defaultGameDisabled}
                />
            </div>

            <div className={styles.settingsContainer}>
                <h3 className={styles.settingsTitle}>游戏选项</h3>
                <label className={styles.settingLabel}>
                    <input
                        type="checkbox"
                        className={styles.settingCheckbox}
                        checked={isReviewModeEnabled}
                        onChange={(e) => onSetReviewMode(e.target.checked)}
                        disabled={!isReady}
                    />
                    显示 AI 分析过程
                </label>
                <p className={styles.settingDescription}>
                    在回答 AI 的问题前查看它如何判断候选人物。这个选项会让流程多一步，但更容易检查 AI 是否推理正确。
                </p>
            </div>
        </div>
    );
}

export default GameSetup;
