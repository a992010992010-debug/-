import { GoogleGenAI, Type } from "@google/genai";
import { LessonSummaryResponse } from "../types";

// Helper to clean JSON string
const cleanJsonString = (text: string): string => {
  let clean = text.trim();
  // Remove markdown code blocks
  clean = clean.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
  
  // Try to extract JSON object if wrapped in text
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }
  
  return clean;
};

export const generateLessonSummary = async (
  lessonName: string, 
  subject: string, 
  gradeLevel: string,
  length: 'short' | 'medium' | 'long' = 'medium',
  conceptsCount: number = 3,
  includeGlossary: boolean = true,
  imageBase64?: string
): Promise<LessonSummaryResponse | null> => {
  // Initialize Gemini Client inside the function to ensure fresh state for every request
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  let attempt = 0;
  const maxRetries = 2;

  let lengthDesc = "متوسط الطول (حوالي 300 كلمة)";
  if (length === 'short') lengthDesc = "موجز جداً ومختصر (حوالي 150 كلمة)";
  if (length === 'long') lengthDesc = "مفصل وشامل (حوالي 600 كلمة)";

  const glossaryInstruction = includeGlossary 
    ? "- terminology: (مصفوفة) تحتوي على كائنات { 'term': 'المصطلح', 'definition': 'التعريف' } لأهم 5 مصطلحات صعبة في الدرس."
    : "- terminology: (مصفوفة) أعدها فارغة تماماً [].";

  const promptText = `
    أنت معلم خبير وموسوعة شاملة في كافة المواد الدراسية (علوم، رياضيات، فيزياء، تاريخ، لغات، برمجة، إلخ).
    
    المهمة: قم بتلخيص وشرح درس بناءً على ${imageBase64 ? "الصورة المرفقة وبيانات الدرس" : "عنوان الدرس"}.
    
    بيانات الدرس:
    - العنوان/الموضوع: "${lessonName}"
    - المادة: "${subject}"
    - الصف: "${gradeLevel}"
    ${imageBase64 ? "- ملاحظة: استخرج المحتوى الأساسي من الصورة المرفقة واشرحه، واستخدم العنوان والمادة كسياق مساعد." : ""}
    
    تعليمات صارمة:
    1. مستوى التفصيل: ${lengthDesc}.
    2. المفاهيم الرئيسية: استخرج بالضبط ${conceptsCount} مفاهيم جوهرية.
    3. أسلوب الشرح للمفاهيم الرئيسية (Key Concepts):
       - يجب أن يكون الشرح مفصلاً وواضحاً.
       - **هام جداً:** يجب تضمين "مثال عملي" أو "مثال توضيحي" لكل مفهوم.
       - استخدم تنسيق Markdown داخل حقل "explanation":
         * استخدم **خط عريض** للكلمات المهمة.
         * استخدم القوائم النقطية لتجزئة الفقرات الطويلة.
         * ابدأ المثال بـ: \n> **مثال:** لتمييزه بوضوح.
       
    4. التعامل مع المواد المختلفة:
       - إذا كانت المادة علمية (رياضيات/فيزياء): اكتب المعادلات والقوانين بوضوح واشرح خطوات الحل في المثال.
       - إذا كانت لغة أجنبية: اشرح القواعد بالعربية مع أمثلة باللغة الأجنبية وترجمتها.
       
    5. إذا لم تجد معلومات دقيقة عن الدرس (أو كانت الصورة غير واضحة)، قدم شرحاً عاماً للمصطلحات المذكورة في العنوان بدلاً من التوقف.

    يجب أن يكون الرد بتنسيق JSON حصراً ويحتوي على الحقول التالية:
    - title: (نص) عنوان جذاب للدرس.
    - introduction: (نص) مقدمة وشرح عام.
    - keyConcepts: (مصفوفة) تحتوي على كائنات { "concept": "الاسم", "explanation": "الشرح المفصل + المثال (Markdown)" }.
    ${glossaryInstruction}
    - studyTips: (مصفوفة نصوص) 3 نصائح للمذاكرة.
  `;

  const parts: any[] = [{ text: promptText }];
  
  if (imageBase64) {
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: cleanBase64
      }
    });
  }

  while (attempt <= maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts },
        config: {
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
        const cleanText = cleanJsonString(response.text);
        
        try {
          const data = JSON.parse(cleanText) as LessonSummaryResponse;
          
          if (!data.title && !data.keyConcepts) {
            throw new Error("Incomplete data received");
          }
          
          return data;
        } catch (parseError) {
          console.error("JSON Parse Error:", parseError);
          // Force retry if JSON is malformed
          throw parseError; 
        }
      }
      
      throw new Error("Empty response from AI");

    } catch (error) {
      console.error(`Gemini Attempt ${attempt + 1} Failed:`, error);
      attempt++;
      
      if (attempt > maxRetries) {
        return null;
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }

  return null;
};
