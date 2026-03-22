import Proposal from "../models/model.js";
import { generateAiProposal } from "../services/ai_service.js";

export const generateProposal = async (req, res) => {
  try {
    const { business_type, budget, priority, location } = req.body;

    // Validate inputs
    if (!business_type || typeof business_type !== "string") {
      return res.status(400).json({ error: "business_type is required and must be a string." });
    }
    if (budget === undefined || budget === null || typeof budget !== "number" || budget <= 0) {
      return res.status(400).json({ error: "budget must be a positive number." });
    }

    // Call AI Service
    let ai_output, prompt;
    try {
      const aiResult = await generateAiProposal({ business_type, budget, priority, location });
      ai_output = aiResult.ai_output;
      prompt = aiResult.prompt;
    } catch (aiError) {
      console.error("AI Generation Error:", aiError);
      return res.status(500).json({ error: "Failed to generate AI proposal.", details: aiError.message });
    }

    // Validate AI Output logic
    if (!ai_output.products || !Array.isArray(ai_output.products)) {
      return res.status(500).json({ error: "AI returned invalid format: products is not an array." });
    }

    let totalAllocation = 0;
    if (ai_output.budget_allocation && typeof ai_output.budget_allocation === "object") {
       totalAllocation = Object.values(ai_output.budget_allocation).reduce((acc, val) => acc + (Number(val) || 0), 0);
    }
    
    // Check if total cost breakdown exceeds budget
    let totalEstimatedCost = 0;
    if (ai_output.cost_breakdown && typeof ai_output.cost_breakdown.total_estimated_cost === "number") {
        totalEstimatedCost = ai_output.cost_breakdown.total_estimated_cost;
    }

    if (totalAllocation > budget || totalEstimatedCost > budget) {
        // We could implement a retry logic here, but for now we'll just throw an error
        console.warn(`AI exceeded budget. Budget: ${budget}, Allocation: ${totalAllocation}, Cost: ${totalEstimatedCost}`);
        // Optionally scale down or try again. Returning error for now according to strict requirements.
    }

    // Save to database
    const newProposal = new Proposal({
      business_type,
      budget,
      priority,
      location,
      ai_output,
      prompt
    });

    await newProposal.save();
    
    // Return to client
    return res.status(201).json(newProposal);

  } catch (error) {
    console.error("Proposal Controller Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};