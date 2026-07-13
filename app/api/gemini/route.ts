import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

// Initialize server-side Google GenAI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const SYSTEM_PROMPT_STUDY_GUIDE = `You are a super friendly, magical, and supportive elementary school teacher specializing in the Feynman Technique for kids aged 6 to 10 (Grades 1-5). 
Your goal is to take complex topics and turn them into super fun, exciting, and easily understandable adventure guides!

Guidelines for your outputs:
1. Dynamic Language Matching: If the user requests Bengali ("bn"), you MUST generate ALL fields in the output JSON in beautiful, warm, grammatically correct Bengali (বাংলা). Otherwise, write in English.
2. Kid-Friendly Tone: Speak to a 6-10 year old child with enthusiasm! Use happy emojis (🐻, ✨, 🚀, 🧪, 🎨), exclamation marks, and encouraging words. Keep sentences short and words easy to read.
3. Magical Metaphors & Everyday Analogies: Abstract ideas should be explained with things kids love, like LEGO blocks, playgrounds, cookies, cute animals, secret agents, or magic spells. For example, explain photosynthesis as "leaves cooking sun-pancakes using chef chlorophyll!"
4. Visual Breakdown: Organize the mind map hierarchy up to 2 levels deep (Root -> Fun Categories -> Playful Facts) so kids can click and learn easily.
5. Simple Jargon Demystification: When a big, scary word appears, give it a funny nickname and explain it with simple words. If in Bengali mode, you may write the English term in parenthesis next to the Bengali name (e.g. "সালোকসংশ্লেষণ (Photosynthesis)") so they learn both!
6. Playful Active Recall: Flashcard questions should feel like a fun game or riddle (e.g., "Riddle: What green helper cooks the tree's lunch?"). Answers should be short and encouraging.`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY environment variable is not configured. Please set it in Settings > Secrets." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { action, topic, context, history, question, studyGuideContext, language } = body;

    const isBengali = language === "bn";

    
    if (action === "voiceChat") {
      if (!question) {
        return NextResponse.json({ error: "Missing voice chat input." }, { status: 400 });
      }
      
      const promptParts = [
        isBengali
          ? `You are a super friendly, magical Voice Chat Buddy for kids aged 6 to 10 years old. Help the student interact naturally in Bengali (বাংলা). Use a warm, encouraging, conversational tone suitable for text-to-speech output. Avoid difficult words. Always reply in Bengali.`
          : `You are a super friendly, magical Voice Chat Buddy for kids aged 6 to 10 years old. Help the student interact naturally in simple English. Use a warm, encouraging, conversational tone suitable for text-to-speech output. Avoid difficult words. Always reply in English.`,
        `STRICT RULE: Strictly restrict adult and 15+ topics. As our application users are children, you must firmly but gently refuse to discuss any inappropriate, violent, or adult topics.`,
        `Student's conversation history:`,
        history ? JSON.stringify(history) : "No prior history.",
        `User's spoken input: ${question}`,
        `Reply concisely and playfully as if you are speaking directly to a 3rd grader.`
      ].filter(Boolean);

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptParts.join("\n\n"),
        config: {
          temperature: 0.7,
        },
      });
      return NextResponse.json({ text: response.text || "Sorry, I could not generate an answer." });
    }

    if (action === "didYouKnow") {
      const promptParts = [
        isBengali
          ? `বাংলায় লিখুন (Write in Bengali). You are a magical Study Buddy providing a fun fact for kids aged 6-10.`
          : `You are a magical Study Buddy providing a fun fact for kids aged 6-10.`,
        `Generate a random fascinating, mind-blowing scientific fact related to the topic: "${topic}".`,
        `Keep it to 2-3 sentences max. Use emojis. Make it sound exciting!`
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptParts.join("\n\n"),
        config: {
          temperature: 0.8,
        },
      });
      return NextResponse.json({ text: response.text || "Did you know that learning makes your brain grow?" });
    }

    if (action === "chat") {
      // Handle Clarifier Follow-up Chat
      if (!question) {
        return NextResponse.json({ error: "Missing follow-up question." }, { status: 400 });
      }

      const promptParts = [
        isBengali
          ? `You are a super friendly, magical Study Guide Buddy (ফেইম্যান স্টাডি বাডি) for kids aged 6 to 10 years old. Help the student understand topics easily in Bengali (বাংলা). Use fun emojis, short paragraphs, and a warm, encouraging tone. Avoid difficult words. Always reply in Bengali.`
          : `You are a super friendly, magical Study Guide Buddy for kids aged 6 to 10 years old. Help the student understand topics easily in simple English. Use fun emojis, short paragraphs, and a warm, encouraging tone. Avoid difficult words. Always reply in English.`,
        studyGuideContext ? `Ground your explanations in the following context study guide:\n${JSON.stringify(studyGuideContext)}` : "",
        `Student's conversation history:`,
        history ? JSON.stringify(history) : "No prior history.",
        `New follow-up question from the kid: ${question}`,
        `Explain clearly, using bullet points, simple bold formatting, and playful language. Keep it very simple and easy to read for a 3rd grader.`
      ].filter(Boolean);

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptParts.join("\n\n"),
        config: {
          temperature: 0.7,
        },
      });

      return NextResponse.json({ text: response.text || "Sorry, I could not generate an answer." });
    }

    // Default action: 'generate'
    if (!topic) {
      return NextResponse.json({ error: "Missing topic parameter." }, { status: 400 });
    }

    const promptText = [
      isBengali 
        ? `বাংলায় লিখুন (Write in Bengali): "${topic}" টপিকটির উপর একটি সম্পূর্ণ ও আকর্ষণীয় স্টাডি গাইড তৈরি করুন যা ৬ থেকে ১০ বছরের বাচ্চাদের জন্য সহজে বোধগম্য হয়।`
        : `Generate an engaging and playful study guide for the topic: "${topic}", designed for kids aged 6 to 10 years old.`,
      context ? `Integrate the following extra notes context into the explanation:\n"""\n${context}\n"""` : "",
      `Use the strict JSON format specified in the response schema. Important: Ensure that ALL returned string fields are written in the requested language (${isBengali ? "Bengali / বাংলা" : "English"}) and tailored for a 6-10 year old student's comprehension.`
    ].filter(Boolean).join("\n\n");

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: SYSTEM_PROMPT_STUDY_GUIDE,
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topicName: {
              type: Type.STRING,
              description: "The playful name or title of the study guide topic in the requested language."
            },
            simplifiedConcept: {
              type: Type.STRING,
              description: "A magical, super simple, easy-to-digest explanation of the core concept. Tailored for ages 6-10 with happy emojis."
            },
            analogy: {
              type: Type.STRING,
              description: "An unforgettable, kid-friendly analogy comparing this topic to a game, toy, or fun animal experience."
            },
            vocabulary: {
              type: Type.ARRAY,
              description: "Glossary of scary words made simple and friendly.",
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING, description: "The technical term. If in Bengali mode, you may include the English spelling in parenthesis, e.g., 'ক্লোরোফিল (Chlorophyll)'." },
                  simpleDefinition: { type: Type.STRING, description: "A super simple, cute explanation of what this word means." }
                },
                required: ["term", "simpleDefinition"]
              }
            },
            tags: {
              type: Type.ARRAY,
              description: "Suggested high-level educational tags in the requested language (e.g. বিজ্ঞান / Science, খেলাধুলা / Sports). Limit to 2 or 3.",
              items: {
                type: Type.STRING
              }
            },
            mindmap: {
              type: Type.OBJECT,
              description: "A playful logical tree representation for interactive mind map.",
              properties: {
                name: { type: Type.STRING, description: "The core main topic." },
                description: { type: Type.STRING, description: "Super short summary of the main topic node." },
                children: {
                  type: Type.ARRAY,
                  description: "Branch categories (typically 3 to 4 branches).",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "The sub-topic title." },
                      description: { type: Type.STRING, description: "Cute takeaway for this sub-topic." },
                      children: {
                        type: Type.ARRAY,
                        description: "Atomic detail facts for kids (typically 2 to 3 facts).",
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING, description: "Detail node title." },
                            description: { type: Type.STRING, description: "Fun, clear explanation for a child." }
                          },
                          required: ["name", "description"]
                        }
                      }
                    },
                    required: ["name", "description"]
                  }
                }
              },
              required: ["name", "description"]
            },
            flashcards: {
              type: Type.ARRAY,
              description: "Interactive active recall riddles or questions for children.",
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "Fun question or riddle for children." },
                  answer: { type: Type.STRING, description: "The encouraging, super simple answer." }
                },
                required: ["question", "answer"]
              }
            }
          },
          required: [
            "topicName",
            "simplifiedConcept",
            "analogy",
            "vocabulary",
            "mindmap",
            "flashcards"
          ]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from Gemini.");
    }

    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Gemini API server-side error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process the request." },
      { status: 500 }
    );
  }
}
