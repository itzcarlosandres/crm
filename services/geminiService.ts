import { GoogleGenAI, Type } from "@google/genai";
import { Client, Loan, AmortizationType, PaymentFrequency } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview';

export const analyzeLoanRisk = async (client: Client, loanAmount: number, term: number): Promise<any> => {
  try {
    const prompt = `
      Actúa como un analista de riesgos experto para una microfinanciera.
      Analiza la siguiente solicitud de crédito y devuelve un análisis JSON.
      
      Datos del Cliente:
      Nombre: ${client.name}
      Ingresos Mensuales: $${client.monthlyIncome}
      Puntaje Crediticio Interno (0-100): ${client.creditScore}
      
      Solicitud:
      Monto: $${loanAmount}
      Plazo: ${term} cuotas
      
      Reglas de negocio:
      - Si la cuota estimada supera el 30% de los ingresos, el riesgo sube.
      - Puntuación < 50 es alto riesgo.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING, enum: ['Bajo', 'Medio', 'Alto'] },
            score: { type: Type.NUMBER, description: "Risk score 0-100 where 100 is safest" },
            reasoning: { type: Type.STRING },
            recommendation: { type: Type.STRING, enum: ['Aprobar', 'Rechazar', 'Revisar Manualmente'] }
          },
          required: ['riskLevel', 'score', 'reasoning', 'recommendation']
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response from AI");

  } catch (error) {
    console.error("Error analyzing risk:", error);
    return {
      riskLevel: 'Medio',
      score: 50,
      reasoning: "No se pudo conectar con el servicio de IA. Análisis por defecto.",
      recommendation: 'Revisar Manualmente'
    };
  }
};

export const generateCollectionMessage = async (clientName: string, daysOverdue: number, amountDue: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Escribe un mensaje corto, profesional y firme para WhatsApp dirigido a ${clientName}.
      Tiene ${daysOverdue} días de atraso en su pago de $${amountDue}.
      El tono debe ser respetuoso pero urgente. Incluye emojis apropiados.
      No incluyas saludos genéricos como "[Tu Nombre]", firma como "Equipo de CrediFlow".`,
    });
    return response.text || "Estimado cliente, recuerde realizar su pago pendiente.";
  } catch (error) {
    return `Hola ${clientName}, le recordamos que tiene un pago pendiente de $${amountDue}. Por favor regularice su situación.`;
  }
};