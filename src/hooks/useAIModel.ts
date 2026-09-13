import { useEffect, useState } from "react";
import { DEFAULT_CHARACTERS } from "../constants";
import * as builtInAIService from "../services/builtInAIService.ts";
import { AIStatus, type Character } from "../types";
import { Language, text } from "../i18n";

type UseAIModelProps = {
    language: Language;
};

/**
 * Manages the AI model's lifecycle, including initialization, status, and data loading.
 */
export const useAIModel = ({ language }: UseAIModelProps) => {
    const [aiStatus, setAiStatus] = useState<AIStatus>(AIStatus.INITIALIZING);
    const [aiStatusMessage, setAiStatusMessage] = useState<string>(text[language].aiModel.initializing);
    const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
    const [defaultCharsWithBlobs, setDefaultCharsWithBlobs] = useState<Character[] | null>(null);

    const handleStatusChange = (status: AIStatus, message?: string) => {
        setAiStatus(status);
        if (message) setAiStatusMessage(message);
    };

    // Initialize the AI model on mount or language change.
    useEffect(() => {
        setAiStatusMessage(text[language].aiModel.initializing);
        builtInAIService.initializeAI({
            onStatusChange: handleStatusChange,
            language,
        });
    }, [language]);

    // Load text-only default characters once the AI is ready.
    useEffect(() => {
        if (aiStatus !== AIStatus.READY) return;
        setDefaultCharsWithBlobs(
            DEFAULT_CHARACTERS.filter((character) => language === "zh" || !character.isChineseHistorical),
        );
    }, [aiStatus, language]);

    const reinitializeAI = () => {
        setAiStatus(AIStatus.INITIALIZING);
        builtInAIService.initializeAI({
            onStatusChange: handleStatusChange,
            language,
        });
    };

    const handleDownload = () => {
        setDownloadProgress(null);
        builtInAIService.downloadModel({
            onStatusChange: handleStatusChange,
            language,
            onProgress: setDownloadProgress,
        });
    };

    return {
        aiStatus,
        aiStatusMessage,
        downloadProgress,
        defaultCharsWithBlobs,
        setAiStatus,
        setAiStatusMessage,
        setDownloadProgress,
        reinitializeAI,
        handleDownload,
    };
};
