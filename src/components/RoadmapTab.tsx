import React, { useState } from "react";
import { Product, RoadmapItem, BacklogItem } from "../types";
import { 
  Sparkles, 
  Milestone, 
  Trash2, 
  Plus, 
  Calendar, 
  CheckCircle,
  TrendingUp,
  Sliders,
  AlertCircle,
  Network
} from "lucide-react";

interface RoadmapTabProps {
  product: Product;
  backlogItems: BacklogItem[];
  roadmapItems: RoadmapItem[];
  onAddRoadmapItem: (item: RoadmapItem) => void;
  onUpdateRoadmapItem: (item: RoadmapItem) => void;
  onDeleteRoadmapItem: (id: string) => void;
}

export const PHASES = ["Phase 1: MVP", "Phase 2: Growth", "Phase 3: Scale"] as const;
export const RATING_VALS = ["Low", "Medium", "High"] as const;

export default function RoadmapTab({
  product,
  backlogItems,
  roadmapItems,
  onAddRoadmapItem,
  onUpdateRoadmapItem,
  onDeleteRoadmapItem,
}: RoadmapTabProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Manual Roadmap form state
  const [manualTitle, setManualTitle] = useState("");
  const [manualDesc, setManualDesc] = useState("");
  const [manualPhase, setManualPhase] = useState<RoadmapItem["phase"]>("Phase 1: MVP");
  const [manualQuarter, setManualQuarter] = useState("Q3 2026");
  const [manualImpact, setManualImpact] = useState<RoadmapItem["impact"]>("Medium");
  const [manualEffort, setManualEffort] = useState<RoadmapItem["effort"]>("Medium");

  const productRoadmaps = roadmapItems.filter(r => r.productId === product.id);
  const productBacklogs = backlogItems.filter(b => b.productId === product.id);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationStep("Analyzing target objectives & vision...");

    try {
      const steps = [
        "Analyzing rough backlog candidates...",
        "Evaluating tech complexity & milestone dependencies...",
        "Phase scoring (MVP core viability vs growth factors)...",
        "Compiling release roadmap trajectory..."
      ];

      let stepIdx = 0;
      const stepInterval = setInterval(() => {
        if (stepIdx < steps.length) {
          setGenerationStep(steps[stepIdx]);
          stepIdx++;
        }
      }, 1500);

      const response = await fetch("/api/copilot/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: product.name,
          problemStatement: product.problemStatement,
          objectives: product.objectives,
          backlogList: productBacklogs,
        }),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        throw new Error("Failed to generate strategic roadmap.");
      }

      const data = await response.json();

      if (data.roadmap && Array.isArray(data.roadmap)) {
        // Remove existing items for this product to avoid duplicates or keep them?
        // Let's keep existing, or let the user merge them. Let's append them.
        data.roadmap.forEach((item: any) => {
          onAddRoadmapItem({
            id: `road-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            productId: product.id,
            title: item.title || "Roadmap Milestone",
            description: item.description || "Milestone scope specification.",
            phase: PHASES.includes(item.phase) ? item.phase : "Phase 1: MVP",
            quarter: item.quarter || "Q3 2026",
            impact: RATING_VALS.includes(item.impact) ? item.impact : "Medium",
            effort: RATING_VALS.includes(item.effort) ? item.effort : "Medium",
            dependencies: item.dependencies || [],
            status: "planned",
          });
        });
      }
    } catch (err) {
      console.error(err);
      alert("Error generating roadmap recommendations. Check Gemini API parameters.");
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    onAddRoadmapItem({
      id: `road-${Date.now()}`,
      productId: product.id,
      title: manualTitle.trim(),
      description: manualDesc.trim(),
      phase: manualPhase,
      quarter: manualQuarter.trim() || "Q3 2026",
      impact: manualImpact,
      effort: manualEffort,
      dependencies: [],
      status: "planned",
    });

    setManualTitle("");
    setManualDesc("");
    setShowAddForm(false);
  };

  const updateItemPhase = (item: RoadmapItem, phase: RoadmapItem["phase"]) => {
    onUpdateRoadmapItem({ ...item, phase });
  };

  const updateItemStatus = (item: RoadmapItem, status: RoadmapItem["status"]) => {
    onUpdateRoadmapItem({ ...item, status });
  };

  // Matrix analysis calculation: Group roadmaps into Priority Matrix Quadrants
  // Quadrant 1: Quick Wins (High Impact, Low Effort)
  // Quadrant 2: Strategic Focus (High Impact, High Effort)
  // Quadrant 3: Secondary Fillers (Low/Med Impact, Low Effort)
  // Quadrant 4: Resource Sinks (Low/Med Impact, High Effort)
  const getMatrixQuadrant = (item: RoadmapItem) => {
    const isHighImpact = item.impact === "High";
    const isHighEffort = item.effort === "High" || item.effort === "Medium";

    if (isHighImpact && !isHighEffort) return { label: "Quick Win", bg: "bg-emerald-50 border-emerald-200 text-emerald-800" };
    if (isHighImpact && isHighEffort) return { label: "Strategic", bg: "bg-blue-50 border-blue-200 text-blue-800" };
    if (!isHighImpact && !isHighEffort) return { label: "Filler Feature", bg: "bg-blue-50 border-blue-200 text-blue-800" };
    return { label: "Resource Sink", bg: "bg-red-50 border-red-200 text-red-800" };
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Milestone className="w-6 h-6 text-blue-600" />
            Strategic Release Roadmap
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Plan, organize, and prioritize features across phased release milestones. Use the AI PM Copilot to strategize launching phases.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
              isGenerating
                ? "bg-blue-200 text-blue-100 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? "Synthesizing..." : "Copilot Roadmap"}
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Manual Milestone
          </button>
        </div>
      </div>

      {isGenerating && (
        <div className="border border-blue-100 bg-blue-50/40 rounded-2xl p-6 text-center space-y-3 animate-pulse">
          <div className="flex justify-center">
            <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider font-mono text-blue-600">
            Roadmap Recommendation Engine Engaged
          </p>
          <p className="text-sm text-blue-800 font-medium">{generationStep}</p>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleCreateManual} className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-4 max-w-2xl animate-slide-up">
          <h3 className="font-display font-bold text-gray-900 text-sm">Create Roadmap Milestone</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                Milestone Title
              </label>
              <input
                type="text"
                placeholder="e.g., Native iOS Push Notifications"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                Target Launch Quarter
              </label>
              <input
                type="text"
                placeholder="e.g., Q4 2026"
                value={manualQuarter}
                onChange={(e) => setManualQuarter(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
              Milestone Scope / Description
            </label>
            <textarea
              placeholder="Provide a high-level summary of the scope included in this milestone..."
              value={manualDesc}
              onChange={(e) => setManualDesc(e.target.value)}
              rows={2}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                Phase Assignment
              </label>
              <select
                value={manualPhase}
                onChange={(e) => setManualPhase(e.target.value as RoadmapItem["phase"])}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none"
              >
                {PHASES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                Business Impact
              </label>
              <select
                value={manualImpact}
                onChange={(e) => setManualImpact(e.target.value as RoadmapItem["impact"])}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none"
              >
                {RATING_VALS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                Technical Effort
              </label>
              <select
                value={manualEffort}
                onChange={(e) => setManualEffort(e.target.value as RoadmapItem["effort"])}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none"
              >
                {RATING_VALS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Add Milestone
            </button>
          </div>
        </form>
      )}

      {productRoadmaps.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-gray-200 rounded-2xl p-16 text-center flex flex-col items-center justify-center min-h-[380px]">
          <div className="bg-blue-100 text-blue-700 p-4 rounded-2xl mb-4">
            <Milestone className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="font-display font-bold text-gray-900 text-base">Generate strategic release phase roadmaps</h3>
          <p className="text-xs text-gray-500 max-w-sm mt-1.5 leading-relaxed">
            Organize features and launch windows into MVP, Growth, and Scale swimlanes. Leverage Gemini to design a logical launch sequence.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Phase Swimlanes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {PHASES.map((phase) => {
              const phaseItems = productRoadmaps.filter(item => item.phase === phase);
              return (
                <div key={phase} className="bg-slate-50/80 border border-gray-100 rounded-2xl p-4 flex flex-col h-full min-h-[500px]">
                  {/* Swimlane Header */}
                  <div className="flex items-center justify-between border-b border-gray-200/60 pb-3 mb-4">
                    <span className="font-display font-bold text-gray-900 text-sm tracking-tight">{phase}</span>
                    <span className="bg-slate-200 text-slate-800 font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {phaseItems.length}
                    </span>
                  </div>

                  {/* Lane items */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[580px] pr-1">
                    {phaseItems.map((item) => {
                      const matrix = getMatrixQuadrant(item);
                      return (
                        <div key={item.id} className="bg-white border border-gray-150 rounded-xl p-4 space-y-3.5 hover:border-blue-200 hover:shadow-sm transition-all">
                          {/* Item card Header */}
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-display font-bold text-gray-900 text-xs">
                              {item.title}
                            </h4>
                            <button
                              onClick={() => onDeleteRoadmapItem(item.id)}
                              className="text-gray-300 hover:text-red-500 transition-colors p-0.5 rounded shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <p className="text-[11px] text-gray-500 leading-relaxed">
                            {item.description}
                          </p>

                          {/* Quarters, dependencies and status */}
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span>Target:</span>
                              <span className="text-gray-700 font-bold">{item.quarter}</span>
                            </div>

                            {item.dependencies && item.dependencies.length > 0 && (
                              <div className="flex items-start gap-1 text-[9px] text-gray-400 font-mono">
                                <Network className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                                <span className="truncate">Depends on: {item.dependencies.join(", ")}</span>
                              </div>
                            )}
                          </div>

                          {/* Matrix & Effort / Impact indicators */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-mono border ${matrix.bg}`}>
                              {matrix.label.toUpperCase()}
                            </span>
                            <span className="text-[9px] font-mono text-gray-400 ml-auto">
                              Value: <strong className="text-gray-700 font-bold">{item.impact}</strong>
                            </span>
                            <span className="text-[9px] font-mono text-gray-400">
                              Effort: <strong className="text-gray-700 font-bold">{item.effort}</strong>
                            </span>
                          </div>

                          {/* Controls to shift lanes/status */}
                          <div className="flex items-center justify-between gap-1 border-t border-gray-50 pt-3">
                            {/* Shift lane control */}
                            <select
                              value={item.phase}
                              onChange={(e) => updateItemPhase(item, e.target.value as RoadmapItem["phase"])}
                              className="text-[10px] font-medium bg-gray-50 border border-gray-200 rounded px-1.5 py-1 focus:outline-none text-gray-600 max-w-[100px]"
                            >
                              {PHASES.map(ph => (
                                <option key={ph} value={ph}>{ph.split(":")[0]}</option>
                              ))}
                            </select>

                            {/* Status controls */}
                            <div className="flex rounded border border-gray-200 bg-gray-50 p-0.5 text-[9px] font-mono font-semibold">
                              {(["planned", "in-progress", "completed"] as const).map((st) => (
                                <button
                                  key={st}
                                  onClick={() => updateItemStatus(item, st)}
                                  className={`px-1 py-0.5 rounded capitalize ${
                                    item.status === st
                                      ? "bg-slate-700 text-white font-bold"
                                      : "text-gray-400 hover:text-gray-700"
                                  }`}
                                >
                                  {st.replace("-", " ")}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Business Prioritization Matrix Plotter */}
          <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-display font-bold text-gray-900 text-sm flex items-center gap-2">
                <Sliders className="w-4.5 h-4.5 text-blue-500" />
                Value vs. Effort Allocation Matrix
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Visual analysis of features mapped across the business impact vs development complexity matrix. Optimizing for "Quick Wins" secures fast viability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Quick Wins */}
              <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Quick Wins
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                    {productRoadmaps.filter(item => getMatrixQuadrant(item).label === "Quick Win").length}
                  </span>
                </div>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {productRoadmaps
                    .filter(item => getMatrixQuadrant(item).label === "Quick Win")
                    .map(item => (
                      <p key={item.id} className="text-xs text-gray-700 bg-white border border-emerald-100/40 rounded px-2.5 py-1.5 font-medium truncate">
                        {item.title}
                      </p>
                    ))}
                  {productRoadmaps.filter(item => getMatrixQuadrant(item).label === "Quick Win").length === 0 && (
                    <p className="text-[10px] text-gray-400 italic">No features in this category.</p>
                  )}
                </div>
              </div>

              {/* Strategic Focus */}
              <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-800 flex items-center gap-1">
                    <Milestone className="w-3.5 h-3.5 text-blue-600" /> Strategic Focus
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                    {productRoadmaps.filter(item => getMatrixQuadrant(item).label === "Strategic").length}
                  </span>
                </div>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {productRoadmaps
                    .filter(item => getMatrixQuadrant(item).label === "Strategic")
                    .map(item => (
                      <p key={item.id} className="text-xs text-gray-700 bg-white border border-blue-100/40 rounded px-2.5 py-1.5 font-medium truncate">
                        {item.title}
                      </p>
                    ))}
                  {productRoadmaps.filter(item => getMatrixQuadrant(item).label === "Strategic").length === 0 && (
                    <p className="text-[10px] text-gray-400 italic">No features in this category.</p>
                  )}
                </div>
              </div>

              {/* Secondary Fillers */}
              <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-800 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> Fillers
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                    {productRoadmaps.filter(item => getMatrixQuadrant(item).label === "Filler Feature").length}
                  </span>
                </div>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {productRoadmaps
                    .filter(item => getMatrixQuadrant(item).label === "Filler Feature")
                    .map(item => (
                      <p key={item.id} className="text-xs text-gray-700 bg-white border border-blue-100/40 rounded px-2.5 py-1.5 font-medium truncate">
                        {item.title}
                      </p>
                    ))}
                  {productRoadmaps.filter(item => getMatrixQuadrant(item).label === "Filler Feature").length === 0 && (
                    <p className="text-[10px] text-gray-400 italic">No features in this category.</p>
                  )}
                </div>
              </div>

              {/* Resource Sinks */}
              <div className="bg-red-50/40 border border-red-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-800 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600" /> Sinks / Reconsider
                  </span>
                  <span className="bg-red-100 text-red-800 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                    {productRoadmaps.filter(item => getMatrixQuadrant(item).label === "Resource Sink").length}
                  </span>
                </div>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {productRoadmaps
                    .filter(item => getMatrixQuadrant(item).label === "Resource Sink")
                    .map(item => (
                      <p key={item.id} className="text-xs text-gray-700 bg-white border border-red-100/40 rounded px-2.5 py-1.5 font-medium truncate">
                        {item.title}
                      </p>
                    ))}
                  {productRoadmaps.filter(item => getMatrixQuadrant(item).label === "Resource Sink").length === 0 && (
                    <p className="text-[10px] text-gray-400 italic">No features in this category.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
