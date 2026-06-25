import { useCallback, useState } from "react";

const REVIEW_MODE_STORAGE_KEY = "ai-guess-who-review-mode";

/**
 * Manages user-configurable game settings.
 */
export const useGameSettings = () => {
    const [isReviewModeEnabled, setIsReviewModeEnabled] = useState<boolean>(() => {
        try {
            const storedValue = localStorage.getItem(REVIEW_MODE_STORAGE_KEY);
            return storedValue ? JSON.parse(storedValue) : true;
        } catch {
            return true;
        }
    });
    const handleSetReviewMode = useCallback((isEnabled: boolean) => {
        setIsReviewModeEnabled(isEnabled);
        try {
            localStorage.setItem(REVIEW_MODE_STORAGE_KEY, JSON.stringify(isEnabled));
        } catch (e) {
            console.error("Failed to save review mode setting", e);
        }
    }, []);

    return {
        isReviewModeEnabled,
        handleSetReviewMode,
    };
};
