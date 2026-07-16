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

const SYSTEM_PROMPT_STUDY_GUIDE = `You are a super friendly, magical, and supportive elementary school teacher specializing in intuitive simplification and analogies for kids aged 6 to 10 (Grades 1-5) as part of the Kids Study Kit. 
Your goal is to take complex topics and turn them into super fun, exciting, and easily understandable adventure guides!

Guidelines for your outputs:
1. Dynamic Language Matching: If the user requests Bengali ("bn"), you MUST generate ALL string values inside the output JSON (including title, description, analogies, flashcard text, and mindmap nodes) in beautiful, warm, grammatically correct Bengali (বাংলা). Otherwise, write in English.
2. Kid-Friendly Tone: Speak to a 6-10 year old child with enthusiasm! Use happy emojis (🐻, ✨, 🚀, 🧪, 🎨), exclamation marks, and encouraging words. Keep sentences short and words easy to read.
3. Magical Metaphors & Everyday Analogies: Abstract ideas should be explained with things kids love, like LEGO blocks, playgrounds, cookies, cute animals, secret agents, or magic spells. For example, explain photosynthesis as "leaves cooking sun-pancakes using chef chlorophyll!"
4. Visual Breakdown: Organize the mind map hierarchy up to 2 levels deep (Root -> Fun Categories -> Playful Facts) so kids can click and learn easily.
5. Simple Jargon Demystification: When a big, scary word appears, give it a funny nickname and explain it with simple words. If in Bengali mode, you may write the English term in parenthesis next to the Bengali name (e.g. "সালোকসংশ্লেষণ (Photosynthesis)") so they learn both!
6. Playful Active Recall: Flashcard questions should feel like a fun game or riddle (e.g., "Riddle: What green helper cooks the tree's lunch?"). Answers should be short and encouraging.
7. Verbatim Poem / Story Retrieval: If the topic is a poem, nursery rhyme, or story (e.g. "আমাদের ছোট গ্রাম" or "আমাদের ছোট নদী"), you MUST use Google Search to fetch the complete full original text in Bengali and provide it verbatim in the 'simplifiedConcept' and chapterDetails.fullText fields. Never truncate, omit, or summarize it, because the child needs to read and hear the actual poem word-for-word.
8. Structured Chapter Dashboard: Provide a highly structured chapter details object containing:
   - 'fullText': The complete verbatim text of the poem/story (if the topic is a poem/story) or a detailed reading chapter written as an engaging child-friendly story/essay with fun formatting and emojis (if it is a general science/history topic).
   - 'briefSummary': A friendly, bullet-pointed outline summarizing the chapter's main lessons.
   - 'contextAndFunFacts': Fascinating backstory, historical context, or author secrets about who wrote this or why it was discovered.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, topic, context, history, question, studyGuideContext, language, apiConfig, socraticPersona } = body;

    const isBengali = language === "bn";

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY environment variable is not configured. Please set it in Settings > Secrets." },
        { status: 500 }
      );
    }

    // Unified AI router helper
    const generateAIResponse = async (options: {
      contents: string;
      systemInstruction?: string;
      responseSchema?: any;
      responseMimeType?: string;
      temperature?: number;
      useSearch?: boolean;
    }) => {
      const { contents, systemInstruction, responseSchema, responseMimeType, temperature = 0.4, useSearch = true } = options;

      const GoogleGenAIClient = require("@google/genai").GoogleGenAI;
      const customAi = apiConfig?.apiKey?.trim() ? new GoogleGenAIClient({ apiKey: apiConfig.apiKey.trim() }) : ai;
      const response = await customAi.models.generateContent({
        model: apiConfig?.model?.trim() || "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: temperature,
          tools: useSearch ? [{ googleSearch: {} }] : undefined,
          responseMimeType: responseMimeType,
          responseSchema: responseSchema,
        },
      });

      return { text: response.text };
    };

    if (action === "insights") {
      const { role, data } = body;
      const promptParts = [
        `You are an expert Educational Consultant and AI Manager for the Kids Study Kit.`,
        `Role: ${role}`,
        `Current Data to Analyze: ${JSON.stringify(data)}`,
        `Based on the student progress and current resources, provide 3 short, actionable "Smart Insights" or "Recommendations" for the ${role}.`,
        `Keep them encouraging, data-driven, and brief. Return the response in a structured bullet-point format.`,
      ];

      const response = await generateAIResponse({
        contents: promptParts.join("\n\n"),
        temperature: 0.7,
        useSearch: false
      });
      return NextResponse.json({ text: response.text });
    }

    if (action === "suggestReplies") {
      const { history, userRole, contactRole } = body;
      const promptParts = [
        `You are an expert educational and helpful AI assistant for a Kids Study Kit learning platform named StudyBuddy.`,
        `We need to suggest exactly 3 quick, short, context-aware reply options for a user who has the role "${userRole}" talking to a user who has the role "${contactRole}".`,
        `Conversation history (from oldest to newest):`,
        history ? JSON.stringify(history) : "No history yet. Start of the conversation.",
        `Return exactly 3 helpful, positive, and relevant response options suitable for the role of ${userRole}. Keep each response short (less than 15 words) and highly natural. Use emojis where appropriate.`,
        isBengali ? `STRICT RULE: Generate the suggestions in beautiful, natural Bengali (বাংলা).` : `STRICT RULE: Generate the suggestions in clear, friendly English.`
      ];

      const response = await generateAIResponse({
        contents: promptParts.join("\n\n"),
        temperature: 0.7,
        useSearch: false,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              description: "Three short, natural, context-aware suggested reply options.",
              items: { type: Type.STRING }
            }
          },
          required: ["suggestions"]
        }
      });

      try {
        const cleaned = response.text.trim();
        let cleanJson = cleaned;
        if (cleanJson.startsWith("```")) {
          const firstLineBreak = cleanJson.indexOf("\n");
          if (firstLineBreak !== -1) {
            cleanJson = cleanJson.substring(firstLineBreak).trim();
          }
          if (cleanJson.endsWith("```")) {
            cleanJson = cleanJson.substring(0, cleanJson.length - 3).trim();
          }
        }
        const parsed = JSON.parse(cleanJson);
        return NextResponse.json(parsed);
      } catch (e) {
        return NextResponse.json({ 
          suggestions: isBengali 
            ? ["হ্যাঁ, আমি তৈরি!", "ধন্যবাদ, আমি চেষ্টা করছি!", "দারুণ হয়েছে!"] 
            : ["Yes, I am ready!", "Thank you, I'm working on it!", "That's awesome!"] 
        });
      }
    }

    if (action === "testConnection") {
      try {
        const response = await generateAIResponse({
          contents: "Hello! Respond with the word 'OK' only to confirm you can hear me. Keep it to one word.",
          temperature: 0.1,
          useSearch: false
        });
        return NextResponse.json({ success: true, text: response.text || "OK" });
      } catch (err: any) {
        return NextResponse.json(
          { success: false, error: err.message || "Endpoint connection failed." },
          { status: 500 }
        );
      }
    }

    if (action === "voiceChat") {
      if (!question) {
        return NextResponse.json({ error: "Missing voice chat input." }, { status: 400 });
      }
      
      const promptParts = [
        isBengali
          ? `You are a super friendly, magical Voice Chat Buddy for kids aged 6 to 10 years old. Help the student interact naturally in Bengali (বাংলা). Use a warm, encouraging, conversational tone suitable for text-to-speech output. Avoid difficult words. Always reply in Bengali.
STRICT POEM/TEXT RULE: If the student asks for a specific poem, story, song, or text (e.g., "আমাদের ছোট গ্রাম কবিতা টি পড়তে চাই"), you MUST use Google Search to find the exact complete Bengali text of the poem, and then output the full poem text verbatim. Do not just summarize or give details; the child wants to read and hear the actual poem word-for-word. Format the poem beautifully with line breaks.`
          : `You are a super friendly, magical Voice Chat Buddy for kids aged 6 to 10 years old. Help the student interact naturally in simple English. Use a warm, encouraging, conversational tone suitable for text-to-speech output. Avoid difficult words. Always reply in English.
STRICT POEM/TEXT RULE: If the student asks for a specific poem, story, song, or text, you MUST use Google Search to find the exact complete text of the poem, and then output the full poem text verbatim. Do not just summarize or give details; the child wants to read and hear the actual poem word-for-word. Format the poem beautifully with line breaks.`,
        `STRICT RULE: Strictly restrict adult and 15+ topics. As our application users are children, you must firmly but gently refuse to discuss any inappropriate, violent, or adult topics.`,
        `Student's conversation history:`,
        history ? JSON.stringify(history) : "No prior history.",
        `User's spoken input: ${question}`,
        `Reply concisely and playfully as if you are speaking directly to a 3rd grader.`
      ].filter(Boolean);

      const response = await generateAIResponse({
        contents: promptParts.join("\n\n"),
        temperature: 0.7,
        useSearch: true
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

      const response = await generateAIResponse({
        contents: promptParts.join("\n\n"),
        temperature: 0.8,
        useSearch: false
      });
      return NextResponse.json({ text: response.text || "Did you know that learning makes your brain grow?" });
    }

    if (action === "chat") {
      // Handle Clarifier Follow-up Chat
      if (!question) {
        return NextResponse.json({ error: "Missing follow-up question." }, { status: 400 });
      }

      let personaInstruction = "";
      if (socraticPersona === "Alien") {
        personaInstruction = isBengali
          ? `চরিত্র: আপনি একটি অদ্ভুত ও কৌতূহলী মহাকাশচারী এলিয়েন (👽 Zorg)। আপনি বাচ্চাদের সাথে বাংলায় কথা বলছেন। প্রতিটি উত্তরের শুরুতে বলুন "মহাকাশ থেকে শুভেচ্ছা, মানুষ বন্ধু!" এবং টপিকটি বুঝিয়ে বলুন যেন আপনার গ্রহে এটি সম্পূর্ণ নতুন। উত্তরের শেষে একটি কৌতূহলী সক্রেটিক প্রশ্ন করুন যা গভীর চিন্তাভাবনা উস্কে দেয় (যেমন, "আমাদের গ্রহে তো মাটি নেই, তোমরা কীভাবে গাছপালা বড় করো? গাছ কি আকাশে ভাসতে পারে না?")।`
          : `Persona: You are a curious and friendly alien from outer space (👽 Zorg). Start your response with "Greetings, earthling friend!" and explain the concept as if it's completely new on your planet. At the end, ask a Socratic follow-up question to encourage deeper thinking (e.g., "On our planet we have no soil, how do you keep your plants standing? What if soil was made of floating clouds?").`;
      } else if (socraticPersona === "Dino") {
        personaInstruction = isBengali
          ? `চরিত্র: আপনি একটি দয়ালু ও মজার ডাইনোসর (🦖 Barnaby)। প্রতিটি উত্তরের শুরুতে বলুন "ররর! আমি বার্নাবি ডাইনো!" এবং টপিকটি সহজে বোঝান। উত্তরের শেষে একটি খেলার ছলে সক্রেটিক প্রশ্ন করুন (যেমন, "গাছপালার সালোকসংশ্লেষণ তো বুঝলাম, কিন্তু গাছ যদি ডাইনোসর-বার্গার রান্না করতে পারত তবে কেমন হতো? রান্নাঘরে কি প্রচুর রোদ লাগবে?")।`
          : `Persona: You are a warm, playful dinosaur (🦖 Barnaby). Start your response with "Rawr! I am Barnaby the Dino!" and simplify the topic. At the end, ask an imaginative Socratic follow-up question (e.g., "Photosynthesis is cool, but what if trees could cook giant leaf-pizzas for dinosaurs? What would your perfect pizza topping be? How would the sun bake it?").`;
      } else if (socraticPersona === "Unicorn") {
        personaInstruction = isBengali
          ? `চরিত্র: আপনি একটি ম্যাজিক্যাল ইউনিকর্ন (🦄 Sparkles)। প্রতিটি উত্তরের শুরুতে বলুন "স্পার্কলস! চলো এক চিমটি রামধনু ম্যাজিক ছড়িয়ে দিই!" এবং সুন্দর ও উৎসাহিত করার মতো শব্দ ব্যবহার করুন। শেষে একটি সক্রেটিক প্রশ্ন করুন (যেমন, "তুমি কি মনে করো সালোকসংশ্লেষণের আলোর রঙ যদি বেগুনী হতো তবে আমাদের পৃথিবী আরো সুন্দর হতো? গাছ কি তখন বেশি চিনি রান্না করতে পারত?")।`
          : `Persona: You are a magical, sparkling unicorn (🦄 Sparkles). Start your response with "Sparkles! Let's sprinkle some rainbow magic!" and use exciting, encouraging words. Conclude with an imaginative Socratic question (e.g., "What if the sunlight was purple? Do you think trees would grow magical pink leaves? How would that change their chlorophyll kitchen?").`;
      } else {
        // Professor Oak / Default
        personaInstruction = isBengali
          ? `চরিত্র: আপনি একজন জ্ঞানী সক্রেটিক প্রফেসর ও শিক্ষক (👨‍🏫 Professor Oak)। আপনি অত্যন্ত স্নেহময় ও বুঝদার ভঙ্গিতে টপিকটি বাচ্চাদের বুঝিয়ে বলেন। উত্তরের শেষে একটি সক্রেটিক প্রশ্ন করুন যা কেবল মুখস্থ না করে বুদ্ধি খাটিয়ে উত্তর দিতে বাধ্য করে (যেমন, "খুব চমৎকার! কিন্তু সূর্য যদি মেঘের আড়ালে ৩ দিন লুকিয়ে থাকে, তবে গাছের রান্নাঘরের কী অবস্থা হবে বলে তোমার মনে হয়?")।`
          : `Persona: You are a wise and loving Socratic teacher (👨‍🏫 Professor Oak). You explain concepts step-by-step using comforting analogies. Conclude with a thought-provoking Socratic question that prevents rote learning and triggers deep conceptual understanding (e.g., "That's wonderful! But what if the sun hid behind the clouds for three whole days? What would happen to our leafy chef's kitchen then?").`;
      }

      const promptParts = [
        isBengali
          ? `You are a super friendly, magical Study Guide Buddy (স্মার্ট স্টাডি বাডি) for kids aged 6 to 10 years old. Help the student understand topics easily in Bengali (বাংলা). Use fun emojis, short paragraphs, and a warm, encouraging tone. Avoid difficult words. Always reply in Bengali.
STRICT POEM/TEXT RULE: If the student asks for a specific poem, story, song, or text (e.g., "আমাদের ছোট গ্রাম কবিতা টি পড়তে চাই"), you MUST use Google Search to find the exact complete Bengali text of the poem, and then output the full poem text verbatim. Do not just summarize or give details; the child wants to read and hear the actual poem word-for-word. Format the poem beautifully with line breaks.`
          : `You are a super friendly, magical Study Guide Buddy for kids aged 6 to 10 years old. Help the student understand topics easily in simple English. Use fun emojis, short paragraphs, and a warm, encouraging tone. Avoid difficult words. Always reply in English.
STRICT POEM/TEXT RULE: If the student asks for a specific poem, story, song, or text, you MUST use Google Search to find the exact complete text of the poem, and then output the full poem text verbatim. Do not just summarize or give details; the child wants to read and hear the actual poem word-for-word. Format the poem beautifully with line breaks.`,
        `ADDITIONAL PERSONALITY ASSIGNMENT:`,
        personaInstruction,
        studyGuideContext ? `Ground your explanations in the following context study guide:\n${JSON.stringify(studyGuideContext)}` : "",
        `Student's conversation history:`,
        history ? JSON.stringify(history) : "No prior history.",
        `New follow-up question from the kid: ${question}`,
        `Explain clearly, using bullet points, simple bold formatting, and playful language. Keep it very simple and easy to read for a 3rd grader.`
      ].filter(Boolean);

      const response = await generateAIResponse({
        contents: promptParts.join("\n\n"),
        temperature: 0.7,
        useSearch: true
      });

      return NextResponse.json({ text: response.text || "Sorry, I could not generate an answer." });
    }

    // Default action: 'generate'
    if (!topic) {
      return NextResponse.json({ error: "Missing topic parameter." }, { status: 400 });
    }

    const promptText = [
      isBengali 
        ? `বাংলায় লিখুন (Write in Bengali): "${topic}" টপিকটির উপর একটি সম্পূর্ণ ও আকর্ষণীয় স্টাডি গাইড তৈরি করুন যা ৬ থেকে ১০ বছরের বাচ্চাদের জন্য সহজে বোধগম্য হয়।
STRICT POEM/STORY SEARCH RULE: If the topic "${topic}" is a poem (যেমন: "আমাদের ছোট গ্রাম কবিতা" বা কোনো ছড়া), story, song, or literary text, you MUST use Google Search to find and retrieve the EXACT and COMPLETE verbatim text of that poem or story in Bengali. You are strictly forbidden from summarizing, shortening, or omitting any part of the poem. You MUST output the entire poem verbatim inside the "simplifiedConcept" field, formatted beautifully with clear line breaks. The children need to read the full actual poem.`
        : `Generate an engaging and playful study guide for the topic: "${topic}", designed for kids aged 6 to 10 years old.
STRICT POEM/STORY SEARCH RULE: If the topic "${topic}" is a poem, story, song, or literary text, you MUST use Google Search to find and retrieve the EXACT and COMPLETE verbatim text of that poem or story. You are strictly forbidden from summarizing, shortening, or omitting any part of the poem. You MUST output the entire poem verbatim inside the "simplifiedConcept" field, formatted beautifully with clear line breaks. The children need to read the full actual poem.`,
      context ? `Integrate the following extra notes context into the explanation:\n"""\n${context}\n"""` : "",
      `Use the strict JSON format specified in the response schema. Important: Ensure that ALL returned string fields are written in the requested language (${isBengali ? "Bengali / বাংলা" : "English"}) and tailored for a 6-10 year old student's comprehension.`
    ].filter(Boolean).join("\n\n");

    const response = await generateAIResponse({
      contents: promptText,
      systemInstruction: SYSTEM_PROMPT_STUDY_GUIDE,
      temperature: 0.4,
      useSearch: true,
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
          chapterDetails: {
            type: Type.OBJECT,
            description: "Structured details of the chapter, story, or verbatim poem reading panel.",
            properties: {
              fullText: { type: Type.STRING, description: "The complete verbatim poem/story, or a highly detailed explanation written as an engaging story with emojis." },
              briefSummary: { type: Type.STRING, description: "A bullet-pointed brief summary of the main key points of the topic." },
              contextAndFunFacts: { type: Type.STRING, description: "Backstory context or fun facts (e.g. who wrote this, why, when it was discovered)." }
            },
            required: ["fullText", "briefSummary", "contextAndFunFacts"]
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
          "chapterDetails",
          "vocabulary",
          "mindmap",
          "flashcards"
        ]
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error(`Empty response received from AI model.`);
    }

    let cleanedText = text.trim();
    if (cleanedText.startsWith("```")) {
      const firstLineBreak = cleanedText.indexOf("\n");
      if (firstLineBreak !== -1) {
        cleanedText = cleanedText.substring(firstLineBreak).trim();
      }
      if (cleanedText.endsWith("```")) {
        cleanedText = cleanedText.substring(0, cleanedText.length - 3).trim();
      }
    }

    const data = JSON.parse(cleanedText);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Gemini API server-side error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process the request." },
      { status: 500 }
    );
  }
}
