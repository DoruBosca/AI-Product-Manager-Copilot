import React, { useState } from "react";
import { Product, PRD, UserStory } from "../types";
import { 
  Sparkles, 
  Trash2, 
  Plus, 
  ListTodo,
  Tag,
  CheckCircle,
  FileText,
  AlertCircle
} from "lucide-react";

interface UserStoryTabProps {
  product: Product;
  prds: PRD[];
  userStories: UserStory[];
  onAddStory: (story: UserStory) => void;
  onUpdateStory: (story: UserStory) => void;
  onDeleteStory: (id: string) => void;
}

export const COMPLEXITIES = ["XS", "S", "M", "L", "XL"] as const;
export const PRIORITIES = ["Must Have", "Should Have", "Could Have", "Wont Have"] as const;

export default function UserStoryTab({
  product,
  prds,
  userStories,
  onAddStory,
  onUpdateStory,
  onDeleteStory,
}: UserStoryTabProps) {
  const [featureDescription, setFeatureDescription] = useState("");
  const [selectedPrdId, setSelectedPrdId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");

  // Manual story form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualAsA, setManualAsA] = useState("");
  const [manualIWantTo, setManualIWantTo] = useState("");
  const [manualSoThat, setManualSoThat] = useState("");
  const [manualEpic, setManualEpic] = useState("");
  const [manualCriteria, setManualCriteria] = useState("");

  const productPrds = prds.filter(p => p.productId === product.id);
  const productStories = userStories.filter(s => s.productId === product.id);

  // Group stories by Epic for professional backlog rendering
  const storiesByEpic = productStories.reduce((acc, story) => {
    const epic = story.epic || "General Feature / Backlog";
    if (!acc[epic]) acc[epic] = [];
    acc[epic].push(story);
    return acc;
  }, {} as Record<string, UserStory[]>);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureDescription.trim() && !selectedPrdId) return;

    setIsGenerating(true);
    setGenerationStep("Analyzing feature requirements and scope...");

    try {
      const steps = [
        "Mapping user persona pathways...",
        "Structuring story acceptance criteria (Given-When-Then)...",
        "Estimating effort sizing & complexity values...",
        "Compiling structured story backlog items..."
      ];

      let stepIdx = 0;
      const stepInterval = setInterval(() => {
        if (stepIdx < steps.length) {
          setGenerationStep(steps[stepIdx]);
          stepIdx++;
        }
      }, 1500);

      const referencePrd = prds.find(p => p.id === selectedPrdId);
      const payload = {
        productName: product.name,
        featureDescription: featureDescription || referencePrd?.title || "Product core expansion",
        prdContent: referencePrd ? referencePrd.content : undefined
      };

      const response = await fetch("/api/copilot/generate-stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        throw new Error("Failed to generate stories on server.");
      }

      const data = await response.json();

      if (data.stories && Array.isArray(data.stories)) {
        data.stories.forEach((story: any) => {
          onAddStory({
            id: `story-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            productId: product.id,
            title: story.title || "Agile Story Idea",
            asA: story.asA || "User",
            iWantTo: story.iWantTo || "Do some task",
            soThat: story.soThat || "Benefit from it",
            acceptanceCriteria: story.acceptanceCriteria || [],
            epic: story.epic || "General Backlog",
            complexity: (story.complexity && COMPLEXITIES.includes(story.complexity)) ? story.complexity : "M",
            priority: (story.priority && PRIORITIES.includes(story.priority)) ? story.priority : "Must Have",
            createdAt: new Date().toISOString()
          });
        });
        setFeatureDescription("");
        setSelectedPrdId("");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating user stories. Verify server connectivity and Gemini API configurations.");
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    const criteriaList = manualCriteria
      .split("\n")
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const newStory: UserStory = {
      id: `story-${Date.now()}`,
      productId: product.id,
      title: manualTitle.trim(),
      asA: manualAsA.trim() || "User",
      iWantTo: manualIWantTo.trim() || "perform an action",
      soThat: manualSoThat.trim() || "gain core value",
      acceptanceCriteria: criteriaList,
      epic: manualEpic.trim() || "General Feature",
      complexity: "S",
      priority: "Must Have",
      createdAt: new Date().toISOString()
    };

    onAddStory(newStory);
    setShowAddForm(false);
    setManualTitle("");
    setManualAsA("");
    setManualIWantTo("");
    setManualSoThat("");
    setManualEpic("");
    setManualCriteria("");
  };

  const updateComplexity = (story: UserStory, complexity: UserStory["complexity"]) => {
    onUpdateStory({ ...story, complexity });
  };

  const updatePriority = (story: UserStory, priority: UserStory["priority"]) => {
    onUpdateStory({ ...story, priority });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-blue-600" />
            Agile Story Breakdown
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Generate development-ready Agile stories with high-quality Given-When-Then Acceptance Criteria directly from your PRD context.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium text-xs px-4 py-2.5 rounded-xl transition-all self-start md:self-center cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Story Manually
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Generation controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-gray-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-blue-500" />
              Copilot Breakdown Generator
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4">
              {productPrds.length > 0 && (
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-mono mb-1">
                    Select Reference PRD Context
                  </label>
                  <select
                    value={selectedPrdId}
                    onChange={(e) => setSelectedPrdId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                    disabled={isGenerating}
                  >
                    <option value="">-- No PRD Reference (Use Vision Prompt) --</option>
                    {productPrds.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-mono mb-1">
                  Feature or Requirements Prompt
                </label>
                <textarea
                  placeholder="e.g., Build a user preferences page. Let users toggle notification settings (SMS/Email), save profile updates, and upload avatars."
                  value={featureDescription}
                  onChange={(e) => setFeatureDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none leading-relaxed"
                  disabled={isGenerating}
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating || (!featureDescription.trim() && !selectedPrdId)}
                className={`w-full font-medium text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                  isGenerating || (!featureDescription.trim() && !selectedPrdId)
                    ? "bg-blue-300 text-blue-100 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                {isGenerating ? "Analyzing & Breaking Down..." : "Generate User Stories"}
              </button>
            </form>

            {isGenerating && (
              <div className="border border-blue-50 bg-blue-50/50 rounded-xl p-3 text-center space-y-2 animate-pulse">
                <div className="flex justify-center">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider font-mono text-blue-600">
                  Agile Coach Engine Active
                </p>
                <p className="text-xs text-blue-700 font-medium">{generationStep}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Manual Story creation / Active Story Lists */}
        <div className="lg:col-span-8 space-y-6">
          {/* Manual Form Overlay-Style Row */}
          {showAddForm && (
            <form onSubmit={handleCreateManual} className="bg-slate-50 border border-blue-100 rounded-2xl p-6 shadow-sm space-y-4 animate-slide-up">
              <h3 className="font-display font-bold text-gray-900 text-sm">Add New User Story</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                    Story Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Profile Picture Crop"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                    Epic
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Onboarding, Core UX"
                    value={manualEpic}
                    onChange={(e) => setManualEpic(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Agile Narrative Template */}
              <div className="bg-white border border-gray-150 rounded-xl p-4 space-y-3">
                <p className="text-xs font-mono font-bold text-blue-600 uppercase tracking-wider">Story Narrative</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">As a [role]</span>
                    <input
                      type="text"
                      placeholder="Indie founder"
                      value={manualAsA}
                      onChange={(e) => setManualAsA(e.target.value)}
                      className="w-full border-b border-gray-200 focus:border-blue-500 focus:outline-none text-xs pb-1 text-gray-700 font-medium"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">I want to [action]</span>
                    <input
                      type="text"
                      placeholder="click to check LLC name"
                      value={manualIWantTo}
                      onChange={(e) => setManualIWantTo(e.target.value)}
                      className="w-full border-b border-gray-200 focus:border-blue-500 focus:outline-none text-xs pb-1 text-gray-700 font-medium"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">So that [benefit]</span>
                    <input
                      type="text"
                      placeholder="I don't waste my payment"
                      value={manualSoThat}
                      onChange={(e) => setManualSoThat(e.target.value)}
                      className="w-full border-b border-gray-200 focus:border-blue-500 focus:outline-none text-xs pb-1 text-gray-700 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                  Acceptance Criteria (One per line)
                </label>
                <textarea
                  placeholder="Given I am on registration screen...&#10;When I trigger checking...&#10;Then state lookup is verified..."
                  value={manualCriteria}
                  onChange={(e) => setManualCriteria(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-blue-500 resize-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs hover:bg-gray-100 text-gray-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-sm"
                >
                  Add story
                </button>
              </div>
            </form>
          )}

          {/* Epic-grouped stories rendering */}
          {Object.keys(storiesByEpic).length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-gray-200 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
              <div className="bg-blue-100 text-blue-700 p-3.5 rounded-2xl mb-4">
                <ListTodo className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-display font-bold text-gray-900 text-base">Generate user stories</h3>
              <p className="text-xs text-gray-500 max-w-sm mt-1.5">
                Break features or complete specifications down into development-ready backlog stories. Use the generator tools on the left.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(storiesByEpic).map(([epicName, stories]) => (
                <div key={epicName} className="space-y-3">
                  {/* Epic Title Tag */}
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    <Tag className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-display font-bold text-gray-800 text-sm tracking-tight">
                      {epicName}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">({stories.length} stories)</span>
                  </div>

                  {/* Story List under this epic */}
                  <div className="grid grid-cols-1 gap-4">
                    {stories.map((story) => (
                      <div key={story.id} className="bg-white border border-gray-150 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all flex flex-col justify-between">
                        <div>
                          {/* Story Card Header */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <h4 className="font-display font-bold text-gray-900 text-xs">
                              {story.title}
                            </h4>
                            <button
                              onClick={() => onDeleteStory(story.id)}
                              title="Delete Story"
                              className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Agile Narrative Sentence structure */}
                          <div className="bg-slate-50 rounded-lg p-3.5 text-xs text-gray-700 font-medium space-y-1 border border-slate-100/60 leading-relaxed mb-4">
                            <p><span className="text-blue-600 font-bold font-mono text-[10px] uppercase tracking-wider">As a</span> {story.asA}</p>
                            <p><span className="text-blue-600 font-bold font-mono text-[10px] uppercase tracking-wider">I want to</span> {story.iWantTo}</p>
                            <p><span className="text-blue-600 font-bold font-mono text-[10px] uppercase tracking-wider">So that</span> {story.soThat}</p>
                          </div>

                          {/* Acceptance Criteria */}
                          {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
                            <div className="space-y-2 mb-4">
                              <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-mono">
                                Acceptance Criteria
                              </span>
                              <ul className="text-xs text-gray-600 space-y-1.5 list-none pl-1">
                                {story.acceptanceCriteria.map((crit, cIdx) => (
                                  <li key={cIdx} className="flex items-start gap-2">
                                    <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                                    <span>{crit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Parameter controls (Badges) */}
                        <div className="flex flex-wrap items-center gap-2 border-t border-gray-50 pt-3.5 mt-2">
                          {/* Complexity dropdown */}
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono text-gray-400 uppercase">Effort:</span>
                            <div className="flex rounded bg-gray-100 p-0.5 border border-gray-200 text-[10px] font-mono">
                              {COMPLEXITIES.map((comp) => (
                                <button
                                  key={comp}
                                  onClick={() => updateComplexity(story, comp)}
                                  className={`px-1.5 py-0.5 rounded transition-all ${
                                    story.complexity === comp
                                      ? "bg-slate-700 text-white font-bold"
                                      : "text-gray-500 hover:text-gray-800"
                                  }`}
                                >
                                  {comp}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Priority Selector */}
                          <div className="flex items-center gap-1 ml-auto">
                            <span className="text-[10px] font-mono text-gray-400 uppercase">Priority:</span>
                            <select
                              value={story.priority}
                              onChange={(e) => updatePriority(story, e.target.value as UserStory["priority"])}
                              className={`px-2 py-1 rounded border text-[10px] font-semibold focus:outline-none ${
                                story.priority === "Must Have"
                                  ? "bg-red-50 border-red-200 text-red-700"
                                  : story.priority === "Should Have"
                                  ? "bg-amber-50 border-amber-200 text-amber-700"
                                  : story.priority === "Could Have"
                                  ? "bg-blue-50 border-blue-200 text-blue-700"
                                  : "bg-gray-50 border-gray-200 text-gray-500"
                              }`}
                            >
                              {PRIORITIES.map((pri) => (
                                <option key={pri} value={pri}>
                                  {pri}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
