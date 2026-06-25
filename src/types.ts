export type Character = {
    character_id: string;
    name: string;
    region: string;
    era: string;
    roles: string[];
    tags: string[];
    summary: string;
};

export type Message = {
    sender: "PLAYER" | "AI" | "SYSTEM";
    text: string;
};

export enum GameState {
    SETUP,
    PLAYER_TURN_ASKING,
    PLAYER_TURN_ELIMINATING,
    AI_TURN,
    PLAYER_REVIEWING_AI_ANALYSIS,
    AI_TURN_WAITING_FOR_ANSWER,
    GAME_OVER,
}

export type GameWinner = "PLAYER" | "AI" | null;

export enum AIStatus {
    INITIALIZING,
    DOWNLOADABLE,
    DOWNLOADING,
    READY,
    UNAVAILABLE,
    ERROR,
}

export type EliminationAnalysisResult = {
    id: string;
    name: string;
    has_feature: boolean;
    reasoning: string;
};

export type AIQuestionAndAnalysis = {
    question: string;
    analysis: EliminationAnalysisResult[];
};
