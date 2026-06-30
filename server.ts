import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;

function getAIClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Ensure error handling for API routes
function handleError(res: express.Response, error: any, message: string) {
  console.error(`${message}:`, error);
  res.status(500).json({
    error: error instanceof Error ? error.message : String(error),
    message
  });
}

// 1. PRD Generation Endpoint
app.post("/api/copilot/generate-prd", async (req, res) => {
  try {
    const { productName, targetAudience, problemStatement, objectives, featureTitle, featureDescription } = req.body;

    const ai = getAIClient();
    const prompt = `You are a Principal Product Manager. Generate a comprehensive, professional Product Requirement Document (PRD) for a new feature.

Product Context:
- Name: ${productName || "Untitled Project"}
- Target Audience: ${targetAudience || "General Users"}
- Problem Statement: ${problemStatement || "Not specified"}
- Objectives/Goals: ${objectives || "Not specified"}

Feature to Specify:
- Title: ${featureTitle || "Core Feature"}
- Description: ${featureDescription || "Not specified"}

Format the PRD using high-quality Markdown. It must include the following sections:
1. Document Control & Status
2. Executive Summary & Objective
3. User Persona & Use Cases (provide 2 realistic scenarios)
4. Functional Requirements (detailed bullet points with Priority: P0/P1/P2)
5. Out of Scope / Non-Goals
6. UX & Design Considerations
7. Key Success Metrics (KPIs)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Clear and professional PRD Title" },
            content: { type: Type.STRING, description: "Detailed PRD content formatted beautifully in Markdown" }
          },
          required: ["title", "content"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error) {
    handleError(res, error, "Failed to generate PRD");
  }
});

// 2. User Story Generation Endpoint
app.post("/api/copilot/generate-stories", async (req, res) => {
  try {
    const { productName, featureDescription, prdContent } = req.body;

    const ai = getAIClient();
    const prompt = `You are an Agile Product Owner. Break down the following product feature into highly descriptive Agile User Stories.

Product Context:
- Product Name: ${productName || "Untitled Project"}
- Feature/Requirement Description: ${featureDescription || "Not specified"}
${prdContent ? `\nRefer to this detailed PRD context for accuracy:\n${prdContent}` : ""}

Generate a set of 3 to 5 realistic Agile User Stories. Each story must include:
1. Title: Short descriptive name (e.g., "User Login via OAuth")
2. Epic: Grouping/Module (e.g., "Authentication")
3. The user story template: "As a [role], I want to [action], so that [benefit]"
4. Acceptance Criteria: Comprehensive list of Given-When-Then criteria
5. Complexity: Estimation using Fibonacci/T-Shirt sizes: XS, S, M, L, XL
6. Agile Priority: Must Have, Should Have, Could Have, or Wont Have`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            stories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  asA: { type: Type.STRING, description: "e.g., Registered User" },
                  iWantTo: { type: Type.STRING, description: "e.g., Log in using my Google Account" },
                  soThat: { type: Type.STRING, description: "e.g., I don't have to remember another password" },
                  acceptanceCriteria: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING, description: "e.g., Given I am on login page, When I click 'Google login'..." }
                  },
                  epic: { type: Type.STRING },
                  complexity: { type: Type.STRING, enum: ["XS", "S", "M", "L", "XL"] },
                  priority: { type: Type.STRING, enum: ["Must Have", "Should Have", "Could Have", "Wont Have"] }
                },
                required: ["title", "asA", "iWantTo", "soThat", "acceptanceCriteria", "epic", "complexity", "priority"]
              }
            }
          },
          required: ["stories"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error) {
    handleError(res, error, "Failed to generate user stories");
  }
});

// 3. Roadmap Recommendations Endpoint
app.post("/api/copilot/generate-roadmap", async (req, res) => {
  try {
    const { productName, problemStatement, objectives, backlogList } = req.body;

    const ai = getAIClient();
    const prompt = `You are a Strategic Director of Product. Recommend a structured release roadmap for the product.

Product Vision:
- Name: ${productName || "Untitled"}
- Vision & Objective: ${problemStatement || "Not specified"} - ${objectives || "Not specified"}

Current backlog or initial feature ideas to organize:
${backlogList && backlogList.length > 0 ? backlogList.map((item: any, idx: number) => `- ${item.title}: ${item.description}`).join("\n") : "General startup launch"}

Propose 4 to 6 strategic roadmap items organized logically across release phases:
- Phase 1: MVP (Focus on core value, immediate viability)
- Phase 2: Growth (Focus on user engagement, metrics, and core expansion)
- Phase 3: Scale (Focus on performance, monetization, integrations, and automation)

Each recommended roadmap item must contain:
1. Title: Clear feature/milestone name
2. Description: Clear target and scope description
3. Phase: Must choose one of: "Phase 1: MVP", "Phase 2: Growth", "Phase 3: Scale"
4. Quarter: Suggested launch target (e.g., "Q3 2026", "Q4 2026")
5. Business Impact: Low, Medium, High
6. Technical Effort: Low, Medium, High
7. Dependencies: Array of sibling roadmap item titles it depends on (or empty array if none)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  phase: { type: Type.STRING, enum: ["Phase 1: MVP", "Phase 2: Growth", "Phase 3: Scale"] },
                  quarter: { type: Type.STRING },
                  impact: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                  effort: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                  dependencies: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["title", "description", "phase", "quarter", "impact", "effort", "dependencies"]
              }
            }
          },
          required: ["roadmap"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error) {
    handleError(res, error, "Failed to recommend product roadmap");
  }
});

// 4. Backlog Refinement Endpoint
app.post("/api/copilot/refine-backlog", async (req, res) => {
  try {
    const { productName, title, description } = req.body;

    const ai = getAIClient();
    const prompt = `You are a Technical Agile Coach and Lead Product Manager. Refine, groom, and polish this rough user story or backlog item.

Product context: ${productName || "General Web Service"}
Raw Backlog Item:
- Title: ${title || "Feature"}
- Raw Description: ${description || "No description provided"}

Groom and enrich this backlog item into standard development-ready format.
1. Formulate a rich, technical-functional description for the developers. Include any edge cases, API assumptions, or UX flows.
2. Provide a 0 to 100 quality score (where 0 is completely unrefined and 100 is fully ready for development with zero ambiguity).
3. Under "refinementNotes", supply 3 bullet points with grooming notes, suggested questions for stakeholders, or technical advice for engineers.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            refinedDescription: { type: Type.STRING, description: "Detailed development-ready refined description with specifications" },
            refinementNotes: { type: Type.STRING, description: "3 clear grooming feedback points in Markdown or bullet format" },
            score: { type: Type.INTEGER, description: "Grooming quality score out of 100" }
          },
          required: ["refinedDescription", "refinementNotes", "score"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error) {
    handleError(res, error, "Failed to groom backlog item");
  }
});

// Serve frontend build static files / Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI PM Copilot Server running on http://localhost:${PORT}`);
  });
}

startServer();
