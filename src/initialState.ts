import { WorkspaceState, Product, PRD, UserStory, RoadmapItem, BacklogItem } from "./types";

const SAMPLE_PRODUCT_ID = "sample-product-launchpad";

export const sampleProduct: Product = {
  id: SAMPLE_PRODUCT_ID,
  name: "LaunchPad",
  targetAudience: "Solopreneurs, Indie Hackers, and Side-Project Developers globally",
  problemStatement: "Incorporating an LLC, setting up a corporate bank account, and handling basic legal compliance is fragmented, takes weeks, and costs thousands of dollars in hidden legal fees.",
  valueProp: "An automated, elegant mobile-first web app that handles state filing, EIN generation, banking integration, and legal agreements in under 15 minutes for a flat $199 fee.",
  objectives: "1. Achieve 1,000 successful business formations in Q1\n2. Maintain user onboarding satisfaction score of >95%\n3. Automate banking API integrations to under 2-minute setup.",
  createdAt: new Date().toISOString(),
};

export const samplePRD: PRD = {
  id: "prd-sample-llc-onboarding",
  productId: SAMPLE_PRODUCT_ID,
  title: "Automated LLC Formation & State Filing",
  featureDescription: "A multi-step onboarding wizard that collects company name preferences, owner details, generates filing documents, and submits them directly to the state registry API.",
  status: "approved",
  createdAt: new Date().toISOString(),
  content: `# Product Requirement Document: Automated LLC Formation Onboarding

## 1. Document Control
- **Owner:** Principal Product Manager (AI Copilot)
- **Status:** APPROVED
- **Target Release:** Q3 2026

## 2. Executive Summary
The onboarding funnel is the most critical touchpoint for LaunchPad. This feature automates the state filing workflow by leading the user through a clean, compliant multi-step registration flow that eliminates legal jargon and handles document filing via state APIs.

## 3. User Personas & Use Cases

### Persona: Sarah the Indie Hacker
*Sarah has a profitable SaaS side project earning $800/month. She needs to incorporate quickly to sign a enterprise contract, but dreads standard legal filings.*
- **Use Case:** Sarah opens LaunchPad on her phone, enters her chosen name, answers three simple questions, uploads an ID photo, and makes a $199 payment. Within 24 hours, her Delaware LLC is active.

## 4. Functional Requirements

| ID | Feature | Description | Priority |
|---|---|---|---|
| **REQ-01** | Name Availability Checker | Instant lookup to check if the desired company name is available in Delaware / Wyoming registries. | **P0** |
| **REQ-02** | Owner Identity Verification | Secure capture of legal name, physical address, and government-issued ID upload. | **P0** |
| **REQ-03** | Auto-Generated Articles of Org | Dynamic PDF generation of LLC Articles of Organization based on user data. | **P1** |
| **REQ-04** | Direct Registry Integration | Async background queue to submit generated filing payloads to Wyoming/Delaware Secretary of State portals. | **P1** |
| **REQ-05** | Real-time Status Tracker | In-app visual timeline showing 'Filing Submitted', 'State Reviewing', and 'Active LLC'. | **P2** |

## 5. Non-Goals
- Automated tax calculation for foreign entities (handled in Phase 2).
- Trademark search across international trademark offices.

## 6. UX & Design Considerations
- **No Form Fatigue:** Max 3 fields per step.
- **Immediate Reassurance:** Visual confidence badges highlighting 100% money-back guarantee.

## 7. Success Metrics
- **Conversion Rate:** Onboarding flow completion rate >= 65%.
- **Setup Time:** Average completion time of onboarding <= 10 minutes.
`,
};

