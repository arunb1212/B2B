export const generateAiProposal = async (businessData) => {
  const { business_type, budget, priority, location } = businessData;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not defined.");
  }

  const prompt = `You are an AI generating sustainable B2B product proposals.
Based on the following inputs:
- Business Type: ${business_type}
- Budget: ₹${budget}
- Priority: ${priority || "General sustainability"}
- Location: ${location || "Any"}

Generate a proposal with:
1. Suggested sustainable product mix relevant to the business.
2. Budget allocation (the total must strictly not exceed ${budget}).
3. Estimated cost breakdown (e.g., price x quantity).
4. Sustainability impact summary (business-friendly, briefly explaining the positive impact).

Return ONLY raw JSON matching this exact structure (no markdown tags, no explanations outside the JSON):
{
  "products": [
    { "name": "...", "description": "...", "quantity": 0, "unit_price": 0, "total_cost": 0 }
  ],
  "budget_allocation": {
    "category1": 0,
    "category2": 0
  },
  "cost_breakdown": {
    "total_estimated_cost": 0,
    "currency": "INR"
  },
  "impact_summary": "..."
}`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "nvidia/nemotron-3-super-120b-a12b:free",
      "messages": [
        {
          "role": "system",
          "content": "You are a JSON-only sustainable B2B proposal generator."
        },
        {
          "role": "user",
          "content": prompt
        }
      ],
      "reasoning": {"enabled": true}
    })
  });

  if (!response.ok) {
     const text = await response.text();
     throw new Error(`OpenRouter API Error: ${response.status} ${response.statusText} - ${text}`);
  }

  const result = await response.json();
  const assistantMessage = result.choices[0].message;
  
  // The assistant might return wrapped in markdown code blocks like ```json ... ```
  let content = assistantMessage.content.trim();
  if (content.startsWith("\`\`\`json")) {
    content = content.replace(/^\`\`\`json/i, "").replace(/\`\`\`$/i, "").trim();
  } else if (content.startsWith("\`\`\`")) {
    content = content.replace(/^\`\`\`/i, "").replace(/\`\`\`$/i, "").trim();
  }

  try {
    const ai_output = JSON.parse(content);
    return { ai_output, prompt };
  } catch (error) {
    throw new Error("Failed to parse AI response as JSON. AI returned: " + content);
  }
};
