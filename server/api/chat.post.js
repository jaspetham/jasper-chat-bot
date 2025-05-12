import { GoogleGenAI } from "@google/genai";

// This is a server-side file.
// It will handle requests to /api/chat (POST method)

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const apiKey = config.private.apiKey;
  const ai = new GoogleGenAI({ apiKey });
  const selectedModel = "gemini-2.0-flash-001";
  if (!apiKey) {
    // Set HTTP status code for the error
    setResponseStatus(event, 500);
    return {
      error: true,
      message:
        "API key not configured. Please set GEMINI_API_KEY in your .env file.",
    };
  }

  // Get the user's message and history from the request body
  const body = await readBody(event);
  const userMessage = body.message;
  const history = body.history || []; // Expecting history in the format: [{ role: "user"/"model", parts: [{text: "..."}] }]

  if (!userMessage) {
    setResponseStatus(event, 400); // Bad Request
    return {
      error: true,
      message: "No message provided in the request.",
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: userMessage,
      history: history,
      config: {
        maxOutputTokens: 1500,
        temperature: 0.9,
      },
    });
    const reponseText = response.candidates[0].content.parts[0].text;
    return {
      reply: reponseText,
    };
  } catch (error) {
    console.error("Error calling Google Generative AI:", error);
    // Check if the error is from the API itself (e.g. safety settings, prompt blocked)
    let errorMessage = "Failed to get a response from the AI.";
    if (error.message) {
      errorMessage = error.message;
    }
    // You might want to inspect 'error.response' or 'error.message' for more details from the SDK
    // For example, if the prompt was blocked due to safety settings.
    if (
      error.response &&
      error.response.promptFeedback &&
      error.response.promptFeedback.blockReason
    ) {
      errorMessage = `Your message was blocked. Reason: ${error.response.promptFeedback.blockReason}. Please rephrase your message.`;
    }

    setResponseStatus(event, 500); // Internal Server Error
    return {
      error: true,
      message: errorMessage,
    };
  }
});
