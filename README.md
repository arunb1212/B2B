# AI B2B Proposal Generator

A full-stack, state-of-the-art enterprise resource planner that generates sustainable product proposals completely powered by Generative AI.

## Architecture Explanation

This application follows a modern decoupled architecture:

1. **Frontend**: Built with React and Vite. UI uses bespoke, vanilla CSS focusing on a premium aesthetics (glassmorphism, subtle animations, neon-glow palettes). It features a central form that accepts inputs: Business Type, Budget, Priority, and Location.
2. **Backend**: A Node.js and Express RESTful API server.
3. **Database**: MongoDB (via Mongoose) integration for persisting prompts, input variables, and the AI outputs.
4. **AI Integration Layer**: The `services/ai_service.js` connects to the OpenRouter API (utilizing models like `nvidia/nemotron-3-super-120b-a12b:free`) to generate sustainable product mixes. Strict instructions force the AI to return outputs formatted as JSON.

## Prompt Design

The core logic lies in a well-crafted prompt sent to OpenRouter. The prompt template encapsulates the user parameters and enforces strict rules.

Example snippet:
\`\`\`text
You are an AI generating sustainable B2B product proposals.
Based on the following inputs:

- Business Type: {business_type}
- Budget: ₹{budget}
- Priority: {priority}
- Location: {location}

Generate a proposal with:

1. Suggested sustainable product mix relevant to the business.
2. Budget allocation (the total must strictly not exceed {budget}).
3. Estimated cost breakdown (e.g., price x quantity).
4. Sustainability impact summary.

Return ONLY raw JSON matching this exact structure...
\`\`\`
By enforcing the output structure, we are able to parse `result.choices[0].message.content` as a javascript object directly, after stripping away potential Markdown code block artifacts.

## How to Run

1. **Prerequisites**
   - Node.js (v18+)
   - MongoDB running locally or remotely
   - OpenRouter API Key

2. **Environment Setup**
   Ensure your `.env` file in the `backend/` directory looks like:
   \`\`\`env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/eco-proposals
   OPENROUTER_API_KEY=your_open_router_key_here
   \`\`\`

3. **Backend**
   Open a terminal into the `backend` folder and run:
   \`\`\`bash
   npm install
   npm run dev
   \`\`\`

4. **Frontend**
   Open another terminal into the `frontend` folder and run:
   \`\`\`bash
   npm install # if not already installed
   npm run dev
   \`\`\`
   Navigate to the localhost port output by Vite (typically `http://localhost:5173`).
