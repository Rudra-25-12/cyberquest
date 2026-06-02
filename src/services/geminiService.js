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

### Constraints:
1. FORMAT: You must return strictly valid JSON matching the requested schema. Do not enclose the output in markdown block wrappers (e.g. do not write \`\`\`json ... \`\`\`) if raw JSON is requested. Ensure all strings are properly escaped.
2. CHOICE SCHEME: Renders exactly two choices: choice "A" and choice "B". The labels must represent scenario-specific actions (e.g. "Plug in the drive" vs "Hand to security"). Never use generic labels like "Secure", "Risky", "Yes", "No", "Safe", "Unsafe", "True", "False".
3. LEVELING: Adjust scenarios to match the requested difficulty:
   - Easy: The indicators are obvious (typos, standard guidelines).
   - Medium: The threat uses lookalikes, urgency pressure, or subtle policy violations.
   - Hard: The threat replicates spear phishing, targeted social engineering, or multi-step logic checks.
4. TONE: Educational, objective, and student-friendly. Avoid overly technical or forensic jargon (no WHOIS/TLS certificate validation unless directly relevant).
5. SAFETY: Never generate actual hacking code, malicious exploits, or guides on how to attack systems. All scenarios must represent a defensive evaluation scenario.

JSON Schema:
{
  "title": "Short clear title",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "scenario": "Detailed scenario body text",
  "choices": [
    { "id": "A", "label": "Option A action text" },
    { "id": "B", "label": "Option B action text" }
  ],
  "correctChoice": "A" or "B",
  "explanation": "Why correct is secure and incorrect is risky."
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
  const requiredKeys = ["title", "topic", "difficulty", "scenario", "choices", "correctChoice", "explanation"];
  for (const key of requiredKeys) {
    if (!(key in challenge)) {
      throw new Error(`Malformed response from Gemini: Missing required key "${key}".`);
    }
  }

  if (!Array.isArray(challenge.choices) || challenge.choices.length !== 2) {
    throw new Error("Malformed response from Gemini: 'choices' must be an array of exactly 2 items.");
  }

  const choiceIds = challenge.choices.map(c => c.id);
  if (!choiceIds.includes("A") || !choiceIds.includes("B")) {
    throw new Error("Malformed response from Gemini: Choice IDs must be 'A' and 'B'.");
  }

  if (challenge.correctChoice !== "A" && challenge.correctChoice !== "B") {
    throw new Error("Malformed response from Gemini: 'correctChoice' must match 'A' or 'B'.");
  }

  for (const choice of challenge.choices) {
    if (!choice.label || choice.label.trim().length <= 3) {
      throw new Error("Malformed response from Gemini: Choice labels must be valid strings longer than 3 characters.");
    }
  }

  return challenge;
}
