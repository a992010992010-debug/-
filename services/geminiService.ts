import { GoogleGenAI, Type } from "@google/genai";
import { LessonSummaryResponse } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Existing function for enhancement (optional usage)
export const enhanceStudyMaterial = async (summary: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `حسن هذا النص العربي ليكون أكثر وضوحاً: ${summary}`,
    });
    return response.text || summary;
  } catch (error) {
    return summary;
  }
};

// New function for the "Summarize with AI" page returning structured JSON
export const generateLessonSummary = async (
  lessonName: string, 
  subject: string, 
  gradeLevel: string,
  length: 'short' | 'medium' | 'long' = 'medium',
  conceptsCount: number = 3
): Promise<LessonSummaryResponse | null> => {
  try {
    // Define explicit word counts to prevent the model from generating excessive text that gets truncated
    let lengthDesc = "متوسط الطول (حوالي 300 كلمة)";
    if (length === 'short') lengthDesc = "موجز جداً ومختصر (حوالي 150 كلمة)";
    if (length === 'long') lengthDesc = "مفصل وشامل ولكن بحدود معقولة (حوالي 600 كلمة)";

    const prompt = `
      أنت معلم خبير في كافة المواد الدراسية (علوم، رياضيات، تاريخ، لغات، إلخ). 
      قم بتلخيص الدرس التالي: "${lessonName}" في مادة "${subject}" للصف "${gradeLevel}".
      
      إعدادات التلخيص المطلوبة بدقة:
      - مستوى التفصيل والشرح: ${lengthDesc}. تجنب الإطالة المفرطة لتجنب انقطاع النص.
      - عدد المفاهيم الرئيسية في قائمة keyConcepts: يجب أن يكون ${conceptsCount} مفاهيم بالضبط.
      - إذا كانت المادة لغة أجنبية، اشرح القواعد بالعربية مع استخدام أمثلة باللغة الأجنبية.
      - إذا كانت رياضيات أو علوم، ركز على القوانين والمعادلات والنظريات.

      يجب أن يكون الرد بتنسيق JSON حصراً ويحتوي على الحقول التالية:
      1. title: عنوان جذاب للتلخيص.
      2. introduction: مقدمة تشرح الفكرة العامة للدرس.
      3. keyConcepts: قائمة تحتوي على أهم ${conceptsCount} مفاهيم رئيسية. كل عنصر يجب أن يحتوي على "concept" (اسم المفهوم) و "explanation" (شرح للمفهوم).
      4. terminology: قائمة بأهم المصطلحات وتعريفاتها.
      5. studyTips: 3 نصائح سريعة للمذاكرة.

      تأكد أن لا ينقطع النص في منتصف جملة JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // Optimized for speed
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            introduction: { type: Type.STRING },
            keyConcepts: { 
              type: Type.ARRAY,
              items: { 
                type: Type.OBJECT,
                properties: {
                  concept: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                }
              }
            },
            terminology: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING }
                }
              }
            },
            studyTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    if (response.text) {
      let cleanText = response.text.trim();
      
      // Robust cleaning: remove markdown blocks
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

      // Extra Safety: Extract JSON object boundaries if surrounding text exists
      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
      }

      return JSON.parse(cleanText) as LessonSummaryResponse;
    }
    return null;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};