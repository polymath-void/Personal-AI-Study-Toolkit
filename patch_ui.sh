sed -i '/<option value="openai">OpenAI (Custom Key or Proxy)<\/option>/d' components/StudyGuideApp.tsx
sed -i '/<option value="groq">Groq Cloud (Custom Key or Proxy)<\/option>/d' components/StudyGuideApp.tsx
sed -i '/<option value="deepseek">DeepSeek AI (Custom Key or Proxy)<\/option>/d' components/StudyGuideApp.tsx
sed -i '/<option value="openrouter">OpenRouter (Custom Key or Proxy)<\/option>/d' components/StudyGuideApp.tsx
sed -i '/<option value="custom">Custom Endpoint (Ollama \/ Local LLM \/ Others)<\/option>/d' components/StudyGuideApp.tsx
