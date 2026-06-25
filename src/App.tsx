import { useMemo, useState } from "react";
import styles from "./App.module.css";
import ChatControls from "./components/ChatControls";
import EndGameDialog from "./components/EndGameDialog";
import GameBoard from "./components/GameBoard";
import GameSetup from "./components/GameSetup";
import SecretCard from "./components/SecretCard";
import { ChevronDownIcon, ChevronUpIcon } from "./components/icons";
import { useGameLogic } from "./hooks/useGameLogic";
import { GameState } from "./types";

function App() {
    const [isSecretPanelVisible, setSecretPanelVisible] = useState(true);

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
    } = useGameLogic();

    const aiEliminatedChars = useMemo(() => {
        const remainingIds = new Set(aiRemainingChars.map((c) => c.character_id));
        return new Set(activeCharacters.filter((c) => !remainingIds.has(c.character_id)).map((c) => c.character_id));
    }, [aiRemainingChars, activeCharacters]);

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
                            游戏没有正确初始化。
                            <button onClick={resetGame} className={styles.restartButton}>
                                重新开始
                            </button>
                        </div>
                    );
                }
                return (
                    <>
                        <div className={styles.gameContainer}>
                            {winner && <EndGameDialog winner={winner} reason={winReason} onPlayAgain={resetGame} />}
                            <div className={styles.mainGrid}>
                                <div
                                    className={`${styles.secretCardsPanel} ${
                                        !isSecretPanelVisible ? styles.secretCardsCollapsed : ""
                                    }`}
                                >
                                    <div className={styles.sidePanel}>
                                        <h2 className={styles.sidePanelTitlePlayer}>你的秘密人物</h2>
                                        <SecretCard character={playerSecret} />
                                    </div>
                                    <div className={styles.sidePanel}>
                                        <h2 className={styles.sidePanelTitleAi}>AI 的秘密人物</h2>
                                        <SecretCard character={aiSecret} revealed={gameState === GameState.GAME_OVER} />
                                    </div>
                                </div>

                                <button
                                    className={styles.secretPanelToggle}
                                    onClick={() => setSecretPanelVisible((v) => !v)}
                                    aria-label={isSecretPanelVisible ? "隐藏秘密人物" : "显示秘密人物"}
                                >
                                    {isSecretPanelVisible ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                    <span>{isSecretPanelVisible ? "隐藏秘密人物" : "显示秘密人物"}</span>
                                </button>

                                <div className={styles.boardArea}>
                                    <div className={styles.boardWrapper}>
                                        <h2 className={styles.boardTitle}>AI 的候选列表</h2>
                                        <GameBoard
                                            characters={activeCharacters}
                                            eliminatedChars={aiEliminatedChars}
                                            analysis={
                                                gameState === GameState.PLAYER_REVIEWING_AI_ANALYSIS
                                                    ? lastAIAnalysis
                                                    : undefined
                                            }
                                        />
                                        <p className={styles.boardSubtext}>AI 会根据你的回答排除自己的候选人物。</p>
                                    </div>
                                    <div className={styles.boardWrapper}>
                                        <h2 className={styles.boardTitle}>你的候选列表</h2>
                                        <GameBoard
                                            characters={activeCharacters}
                                            eliminatedChars={playerEliminatedChars}
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
                                        <p className={styles.boardSubtext}>点击人物卡来排除或恢复候选。</p>
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
                                />
                            </div>
                        </div>
                    </>
                );
        }
    };

    return <main className={styles.appContainer}>{renderContent()}</main>;
}

export default App;
