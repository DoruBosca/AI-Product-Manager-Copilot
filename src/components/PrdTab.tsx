import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Product, PRD } from "../types";
import { 
  Sparkles, 
  Download, 
  Copy, 
  Edit3, 
  Eye, 
  Check, 
  Trash2, 
  Plus, 
  FileText, 
  CheckCircle,
  FileClock,
  ExternalLink
} from "lucide-react";

interface PrdTabProps {
  product: Product;
  prds: PRD[];
  onAddPRD: (prd: PRD) => void;
  onUpdatePRD: (prd: PRD) => void;
  onDeletePRD: (id: string) => void;
}

export default function PrdTab({
  product,
  prds,
  onAddPRD,
  onUpdatePRD,
  onDeletePRD,
}: PrdTabProps) {
  const [featureTitle, setFeatureTitle] = useState("");
  const [featureDesc, setFeatureDesc] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [activePrdId, setActivePrdId] = useState<string | null>(
    prds.length > 0 ? prds[0].id : null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const productPrds = prds.filter(p => p.productId === product.id);
  const activePrd = productPrds.find(p => p.id === activePrdId) || (productPrds.length > 0 ? productPrds[0] : null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureTitle.trim()) return;

    setIsGenerating(true);
    setGenerationStep("Analyzing target audience & objectives...");

    try {
      const steps = [
        "Structuring Document Framework...",
        "Simulating Sarah the Indie Hacker and user personas...",
        "Synthesizing functional requirements (P0, P1, P2)...",
        "Formulating design considerations and KPIs...",
        "Assembling complete markdown spec sheet..."
      ];

      // Simulate step increments while calling backend
      let stepIdx = 0;
      const stepInterval = setInterval(() => {
        if (stepIdx < steps.length) {
          setGenerationStep(steps[stepIdx]);
          stepIdx++;
        }
      }, 1500);

      const response = await fetch("/api/copilot/generate-prd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: product.name,
          targetAudience: product.targetAudience,
          problemStatement: product.problemStatement,
          objectives: product.objectives,
          featureTitle: featureTitle.trim(),
          featureDescription: featureDesc.trim(),
        }),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        throw new Error("Failed to generate PRD on server.");
      }

      const data = await response.json();

      const newPRD: PRD = {
        id: `prd-${Date.now()}`,
        productId: product.id,
        title: data.title || featureTitle.trim(),
        featureDescription: featureDesc.trim(),
        content: data.content || "Failed to parse PRD specifications.",
        status: "draft",
        createdAt: new Date().toISOString(),
      };

      onAddPRD(newPRD);
      setActivePrdId(newPRD.id);
      setFeatureTitle("");
      setFeatureDesc("");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Error generating PRD. Please verify your GEMINI_API_KEY is configured in the Secrets panel.");
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  const handleCopy = () => {
    if (!activePrd) return;
    navigator.clipboard.writeText(activePrd.content);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownload = () => {
    if (!activePrd) return;
    const element = document.createElement("a");
    const file = new Blob([activePrd.content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${activePrd.title.replace(/\s+/g, "_")}_PRD.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const toggleEdit = () => {
    if (!activePrd) return;
    if (!isEditing) {
      setEditContent(activePrd.content);
    } else {
      onUpdatePRD({
        ...activePrd,
        content: editContent,
      });
    }
    setIsEditing(!isEditing);
  };

  const updateStatus = (status: PRD["status"]) => {
    if (!activePrd) return;
    onUpdatePRD({
      ...activePrd,
      status,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Header */}
      <div className="border-b border-gray-100 pb-5">
        <h2 className="text-2xl font-display font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          PRD Documenter & Spec Studio
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Draft detailed product specifications. Use the Copilot to create comprehensive requirements, then refine or approve them.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Creation and List (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* PRD AI Generator Form */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-gray-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-blue-500 animate-pulse" />
              Generate PRD with AI
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-mono mb-1">
                  Feature / Epic Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Stripe Payment Integration"
                  value={featureTitle}
                  onChange={(e) => setFeatureTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                  required
                  disabled={isGenerating}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider font-mono mb-1">
                  Feature Objective & Brief (Optional)
                </label>
                <textarea
                  placeholder="e.g., Let the user pay a one-time flat fee of $199 with credit card to trigger automated state incorporation..."
                  value={featureDesc}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                  disabled={isGenerating}
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating || !featureTitle.trim()}
                className={`w-full font-medium text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                  isGenerating || !featureTitle.trim()
                    ? "bg-blue-300 text-blue-100 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isGenerating ? "Drafting Document..." : "Write Requirements"}
              </button>
            </form>

            {isGenerating && (
              <div className="border border-blue-50 bg-blue-50/50 rounded-xl p-3 text-center space-y-2 animate-pulse">
                <div className="flex justify-center">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider font-mono text-blue-600">
                  PM Copilot Status
                </p>
                <p className="text-xs text-blue-700 font-medium">{generationStep}</p>
              </div>
            )}
          </div>

          {/* Historical PRD list for current product */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="font-display font-bold text-gray-900 text-sm flex items-center gap-2 mb-3">
              <FileClock className="w-4.5 h-4.5 text-gray-400" />
              Document Catalog ({productPrds.length})
            </h3>

            {productPrds.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400 border border-dashed border-gray-100 rounded-xl">
                No specifications generated yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {productPrds.map((prd) => (
                  <button
                    key={prd.id}
                    onClick={() => {
                      setActivePrdId(prd.id);
                      setIsEditing(false);
                    }}
                    className={`w-full text-left rounded-xl p-3 border text-xs font-medium transition-all ${
                      prd.id === (activePrd?.id || null)
                        ? "bg-slate-50 border-blue-200 text-gray-900 ring-1 ring-blue-50"
                        : "border-gray-100 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold truncate max-w-[70%]">{prd.title}</span>
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] border ${
                        prd.status === "approved"
                          ? "bg-green-50 border-green-200 text-green-700 font-semibold"
                          : prd.status === "under-review"
                          ? "bg-amber-50 border-amber-200 text-amber-700"
                          : "bg-gray-50 border-gray-200 text-gray-500"
                      }`}>
                        {prd.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 truncate">
                      {new Date(prd.createdAt).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Document Detail and Editor (8 cols) */}
        <div className="lg:col-span-8">
          {activePrd ? (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
              {/* Doc Control Bar */}
              <div className="bg-slate-50 border-b border-gray-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-mono font-bold">
                    SPEC
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-gray-900 text-sm truncate max-w-[280px] md:max-w-md">
                      {activePrd.title}
                    </h4>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {/* Status Dropdown / Buttons */}
                  <div className="flex rounded-lg border border-gray-200 p-0.5 bg-white">
                    {(["draft", "under-review", "approved"] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => updateStatus(st)}
                        className={`px-2 py-1 rounded-md text-[10px] font-mono capitalize font-medium transition-all ${
                          activePrd.status === st
                            ? st === "approved"
                              ? "bg-green-600 text-white font-bold"
                              : st === "under-review"
                              ? "bg-amber-500 text-white font-bold"
                              : "bg-gray-600 text-white font-bold"
                            : "text-gray-400 hover:text-gray-700"
                        }`}
                      >
                        {st.replace("-", " ")}
                      </button>
                    ))}
                  </div>

                  <span className="w-px h-6 bg-gray-200 mx-1"></span>

                  {/* Actions */}
                  <button
                    onClick={toggleEdit}
                    title={isEditing ? "Save & View" : "Edit Markdown"}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors bg-white cursor-pointer"
                  >
                    {isEditing ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleCopy}
                    title="Copy Markdown"
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors bg-white cursor-pointer relative"
                  >
                    {copySuccess ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleDownload}
                    title="Download Markdown"
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors bg-white cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm("Delete this PRD document?")) {
                        onDeletePRD(activePrd.id);
                      }
                    }}
                    title="Delete spec document"
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors bg-white cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Doc Body */}
              <div className="p-6 flex-1 min-h-[420px] max-h-[600px] overflow-y-auto">
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-full min-h-[400px] font-mono text-xs p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white resize-y leading-relaxed"
                  />
                ) : (
                  <div className="markdown-body">
                    <ReactMarkdown>{activePrd.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-gray-200 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center min-h-[480px]">
              <div className="bg-blue-100 text-blue-700 p-3.5 rounded-2xl mb-4">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-display font-bold text-gray-900 text-base">Select or Generate a PRD</h3>
              <p className="text-xs text-gray-500 max-w-sm mt-1.5">
                Type a feature name and trigger the AI PM Copilot in the left panel to produce a spec document immediately.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
