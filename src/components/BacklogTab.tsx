import React, { useState } from "react";
import { Product, BacklogItem } from "../types";
import { 
  Sparkles, 
  Trash2, 
  Plus, 
  Compass,
  CheckCircle,
  AlertTriangle,
  FileQuestion,
  TrendingUp,
  Award
} from "lucide-react";

interface BacklogTabProps {
  product: Product;
  backlogItems: BacklogItem[];
  onAddBacklogItem: (item: BacklogItem) => void;
  onUpdateBacklogItem: (item: BacklogItem) => void;
  onDeleteBacklogItem: (id: string) => void;
}

export default function BacklogTab({
  product,
  backlogItems,
  onAddBacklogItem,
  onUpdateBacklogItem,
  onDeleteBacklogItem,
}: BacklogTabProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [refinementStep, setRefinementStep] = useState("");
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const productBacklogs = backlogItems.filter(b => b.productId === product.id);
  const activeItem = productBacklogs.find(b => b.id === activeItemId) || (productBacklogs.length > 0 ? productBacklogs[0] : null);

  const handleCreateRaw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: BacklogItem = {
      id: `back-${Date.now()}`,
      productId: product.id,
      title: newTitle.trim(),
      description: newDesc.trim() || "No initial description provided.",
      refinedDescription: "",
      refinementNotes: "",
      score: 15, // Start low for raw unrefined items
      status: "unrefined",
    };

    onAddBacklogItem(newItem);
    setActiveItemId(newItem.id);
    setNewTitle("");
    setNewDesc("");
  };

  const handleRefine = async (item: BacklogItem) => {
    setIsRefining(true);
    setRefinementStep("Deconstructing feature objectives...");

    try {
      const steps = [
        "Analyzing user friction points...",
        "Evaluating edge cases and technical constraints...",
        "Formulating functional specifications for engineering...",
        "Drafting clarifying stakeholder review questions...",
        "Compiling scoring matrix out of 100..."
      ];

      let stepIdx = 0;
      const stepInterval = setInterval(() => {
        if (stepIdx < steps.length) {
          setRefinementStep(steps[stepIdx]);
          stepIdx++;
        }
      }, 1200);

      const response = await fetch("/api/copilot/refine-backlog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: product.name,
          title: item.title,
          description: item.description,
        }),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        throw new Error("Grooming refinement failed on the server.");
      }

      const data = await response.json();

      onUpdateBacklogItem({
        ...item,
        refinedDescription: data.refinedDescription || "No specification compiled.",
        refinementNotes: data.refinementNotes || "No notes provided.",
        score: typeof data.score === "number" ? data.score : 85,
        status: "refined",
      });
    } catch (err) {
      console.error(err);
      alert("Error refining backlog item. Verify that your GEMINI_API_KEY is configured.");
    } finally {
      setIsRefining(false);
      setRefinementStep("");
    }
  };

  const promoteToReady = (item: BacklogItem) => {
    onUpdateBacklogItem({
      ...item,
      status: "ready-for-dev",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 45) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-500 bg-red-50 border-red-200";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Header */}
      <div className="border-b border-gray-100 pb-5">
        <h2 className="text-2xl font-display font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Compass className="w-6 h-6 text-blue-600" />
          Backlog Refinement & Grooming Studio
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Groom rough ideas and loose requests. Analyze alignment, score definition readiness, and compile technical specs for developers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Add item & lists (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Add Raw Form */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-gray-900 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-500" /> Add Raw Feature Idea
            </h3>

            <form onSubmit={handleCreateRaw} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-mono mb-1">
                  Draft Title / Summary
                </label>
                <input
                  type="text"
                  placeholder="e.g., Support Apple Pay"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-mono mb-1">
                  Rough Description / Draft Notes
                </label>
                <textarea
                  placeholder="What is this feature supposed to do? E.g., Allow users to check out with Apple Pay easily on iOS safari."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={!newTitle.trim()}
                className={`w-full font-medium text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                  !newTitle.trim()
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                Create Backlog Draft
              </button>
            </form>
          </div>

          {/* Catalog Lists */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-display font-bold text-gray-900 text-sm">
              Backlog Catalog ({productBacklogs.length})
            </h3>

            {productBacklogs.length === 0 ? (
              <div className="text-center py-10 text-xs text-gray-400 border border-dashed border-gray-100 rounded-xl">
                No backlog drafts yet. Add some above!
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {productBacklogs.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveItemId(item.id)}
                    className={`w-full text-left rounded-xl p-3 border text-xs font-medium transition-all flex items-center justify-between gap-2 ${
                      item.id === (activeItem?.id || null)
                        ? "bg-slate-50 border-blue-200 text-gray-900 ring-1 ring-blue-50"
                        : "border-gray-100 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <div className="truncate max-w-[70%] space-y-0.5">
                      <span className="font-bold block truncate">{item.title}</span>
                      <span className={`inline-block text-[9px] px-1.5 py-0.2 rounded font-mono ${
                        item.status === "ready-for-dev"
                          ? "bg-green-100 text-green-800 font-semibold"
                          : item.status === "refined"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>

                    <div className={`px-2 py-1 rounded font-mono font-bold text-[10px] border shrink-0 ${getScoreColor(item.score)}`}>
                      {item.score}%
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Detail & refinement view (8 cols) */}
        <div className="lg:col-span-8">
          {activeItem ? (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
              {/* Header Details */}
              <div className="bg-slate-50 border-b border-gray-100 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">Backlog Item:</span>
                    <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-semibold ${
                      activeItem.status === "ready-for-dev" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {activeItem.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-gray-900 text-sm">{activeItem.title}</h3>
                </div>

                {/* Score & Controls */}
                <div className="flex items-center gap-3 self-end md:self-center">
                  <div className="flex items-center gap-2 border border-gray-250 bg-white rounded-xl px-3 py-1.5 shrink-0">
                    <span className="text-[10px] font-mono font-semibold text-gray-400 uppercase">Groom Score:</span>
                    <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${getScoreColor(activeItem.score)}`}>
                      {activeItem.score}/100
                    </span>
                  </div>

                  {activeItem.status !== "ready-for-dev" && activeItem.status === "refined" && (
                    <button
                      onClick={() => promoteToReady(activeItem)}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Ready for Dev
                    </button>
                  )}

                  <button
                    onClick={() => handleRefine(activeItem)}
                    disabled={isRefining}
                    className={`font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                      isRefining
                        ? "bg-blue-300 text-blue-100 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    {isRefining ? "Refining..." : "Refine Ticket"}
                  </button>

                  <button
                    onClick={() => {
                      if (confirm("Delete this backlog item?")) {
                        onDeleteBacklogItem(activeItem.id);
                      }
                    }}
                    title="Delete Item"
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl border border-gray-200 bg-white cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Loader progress feedback */}
              {isRefining && (
                <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center gap-3 animate-pulse">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
                  <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider font-mono">AI Coach status:</span>
                  <span className="text-xs text-blue-700 font-medium">{refinementStep}</span>
                </div>
              )}

              {/* Before/After content comparison */}
              <div className="p-6 space-y-6 flex-1 max-h-[600px] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Before card: Raw prompt */}
                  <div className="bg-gray-50 border border-gray-150 rounded-xl p-5 space-y-3">
                    <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">
                      Raw Intake Requirements
                    </span>
                    <p className="text-xs text-gray-600 leading-relaxed italic whitespace-pre-wrap">
                      "{activeItem.description}"
                    </p>
                  </div>

                  {/* Refinement notes & Stakeholder queries */}
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-5 space-y-3">
                    <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider block flex items-center gap-1.5">
                      <FileQuestion className="w-3.5 h-3.5" /> Grooming Clarifications & Notes
                    </span>
                    {activeItem.refinementNotes ? (
                      <div className="text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap leading-relaxed">
                        {activeItem.refinementNotes}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        Click "Refine Ticket" above to query structural edge cases or clarify questions.
                      </p>
                    )}
                  </div>
                </div>

                {/* Final Specifications Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
                  <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-wider block flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> Refined Technical Specification Document
                  </span>

                  {activeItem.refinedDescription ? (
                    <div className="bg-slate-950 text-slate-200 font-mono text-xs rounded-xl p-5 overflow-x-auto leading-relaxed border border-slate-900 whitespace-pre-wrap">
                      {activeItem.refinedDescription}
                    </div>
                  ) : (
                    <div className="text-center py-12 border border-dashed border-gray-150 rounded-xl text-xs text-gray-400">
                      Feature item is unrefined. Click "Refine Ticket" to let the AI PM Copilot establish robust API structures, DB considerations, and edge-cases.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-gray-200 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center min-h-[480px]">
              <div className="bg-blue-100 text-blue-700 p-3.5 rounded-2xl mb-4">
                <Compass className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-display font-bold text-gray-900 text-base">Select or create raw ideas</h3>
              <p className="text-xs text-gray-500 max-w-sm mt-1.5">
                Input loose user requests, feedback, or tickets, then run the Refiner to translate them into production specifications.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
