
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

export const refineGoal = async (goalTitle: string): Promise<{ suggestedTarget: number, tip: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise a meta "${goalTitle}" para o ano de 2026. Sugira um número de repetições anual ideal e uma dica rápida de consistência. Responda em JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedTarget: { type: Type.NUMBER },
            tip: { type: Type.STRING }
          },
          required: ["suggestedTarget", "tip"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    return { suggestedTarget: 100, tip: "A consistência é a chave para o sucesso." };
  }
};
