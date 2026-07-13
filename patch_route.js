const fs = require('fs');
let code = fs.readFileSync('app/api/gemini/route.ts', 'utf-8');

const additionalActions = `
    if (action === "voiceChat") {
      if (!question) {
        return NextResponse.json({ error: "Missing voice chat input." }, { status: 400 });
      }
      
      const promptParts = [
        isBengali
          ? \`You are a super friendly, magical Voice Chat Buddy for kids aged 6 to 10 years old. Help the student interact naturally in Bengali (বাংলা). Use a warm, encouraging, conversational tone suitable for text-to-speech output. Avoid difficult words. Always reply in Bengali.\`
          : \`You are a super friendly, magical Voice Chat Buddy for kids aged 6 to 10 years old. Help the student interact naturally in simple English. Use a warm, encouraging, conversational tone suitable for text-to-speech output. Avoid difficult words. Always reply in English.\`,
        \`STRICT RULE: Strictly restrict adult and 15+ topics. As our application users are children, you must firmly but gently refuse to discuss any inappropriate, violent, or adult topics.\`,
        \`Student's conversation history:\`,
        history ? JSON.stringify(history) : "No prior history.",
        \`User's spoken input: \${question}\`,
        \`Reply concisely and playfully as if you are speaking directly to a 3rd grader.\`
      ].filter(Boolean);

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptParts.join("\\n\\n"),
        config: {
          temperature: 0.7,
        },
      });
      return NextResponse.json({ text: response.text || "Sorry, I could not generate an answer." });
    }

    if (action === "didYouKnow") {
      const promptParts = [
        isBengali
          ? \`বাংলায় লিখুন (Write in Bengali). You are a magical Study Buddy providing a fun fact for kids aged 6-10.\`
          : \`You are a magical Study Buddy providing a fun fact for kids aged 6-10.\`,
        \`Generate a random fascinating, mind-blowing scientific fact related to the topic: "\${topic}".\`,
        \`Keep it to 2-3 sentences max. Use emojis. Make it sound exciting!\`
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptParts.join("\\n\\n"),
        config: {
          temperature: 0.8,
        },
      });
      return NextResponse.json({ text: response.text || "Did you know that learning makes your brain grow?" });
    }
`;

code = code.replace("if (action === \"chat\") {", additionalActions + "\n    if (action === \"chat\") {");
fs.writeFileSync('app/api/gemini/route.ts', code);