export const sampleUserStories: UserStory[] = [
  {
    id: "story-1",
    productId: SAMPLE_PRODUCT_ID,
    title: "Instant Name Availability Check",
    asA: "unincorporated developer",
    iWantTo: "type a business name in real-time",
    soThat: "I immediately know if the name is legally available to form in Delaware",
    epic: "Onboarding Wizard",
    complexity: "M",
    priority: "Must Have",
    createdAt: new Date().toISOString(),
    acceptanceCriteria: [
      "Given the user is on the first step of onboarding",
      "When they enter a name (e.g., 'ByteSize AI')",
      "Then the app displays a loading state and queries the registry API",
      "And shows a green checkmark if available, or list of similar available alternatives if taken."
    ]
  },
  {
    id: "story-2",
    productId: SAMPLE_PRODUCT_ID,
    title: "Secure ID Upload & KYC Scan",
    asA: "founder forming a business",
    iWantTo: "upload a picture of my government ID or passport",
    soThat: "my legal identity is verified in compliance with anti-money laundering laws",
    epic: "Legal Compliance",
    complexity: "L",
    priority: "Must Have",
    createdAt: new Date().toISOString(),
    acceptanceCriteria: [
      "Given a user is on Step 3 of formation",
      "When they upload a clear JPG/PNG of their passport or driver's license",
      "Then the upload is stored in encrypted storage",
      "And a secure web callback triggers an automatic KYC scan."
    ]
  },
  {
    id: "story-3",
    productId: SAMPLE_PRODUCT_ID,
    title: "Filing Status Push Notifications",
    asA: "excited new business owner",
    iWantTo: "receive SMS or push updates on my filing status",
    soThat: "I know the exact minute the state approves my LLC formation",
    epic: "Notification Center",
    complexity: "S",
    priority: "Could Have",
    createdAt: new Date().toISOString(),
    acceptanceCriteria: [
      "Given an active LLC filing is undergoing state review",
      "When the state API webhook returns a 'FORMATION_COMPLETED' event",
      "Then an automated SMS is sent to the founder with their official State File Number."
    ]
  }
];

export const sampleRoadmapItems: RoadmapItem[] = [
  {
    id: "road-1",
    productId: SAMPLE_PRODUCT_ID,
    title: "Core Onboarding and Delaware State Filing",
    description: "Launch the MVP onboarding wizard integrated with Delaware registry API and stripe payment gateway.",
    phase: "Phase 1: MVP",
    quarter: "Q3 2026",
    impact: "High",
    effort: "Medium",
    dependencies: [],
    status: "in-progress"
  },
  {
    id: "road-2",
    productId: SAMPLE_PRODUCT_ID,
    title: "EIN Tax ID Automated Filing",
    description: "Integrate IRS SS-4 submission automated queue to secure business Tax IDs within 48 hours of LLC approval.",
    phase: "Phase 1: MVP",
    quarter: "Q3 2026",
    impact: "High",
    effort: "High",
    dependencies: ["Core Onboarding and Delaware State Filing"],
    status: "planned"
  },
  {
    id: "road-3",
    productId: SAMPLE_PRODUCT_ID,
    title: "Mercury & Brex Bank Account API Setup",
    description: "Form a partnership and build SDK integration allowing users to spin up a bank account instantly inside our app after receiving their EIN.",
    phase: "Phase 2: Growth",
    quarter: "Q4 2026",
    impact: "High",
    effort: "High",
    dependencies: ["EIN Tax ID Automated Filing"],
    status: "planned"
  },
  {
    id: "road-4",
    productId: SAMPLE_PRODUCT_ID,
    title: "Post-incorporation Compliance Dashboard",
    description: "Send automated alerts for annual franchise tax filings and registered agent renewals.",
    phase: "Phase 3: Scale",
    quarter: "Q1 2027",
    impact: "Medium",
    effort: "Low",
    dependencies: ["Core Onboarding and Delaware State Filing"],
    status: "planned"
  }
];

export const sampleBacklogItems: BacklogItem[] = [
  {
    id: "back-1",
    productId: SAMPLE_PRODUCT_ID,
    title: "Support Wyoming formations",
    description: "Allow solopreneurs to select Wyoming instead of Delaware during the initial registry filing. Needs custom form variables for Wyoming.",
    refinedDescription: "",
    refinementNotes: "",
    score: 25,
    status: "unrefined"
  },
  {
    id: "back-2",
    productId: SAMPLE_PRODUCT_ID,
    title: "Implement promo codes",
    description: "Allow users to type a referral or discount code at payment checkouts. Needs database verification of promo status and price reductions.",
    refinedDescription: "",
    refinementNotes: "",
    score: 40,
    status: "unrefined"
  },
  {
    id: "back-3",
    productId: SAMPLE_PRODUCT_ID,
    title: "Draft standard operating agreements",
    description: "Generate a generic Operating Agreement template and pre-populate owner names and share allocations.",
    refinedDescription: "System automatically compiles a single-member or multi-member operating agreement compliant with DE state laws. The user can review terms, sign digitally via a web-native canvas, and download a copy.",
    refinementNotes: "- Ensure electronic signature is legally binding under Esign Act.\n- Allow custom equity splits for multi-owner filings.\n- Store the generated Operating Agreement in Firestore private collection.",
    score: 92,
    status: "ready-for-dev"
  }
];

export function getInitialWorkspace(): WorkspaceState {
  return {
    products: [sampleProduct],
    currentProductId: SAMPLE_PRODUCT_ID,
    prds: [samplePRD],
    userStories: sampleUserStories,
    roadmapItems: sampleRoadmapItems,
    backlogItems: sampleBacklogItems,
  };
}
