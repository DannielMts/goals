
import { GoogleGenAI, Type } from "@google/genai";
import { Goal } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getGoalMotivation = async (goals: Goal[]): Promise<string> => {
  try {
    const summary = goals.map(g => 
      `${g.title} (${g.isCompleted ? 'Concluída' : `${g.currentValue}/${g.targetValue}`})`
    ).join(', ');

    const prompt = `Como um mentor de alta performance, analise minhas metas para 2026 e me dê um parágrafo curto de motivação e foco extremo. 
    Metas atuais: ${summary}. 
    Mantenha o tom inspirador, direto e em Português do Brasil.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Continue focado em suas metas de 2026! O sucesso é a soma de pequenos esforços repetidos dia após dia.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sua jornada para 2026 começa agora. Cada passo conta!";
  }
};

export const generateVisionImage = async (goalTitle: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `A cinematic, highly detailed and inspiring 4k image representing the success of the goal: "${goalTitle}". Style: Modern, clean, professional photography.` }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation failed", error);
    return null;
  }
};
