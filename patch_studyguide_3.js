const fs = require('fs');
let code = fs.readFileSync('components/StudyGuideApp.tsx', 'utf-8');

const fetchDidYouKnowFn = `
  const fetchDidYouKnow = async () => {
    if (!activeGuide) return;
    setIsFetchingFact(true);
    setShowDidYouKnow(true);
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "didYouKnow",
          topic: activeGuide.topicName,
          language: appLanguage
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDidYouKnowFact(data.text);
        speakText(data.text);
      }
    } catch (e) {
      console.error(e);
      setDidYouKnowFact(appLanguage === "en" ? "Did you know that science is all around us?" : "তুমি কি জানো যে বিজ্ঞান আমাদের চারপাশেই আছে?");
    } finally {
      setIsFetchingFact(false);
    }
  };

  useEffect(() => {
    if (activeGuide && activeTab === "flashcards") {
      const totalCardsCount = activeGuide.flashcards?.length || 0;
      const masteredCount = Object.values(cardStatus).filter((s) => s === "correct").length;
      const isAllMastered = totalCardsCount > 0 && masteredCount === totalCardsCount;

      if (isAllMastered && !hasShownFactForCurrentDeck) {
        setHasShownFactForCurrentDeck(true);
        fetchDidYouKnow();
      }
    }
  }, [cardStatus, activeGuide, activeTab, hasShownFactForCurrentDeck]);

  // Reset flag when guide changes
  useEffect(() => {
    setHasShownFactForCurrentDeck(false);
    setShowDidYouKnow(false);
    setDidYouKnowFact("");
  }, [activeGuide?.id]);
`;

code = code.replace('// Play Alert Chime', fetchDidYouKnowFn + '\n  // Play Alert Chime');
fs.writeFileSync('components/StudyGuideApp.tsx', code);
