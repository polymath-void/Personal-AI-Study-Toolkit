const fs = require('fs');
let code = fs.readFileSync('components/StudyGuideApp.tsx', 'utf-8');

const effectsToAdd = `
  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setVoiceChatInput(transcript);
          setIsListening(false);
          // Auto-submit after voice input
          handleVoiceChatSubmit(transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, [appLanguage]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.lang = appLanguage === "bn" ? "bn-BD" : "en-US";
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Speech recognition is not supported in your browser.");
      }
    }
  };

  const handleVoiceChatSubmit = async (textToSubmit?: string) => {
    const text = typeof textToSubmit === "string" ? textToSubmit : voiceChatInput;
    if (!text.trim()) return;

    const newUserMsg = { role: "user" as const, text };
    setVoiceChatHistory((prev) => [...prev, newUserMsg]);
    setVoiceChatInput("");
    setIsVoiceChatting(true);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "voiceChat",
          question: text,
          history: voiceChatHistory,
          language: appLanguage
        }),
      });

      if (!response.ok) throw new Error("Failed to get voice chat response");
      
      const data = await response.json();
      setVoiceChatHistory((prev) => [...prev, { role: "bot", text: data.text }]);
      speakText(data.text);
    } catch (error) {
      console.error(error);
      setVoiceChatHistory((prev) => [
        ...prev,
        { role: "bot", text: appLanguage === "en" ? "Oops! Something went wrong. Let's try again!" : "উফ! কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করি!" }
      ]);
    } finally {
      setIsVoiceChatting(false);
    }
  };
`;

code = code.replace('// Web Audio Synth Chime', effectsToAdd + '\n  // Web Audio Synth Chime');
fs.writeFileSync('components/StudyGuideApp.tsx', code);
