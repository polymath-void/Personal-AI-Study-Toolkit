sed -i 's/model: "gemini-3.5-flash",/model: apiConfig?.model?.trim() || "gemini-3.5-flash",/g' app/api/gemini/route.ts
