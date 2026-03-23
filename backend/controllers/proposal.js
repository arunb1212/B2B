import { model } from "mongoose";
import Proposal from "../models/model.js";
import { generateAiProposal } from "../services/ai_service.js";

export const generateProposal = async (req, res) => {
  try {
    const { business_type, budget, priority, location } = req.body;

    if (!business_type || typeof business_type !== "string") {
      return res.status(400).json({ error: "business_type is required and must be a string." });
    }
    if (budget === undefined || budget === null || typeof budget !== "number" || budget <= 0) {
      return res.status(400).json({ error: "budget must be a positive number." });
    }

    let ai_output, prompt,model;
    try {
      const aiResult = await generateAiProposal({ business_type, budget, priority, location });
      ai_output = aiResult.ai_output;
      prompt = aiResult.prompt;
      model=aiResult.model;
    } catch (aiError) {
      console.error("AI Generation Error:", aiError);
      return res.status(500).json({ error: "Failed to generate AI proposal.", details: aiError.message });
    }

    if (!ai_output.products || !Array.isArray(ai_output.products)) {
      return res.status(500).json({ error: "AI returned invalid format: products is not an array." });
    }

    let totalAllocation = 0;
    if (ai_output.budget_allocation && typeof ai_output.budget_allocation === "object") {
       totalAllocation = Object.values(ai_output.budget_allocation).reduce((acc, val) => acc + (Number(val) || 0), 0);
    }
    
    let totalEstimatedCost = 0;
    if (ai_output.cost_breakdown && typeof ai_output.cost_breakdown.total_estimated_cost === "number") {
        totalEstimatedCost = ai_output.cost_breakdown.total_estimated_cost;
    }

    if (totalAllocation > budget || totalEstimatedCost > budget) {
        console.warn(`AI exceeded budget. Budget: ${budget}, Allocation: ${totalAllocation}, Cost: ${totalEstimatedCost}`);
    }

    const newProposal = new Proposal({
      business_type,
      budget,
      priority,
      location,
      ai_output,
      model,
      prompt

    });

    await newProposal.save();
    
    return res.status(201).json(newProposal);

  } catch (error) {
    console.error("Proposal Controller Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};