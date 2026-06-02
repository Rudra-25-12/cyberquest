const MODEL_NAME = "gemini-2.5-flash";

/**
 * Check if the configured model is available for the given API key.
 * @param {string} apiKey - The Gemini API key.
 * @param {string} modelName - The model name (e.g., "gemini-2.5-flash").
 * @returns {Promise<boolean>} True if available, false otherwise.
 */
async function checkModelAvailability(apiKey, modelName) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!response.ok) return true; // Fail-safe: if list endpoint fails, proceed to generateContent
    const data = await response.json();
    const models = data.models || [];
    return models.some(m => m.name === `models/${modelName}` || m.name === modelName);
  } catch {
    return true; // Fail-safe
  }
}

/**
 * Generate a security awareness challenge using Gemini.
 * @param {string} topic - The topic of the challenge.
 * @param {string} difficulty - The difficulty level (Easy, Medium, Hard).
 * @returns {Promise<Object>} The parsed, validated challenge JSON.
 */
export async function generateChallenge(topic, difficulty) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please define VITE_GEMINI_API_KEY in your .env file.");
  }

  // Model availability check
  const isAvailable = await checkModelAvailability(apiKey, MODEL_NAME);
  if (!isAvailable) {
    throw new Error(`The model '${MODEL_NAME}' is not available or supported by your Gemini API key credentials in this region. Please try another model.`);
  }

  const prompt = `Generate a cybersecurity challenge under the topic: "${topic}" and difficulty level: "${difficulty}".`;

  const systemInstruction = `You are an expert cybersecurity awareness educator. Your goal is to write realistic training scenarios that teach students how to identify risks and make safe defensive decisions in everyday situations.

For the requested topic and difficulty level, generate exactly one scenario.

### Content Style Rules:
1. Use plain English and avoid corporate jargon.
2. Avoid excessive storytelling or long paragraphs.
3. Avoid security buzzwords unless necessary.
4. Write for students and beginners, matching the friendly, educational tone of Security Fundamentals.
5. LEVELING: Adjust scenarios to match the requested difficulty:
   - Easy: The indicators are obvious.
   - Medium: The threat uses lookalikes, urgency pressure, or subtle policy violations.
   - Hard: The threat replicates spear phishing, targeted social engineering, or multi-step logic checks.
6. SAFETY: Never generate actual hacking code, malicious exploits, or guides on how to attack systems.

### Constraints:
1. FORMAT: Return strictly valid JSON matching the requested schema. Do not enclose the output in markdown block wrappers (do not write \`\`\`json ... \`\`\`).
2. Renders exactly two choices representing scenario-specific actions.
3. The scenario body text must be 80-150 words maximum. Simple language, easy to scan.
4. The question must be one clear decision question.

JSON Schema:
{
  "title": "Short scenario title",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "scenario": "80-150 words maximum. Simple language. Student-friendly. Easy to scan.",
  "question": "One clear decision question.",
  "choices": [
    "Short option A",
    "Short option B"
  ],
  "correctAnswer": 0,
  "explanation": "2-4 sentence educational explanation."
}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ],
    systemInstruction: {
      parts: [
        { text: systemInstruction }
      ]
    },
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;
  const response = await fetch(`${apiEndpoint}?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    let parsedErr;
    try {
      parsedErr = JSON.parse(errText);
    } catch {
      parsedErr = null;
    }
    const errMsg = parsedErr?.error?.message || response.statusText || "Network request failed";
    throw new Error(`Gemini API Error: ${errMsg}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error("Malformed response from Gemini: No content returned.");
  }

  // Parse JSON and validate
  let challenge;
  try {
    challenge = JSON.parse(rawText.trim());
  } catch (e) {
    throw new Error(`Malformed response from Gemini: Unable to parse returned text as JSON. Raw output: ${rawText.substring(0, 100)}...`, { cause: e });
  }

  // Validate schema keys and contents
  const requiredKeys = ["title", "topic", "difficulty", "scenario", "question", "choices", "correctAnswer", "explanation"];
  for (const key of requiredKeys) {
    if (!(key in challenge)) {
      throw new Error(`Malformed response from Gemini: Missing required key "${key}".`);
    }
  }

  if (!Array.isArray(challenge.choices) || challenge.choices.length !== 2) {
    throw new Error("Malformed response from Gemini: 'choices' must be an array of exactly 2 items.");
  }

  if (challenge.correctAnswer !== 0 && challenge.correctAnswer !== 1) {
    throw new Error("Malformed response from Gemini: 'correctAnswer' must be 0 or 1.");
  }

  for (const choice of challenge.choices) {
    if (typeof choice !== "string" || choice.trim().length <= 3) {
      throw new Error("Malformed response from Gemini: Choice labels must be valid strings longer than 3 characters.");
    }
  }

  return challenge;
}
