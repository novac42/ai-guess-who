import { useEffect, useState } from "react";
import { DEFAULT_CHARACTERS } from "../constants";
import * as builtInAIService from "../services/builtInAIService.ts";
import { AIStatus, type Character } from "../types";

/**
 * Manages the AI model's lifecycle, including initialization, status, and data loading.
 */
export const useAIModel = () => {
    const [aiStatus, setAiStatus] = useState<AIStatus>(AIStatus.INITIALIZING);
    const [aiStatusMessage, setAiStatusMessage] = useState<string>("Initializing AI...");
    const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
    const [defaultCharsWithBlobs, setDefaultCharsWithBlobs] = useState<Character[] | null>(null);

    const handleStatusChange = (status: AIStatus, message?: string) => {
        setAiStatus(status);
        if (message) setAiStatusMessage(message);
    };

    // Initialize the AI model on mount
    useEffect(() => {
        builtInAIService.initializeAI({
            onStatusChange: handleStatusChange,
        });
    }, []);

    // Load text-only default characters once the AI is ready.
    useEffect(() => {
        if (aiStatus === AIStatus.READY && !defaultCharsWithBlobs) {
            setDefaultCharsWithBlobs(DEFAULT_CHARACTERS);
        }
    }, [aiStatus, defaultCharsWithBlobs]);

    const reinitializeAI = () => {
        setAiStatus(AIStatus.INITIALIZING);
        builtInAIService.initializeAI({
            onStatusChange: handleStatusChange,
        });
    };

    const handleDownload = () => {
        setDownloadProgress(null);
        builtInAIService.downloadModel({
            onStatusChange: handleStatusChange,
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
