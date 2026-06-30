export interface Product {
  id: string;
  name: string;
  targetAudience: string;
  problemStatement: string;
  valueProp: string;
  objectives: string;
  createdAt: string;
}

export interface PRD {
  id: string;
  productId: string;
  title: string;
  featureDescription: string;
  content: string; // Markdown format
  status: 'draft' | 'under-review' | 'approved';
  createdAt: string;
}

export interface UserStory {
  id: string;
  productId: string;
  title: string;
  asA: string;
  iWantTo: string;
  soThat: string;
  acceptanceCriteria: string[]; // List of criteria
  epic: string;
  complexity: 'XS' | 'S' | 'M' | 'L' | 'XL';
  priority: 'Must Have' | 'Should Have' | 'Could Have' | 'Wont Have';
  createdAt: string;
}

export interface RoadmapItem {
  id: string;
  productId: string;
  title: string;
  description: string;
  phase: 'Phase 1: MVP' | 'Phase 2: Growth' | 'Phase 3: Scale';
  quarter: string; // e.g., 'Q3 2026'
  impact: 'Low' | 'Medium' | 'High';
  effort: 'Low' | 'Medium' | 'High';
  dependencies: string[];
  status: 'planned' | 'in-progress' | 'completed';
}

export interface BacklogItem {
  id: string;
  productId: string;
  title: string;
  description: string;
  refinedDescription: string;
  refinementNotes: string;
  score: number; // Quality score 0-100
  status: 'unrefined' | 'refined' | 'ready-for-dev';
}

export interface WorkspaceState {
  products: Product[];
  currentProductId: string | null;
  prds: PRD[];
  userStories: UserStory[];
  roadmapItems: RoadmapItem[];
  backlogItems: BacklogItem[];
}
