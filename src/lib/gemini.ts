import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.warn("⚠️ GOOGLE_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

// Export the model instance directly for easier usage
// Using 'gemini-pro' as a default, but can be changed
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" });

export const generateText = async (prompt: string) => {
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY not configured");
  }
  
  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating text with Gemini:", error);
    throw error;
  }
};
