import { GoogleGenAI, Type } from "@google/genai";
import { ColorModel } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const explainColorModel = async (model: ColorModel): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert Computer Vision Professor. Briefly explain the ${model} color model. 
      Focus on its coordinate system, why it is constructed that way, and its specific primary use case in computer vision (e.g., segmentation, printing, perception).
      Keep it under 150 words. Format with Markdown.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "Explanation unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error retrieving explanation. Please check API Key configuration.";
  }
};

export const explainSeparation = async (model: ColorModel): Promise<string> => {
   try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Explain how splitting an image into ${model} channels helps in Computer Vision tasks. 
      Give one concrete example (e.g. "The S channel in HSV is robust to lighting changes...").
      Keep it under 100 words. Format with Markdown.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "Explanation unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error retrieving explanation.";
  }
}