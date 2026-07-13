const fs = require('fs');
let code = fs.readFileSync('components/StudyGuideApp.tsx', 'utf-8');

code = code.replace('const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;', 'const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;');

fs.writeFileSync('components/StudyGuideApp.tsx', code);
