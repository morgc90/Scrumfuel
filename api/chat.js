// api/chat.js — Vercel serverless function
// Your ANTHROPIC_API_KEY lives here on the server, never sent to the browser.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages, context } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const systemPrompt = `You are ScrumFuel, an expert AI nutrition and fitness coach specialising in rugby union.

Player profile:
- Position: ${context?.position || "rugby player"}
- Training phase: ${context?.phase || "in-season"}
- Body weight: ${context?.weight || 85}kg
- Goal: ${context?.goal || "performance"}
- Daily targets: ${context?.macros?.kcal || 3200} kcal, ${context?.macros?.protein || 160}g protein, ${context?.macros?.carbs || 380}g carbs, ${context?.macros?.fat || 90}g fat

Give specific, actionable, rugby-focused nutrition and fitness advice. Be direct, motivating, and concise. Always relate advice back to the player's position and goals. Use line breaks for readability. Keep responses under 200 words.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Anthropic API error:", err);
      return res.status(500).json({ error: "AI service error" });
    }

    const data = await response.json();
    const reply = data.content?.map((b) => b.text || "").join("") || "No response received.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
