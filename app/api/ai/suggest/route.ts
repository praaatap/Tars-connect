import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { NextResponse } from "next/server";
import process from "process";

export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
    try {
        const { context, userName } = await req.json();

        if (!context || context.trim() === "") {
            console.log("Empty context provided to AI suggestion API");
            return NextResponse.json({ suggestions: [] });
        }

        if (!process.env.GOOGLE_API_KEY) {
            console.error("GOOGLE_API_KEY is not configured");
            return NextResponse.json({ suggestions: [] });
        }

        const model = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            apiKey: process.env.GOOGLE_API_KEY,
            maxOutputTokens: 200,
            temperature: 0.7,
        });

        const promptTemplate = PromptTemplate.fromTemplate(
            `You are an AI assistant helping a user write helpful replies in a chat.

Conversation History:
{context}
you are a user named {userName} in the conversation above. Based on the conversation history, generate 3 short and relevant reply suggestions that {userName} can use to continue the conversation. Each suggestion should be concise (max 40 words) and contextually appropriate. Avoid generic responses and try to capture the tone of the conversation.
SYSTEM : Generate 3 short reply suggestions (max 40 words each).
Format: suggestion1 | suggestion2 | suggestion3
IMPORTANT: Only output the suggestions separated by |. Nothing else.`
        );

        const chain = promptTemplate.pipe(model);
        const result = await chain.invoke({
            context: context.substring(0, 2000), // Limit context to avoid token issues
            userName,

        });

        const responseText = result.content.toString().trim();
        console.log("AI Response:", responseText);

        if (!responseText) {
            console.log("Empty response from AI model");
            return NextResponse.json({ suggestions: [] });
        }

        // Try to parse suggestions - handle various formats
        let suggestions: string[] = [];

        // First try splitting by |
        if (responseText.includes("|")) {
            suggestions = responseText
                .split("|")
                .map(s => s.trim())
                .filter(s => s.length > 0 && s.length < 100)
                .slice(0, 3);
        }
        // If no | found, try splitting by newlines
        else if (responseText.includes("\n")) {
            suggestions = responseText
                .split("\n")
                .map(s => s.replace(/^\d+\.\s*/, "").trim()) // Remove numbering like "1. "
                .filter(s => s.length > 0 && s.length < 100)
                .slice(0, 3);
        }
        // Otherwise treat as a single suggestion
        else if (responseText.length > 0 && responseText.length < 100) {
            suggestions = [responseText];
        }

        console.log("Parsed suggestions:", suggestions);
        return NextResponse.json(
            { suggestions },
            {
                headers: {
                    'Cache-Control': 'no-store, max-age=0',
                },
            }
        );
    } catch (error) {
        console.error("AI Suggestion Error:", error);
        return NextResponse.json(
            { suggestions: [] },
            { status: 200 }
        );
    }
}