'use server';

import { generateText } from "@/lib/gemini";

export async function askGemini(prompt: string) {
  try {
    const text = await generateText(prompt);
    return { success: true, data: text };
  } catch (error) {
    console.error("Server Action Error:", error);
    return { success: false, error: "Failed to generate text" };
  }
}
