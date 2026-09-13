/**
 * @file Manages the lifecycle of the on-device AI model session.
 */
import { AIStatus } from "../../types";
import { type LanguageModel, type LanguageModelSession } from "./types";
import { type Language, text } from "../../i18n";

let session: LanguageModelSession | null = null;
let model: LanguageModel | null = null; // Store the model entry point for reuse

/**
 * Finds the entry point for the on-device AI model in the window object.
 * @returns The LanguageModel object or null if not found.
 */
function getModelEntryPoint(): LanguageModel | null {
    if (self.LanguageModel) return self.LanguageModel;
    if (self.ai?.languageModel) return self.ai.languageModel;
    return null;
}

/**
 * Initializes the AI model, handling availability checks.
 * @param options Callbacks for status and progress updates.
 */
export async function initialize(options: {
    onStatusChange: (status: AIStatus, message?: string) => void;
    language?: Language;
}): Promise<void> {
    const { onStatusChange, language = "en" } = options;
    const ui = text[language as "en" | "zh"].aiModel;

    // Avoid re-initializing if the model is already available.
    if (model && session) {
        onStatusChange(AIStatus.READY, ui.ready);
        return;
    }

    onStatusChange(AIStatus.INITIALIZING, ui.initializing);
    model = getModelEntryPoint();

    if (!model) {
        onStatusChange(
            AIStatus.UNAVAILABLE,
            ui.unavailableNoApi,
        );
        return;
    }

    try {
        const availability = await model.availability();

        if (availability === "available") {
            session = await model.create();
            onStatusChange(AIStatus.READY, ui.ready);
        } else if (availability === "downloadable" || availability === "downloading") {
            // "downloading" is treated like "downloadable" to show the button,
            // as the user might have refreshed the page. Clicking download should resume.
            onStatusChange(AIStatus.DOWNLOADABLE, ui.downloadable);
        } else {
            onStatusChange(AIStatus.UNAVAILABLE, ui.unavailable);
        }
    } catch (e: any) {
        console.error("AI Initialization Error:", e);
        session = null; // Ensure session is null on error
        model = null;
        onStatusChange(AIStatus.ERROR, e.message || ui.errorInit);
    }
}

/**
 * Triggers the download of the AI model.
 * @param options Callbacks for status and progress updates.
 */
export async function downloadModel(options: {
    onStatusChange: (status: AIStatus, message?: string) => void;
    language?: Language;
    onProgress?: (progress: number) => void;
}): Promise<void> {
    const { onStatusChange, language = "en", onProgress } = options;
    const ui = text[language as "en" | "zh"].aiModel;

    if (!model) {
        onStatusChange(AIStatus.ERROR, ui.notReadyForDownload);
        return;
    }

    try {
        onStatusChange(AIStatus.DOWNLOADING, ui.downloading);
        session = await model.create({
            monitor: (e: any) => {
                console.log("[AI_DEBUG] Monitor object received:", e);

                if (onProgress && e.addEventListener) {
                    // This API is experimental. We listen for 'downloadprogress', which seems most reliable.
                    e.addEventListener("downloadprogress", (event: any) => {
                        console.log("[AI_DEBUG] 'downloadprogress' event received:", event);

                        const { loaded, total } = event;

                        // The event might provide progress as bytes (loaded/total) or a ratio (loaded).
                        // This handles both cases and ensures `loaded = 0` is reported correctly.
                        if (typeof loaded === "number") {
                            let progressPercent = 0;
                            if (typeof total === "number" && total > 0) {
                                progressPercent = (loaded / total) * 100;
                            } else {
                                progressPercent = loaded * 100;
                            }

                            // Clamp value to be safe
                            const clampedProgress = Math.max(0, Math.min(100, progressPercent));

                            onProgress(clampedProgress);
                            onStatusChange(
                                AIStatus.DOWNLOADING,
                                ui.downloadingPercent(Math.floor(clampedProgress)),
                            );
                        }
                    });
                }
            },
        });
        onStatusChange(AIStatus.READY, ui.ready);
    } catch (e: any) {
        console.error("AI Download Error:", e);
        session = null;
        onStatusChange(AIStatus.ERROR, e.message || ui.errorDownload);
    }
}

/**
 * Ensures the AI session is active and returns it.
 * @returns The active LanguageModelSession.
 * @throws If the session is not initialized.
 */
export async function getSession(): Promise<LanguageModelSession> {
    if (!session) {
        throw new Error("AI session not initialized. Call initialize() first.");
    }
    return session;
}

/**
 * Destroys any existing AI session and creates a new, clean one for a new game.
 * This ensures no conversation history is carried over between games.
 */
export async function startNewGameSession(language: "en" | "zh" = "en"): Promise<void> {
    const ui = text[language].aiModel;
    // Destroy the previous session if it exists to ensure a clean slate.
    if (session) {
        session.destroy();
    }

    if (!model) {
        throw new Error(ui.newSessionError);
    }

    // Create a new session for the new game.
    try {
        session = await model.create();
    } catch (e) {
        console.error("Failed to create new AI session:", e);
        throw new Error(ui.newSessionError);
    }
}
