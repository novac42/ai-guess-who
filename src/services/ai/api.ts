/**
 * @file Contains the core functions for interacting with the AI model for game logic.
 */
import { type AIQuestionAndAnalysis, type Character, type Message } from "../../types";
import { getAIQuestionAndAnalysisPrompt, getAnswerToPlayerQuestionPrompt, getSystemPrompt } from "../prompts";
import { getSession } from "./session";
import { promiseWithTimeout } from "./timeout";

const GENERAL_PROMPT_TIMEOUT_MS = 30000;

/**
 * Gets a yes/no answer from the AI for a player's question about a secret figure.
 * @param character The AI's secret figure.
 * @param question The player's question.
 * @returns A promise that resolves to the Chinese answer text.
 */
export async function getAnswerToPlayerQuestion(character: Character, question: string): Promise<string> {
    const session = await getSession();

    const promptText = getAnswerToPlayerQuestionPrompt(character, question);
    const schema = { type: "boolean" };
    const result = await promiseWithTimeout(
        session.prompt(promptText, { responseConstraint: schema }),
        GENERAL_PROMPT_TIMEOUT_MS,
    );

    if (typeof result !== "string") {
        console.error("Player question answer is not a string:", result);
        throw new Error("AI failed to return a valid response for the player's question.");
    }

    return JSON.parse(result) ? "是" : "否";
}

/**
 * Generates a strategic question and provides the underlying visual analysis in a single call.
 * This ensures consistency between the question asked and the characters to be eliminated.
 * @param characters The list of remaining possible characters.
 * @param messages The conversation history.
 * @param retryReason An optional reason explaining why a previous attempt failed.
 * @param lastFailedQuestion The specific question that failed previously.
 * @returns A promise that resolves to an object containing the AI's question and its analysis.
 */
export async function getAIQuestionAndAnalysis(
    characters: Character[],
    messages: Message[],
    retryReason?: string,
    lastFailedQuestion?: string,
): Promise<AIQuestionAndAnalysis> {
    const session = await getSession();

    const prompt: any[] = [];

    // Convert the game's message log into a structured history for the AI model.
    messages
        .filter((msg) => msg.sender === "PLAYER" || msg.sender === "AI")
        .forEach((msg) => {
            prompt.push({
                role: msg.sender === "PLAYER" ? "user" : "assistant",
                content: [{ type: "text", value: msg.text }],
            });
        });

    const systemPrompt = getSystemPrompt();
    const turnPrompt = getAIQuestionAndAnalysisPrompt(characters, retryReason, lastFailedQuestion);
    const userContent: any[] = [{ type: "text", value: `${systemPrompt}\n\n${turnPrompt}` }];
    prompt.push({ role: "user", content: userContent });

    const schema = {
        type: "object",
        properties: {
            question: {
                type: "string",
                description: "The best yes/no question to ask based on the analysis.",
            },
            analysis: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        has_feature: {
                            type: "boolean",
                            description: "Does this character have the feature asked about in the question?",
                        },
                        reasoning: {
                            type: "string",
                            description: "A brief justification for the has_feature value.",
                        },
                    },
                    required: ["id", "name", "has_feature", "reasoning"],
                },
            },
        },
        required: ["question", "analysis"],
    };

    const result = await promiseWithTimeout(
        session.prompt(prompt, { responseConstraint: schema }),
        GENERAL_PROMPT_TIMEOUT_MS,
    );

    if (typeof result !== "string") {
        console.error("AI question/analysis result is not a string:", result);
        throw new Error("AI failed to return a valid JSON response for its turn.");
    }

    // Developer-facing log for easier debugging
    console.log("%c[DEBUG] AI Question & Draft Analysis:", "color: #f59e0b; font-weight: bold;", JSON.parse(result));

    return JSON.parse(result);
}
