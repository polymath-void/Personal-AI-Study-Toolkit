const fs = require('fs');
let code = fs.readFileSync('components/StudyGuideApp.tsx', 'utf-8');

// Add states
const statesToAdd = `
  // Voice Chat States
  const [voiceChatHistory, setVoiceChatHistory] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const [voiceChatInput, setVoiceChatInput] = useState("");
  const [isVoiceChatting, setIsVoiceChatting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // Did You Know Modal States
  const [showDidYouKnow, setShowDidYouKnow] = useState(false);
  const [didYouKnowFact, setDidYouKnowFact] = useState("");
  const [isFetchingFact, setIsFetchingFact] = useState(false);
  const [hasShownFactForCurrentDeck, setHasShownFactForCurrentDeck] = useState(false);
`;

code = code.replace('const [voicePersona, setVoicePersona] = useState<"teacher" | "robot" | "kid">("teacher");', 'const [voicePersona, setVoicePersona] = useState<"teacher" | "robot" | "kid">("teacher");\n' + statesToAdd);

fs.writeFileSync('components/StudyGuideApp.tsx', code);
