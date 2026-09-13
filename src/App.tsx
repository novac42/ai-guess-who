import { useEffect, useMemo, useState } from "react";
import styles from "./App.module.css";
import ChatControls from "./components/ChatControls";
import EndGameDialog from "./components/EndGameDialog";
import GameBoard from "./components/GameBoard";
import GameSetup from "./components/GameSetup";
import SecretCard from "./components/SecretCard";
import { ChevronDownIcon, ChevronUpIcon } from "./components/icons";
import { DEFAULT_LANGUAGE, type Language, languageOptions, text } from "./i18n";
import { useGameLogic } from "./hooks/useGameLogic";
import { GameState } from "./types";

function App() {
    const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
    const [isSecretPanelVisible, setSecretPanelVisible] = useState(true);
    const ui = text[language];

    const {
        // State
        gameState,
        activeCharacters,
        playerSecret,
        aiSecret,
        messages,
        winner,
        winReason,
        isLoading,
        playerEliminatedChars,
        aiRemainingChars,
        aiStatus,
        aiStatusMessage,
        downloadProgress,
        defaultCharsWithBlobs,
        hasPendingStart,
        lastAIAnalysis,
        isReviewModeEnabled,

        // State Setters
        setPlayerEliminatedChars,

        // Handlers
        resetGame,
        handleStartDefault,
        handlePlayerQuestion,
        handleEndTurn,
        handlePlayerAnswer,
        handleConfirmAIAnalysis,
        handleSetReviewMode,
        handleDownload,
    } = useGameLogic({ language });

    useEffect(() => {
        document.title = ui.app.browserTitle;
    }, [ui.app.browserTitle]);

    const canChangeLanguage = gameState === GameState.SETUP;

    const aiEliminatedChars = useMemo(() => {
        const remainingIds = new Set(aiRemainingChars.map((c) => c.character_id));
        return new Set(activeCharacters.filter((c) => !remainingIds.has(c.character_id)).map((c) => c.character_id));
    }, [aiRemainingChars, activeCharacters]);

    const handleLanguageChange = (value: string) => {
        setLanguage(value as Language);
    };

    const renderContent = () => {
        switch (gameState) {
            case GameState.SETUP:
                return (
                    <GameSetup
                        onStartDefault={handleStartDefault}
                        aiStatus={aiStatus}
                        aiStatusMessage={aiStatusMessage}
                        downloadProgress={downloadProgress}
                        hasDefaultChars={!!defaultCharsWithBlobs}
                        isLoading={isLoading}
                        isReviewModeEnabled={isReviewModeEnabled}
                        onSetReviewMode={handleSetReviewMode}
                        onDownload={handleDownload}
                        hasPendingStart={hasPendingStart}
                        setupText={ui.setup}
                    />
                );
            case GameState.GAME_OVER:
            case GameState.PLAYER_TURN_ASKING:
            case GameState.PLAYER_TURN_ELIMINATING:
            case GameState.AI_TURN:
            case GameState.PLAYER_REVIEWING_AI_ANALYSIS:
            case GameState.AI_TURN_WAITING_FOR_ANSWER:
                if (!playerSecret || !aiSecret || activeCharacters.length === 0) {
                    return (
                        <div className={styles.errorContainer}>
                            {ui.app.errorNotInitialized}
                            <button onClick={resetGame} className={styles.restartButton}>
                                {ui.app.restart}
                            </button>
                        </div>
                    );
                }

                return (
                    <div className={styles.gameContainer}>
                        <header className={styles.topBar}>
                            <div className={styles.titleGroup}>
                                <h1 className={styles.appTitle}>{ui.app.title}</h1>
                                <p className={styles.subtitleText}>{ui.app.subtitle}</p>
                            </div>
                            <label className={styles.languageSwitcher}>
                                <span>{ui.app.languageSelectorLabel}</span>
                                <select
                                    value={language}
                                    onChange={(e) => handleLanguageChange(e.target.value)}
                                    disabled={!canChangeLanguage}
                                >
                                    {languageOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </header>

                        {winner && (
                            <EndGameDialog
                                winner={winner}
                                reason={winReason}
                                onPlayAgain={resetGame}
                                text={ui.endGame}
                            />
                        )}

                        <div className={styles.mainGrid}>
                            <div
                                className={`${styles.secretCardsPanel} ${
                                    !isSecretPanelVisible ? styles.secretCardsCollapsed : ""
                                }`}
                            >
                                <div className={styles.sidePanel}>
                                    <h2 className={styles.sidePanelTitlePlayer}>{ui.layout.sidePanelPlayer}</h2>
                                <SecretCard
                                    character={playerSecret}
                                    text={ui.secretCard}
                                    listJoiner={language === "zh" ? "、" : ", "}
                                />
                                </div>
                                <div className={styles.sidePanel}>
                                    <h2 className={styles.sidePanelTitleAi}>{ui.layout.sidePanelAi}</h2>
                                    <SecretCard
                                        character={aiSecret}
                                        text={ui.secretCard}
                                        listJoiner={language === "zh" ? "、" : ", "}
                                        revealed={gameState === GameState.GAME_OVER}
                                    />
                                </div>
                            </div>

                            <button
                                className={styles.secretPanelToggle}
                                onClick={() => setSecretPanelVisible((v) => !v)}
                                aria-label={isSecretPanelVisible ? ui.layout.toggleHide : ui.layout.toggleShow}
                            >
                                {isSecretPanelVisible ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                <span>{isSecretPanelVisible ? ui.layout.toggleHide : ui.layout.toggleShow}</span>
                            </button>

                            <div className={styles.boardArea}>
                                <div className={styles.boardWrapper}>
                                    <h2 className={styles.boardTitle}>{ui.layout.boardAiTitle}</h2>
                                    <GameBoard
                                        characters={activeCharacters}
                                        eliminatedChars={aiEliminatedChars}
                                        cardText={ui.characterCard}
                                        analysis={
                                            gameState === GameState.PLAYER_REVIEWING_AI_ANALYSIS
                                                ? lastAIAnalysis
                                                : undefined
                                        }
                                    />
                                    <p className={styles.boardSubtext}>{ui.layout.boardAiHint}</p>
                                </div>
                                <div className={styles.boardWrapper}>
                                    <h2 className={styles.boardTitle}>{ui.layout.boardPlayerTitle}</h2>
                                    <GameBoard
                                        characters={activeCharacters}
                                        eliminatedChars={playerEliminatedChars}
                                        cardText={ui.characterCard}
                                        onCardClick={(id) => {
                                            if (gameState === GameState.PLAYER_TURN_ELIMINATING) {
                                                setPlayerEliminatedChars((prev) => {
                                                    const newSet = new Set(prev);
                                                    if (newSet.has(id)) {
                                                        newSet.delete(id);
                                                    } else {
                                                        newSet.add(id);
                                                    }
                                                    return newSet;
                                                });
                                            }
                                        }}
                                    />
                                    <p className={styles.boardSubtext}>{ui.layout.boardPlayerHint}</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.chatArea}>
                            <ChatControls
                                messages={messages}
                                gameState={gameState}
                                isLoading={isLoading}
                                onPlayerQuestion={handlePlayerQuestion}
                                onEndTurn={handleEndTurn}
                                onPlayerAnswer={handlePlayerAnswer}
                                onConfirmAIAnalysis={handleConfirmAIAnalysis}
                                chatText={ui.chat}
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <main className={styles.app}>
            {gameState === GameState.SETUP && (
                <header className={styles.topBar}>
                    <div className={styles.titleGroup}>
                        <h1 className={styles.appTitle}>{ui.app.title}</h1>
                        <p className={styles.subtitleText}>{ui.app.subtitle}</p>
                    </div>
                    <label className={styles.languageSwitcher}>
                        <span>{ui.app.languageSelectorLabel}</span>
                        <select value={language} onChange={(e) => handleLanguageChange(e.target.value)}>
                            {languageOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </header>
            )}
            {renderContent()}
        </main>
    );
}

export default App;
