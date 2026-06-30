import React, { useState, useEffect } from "react";
import { Product } from "../types";
import { Sparkles, Save, HelpCircle, Users, AlertCircle, Award, Target, Rocket } from "lucide-react";

interface DashboardTabProps {
  product: Product;
  onUpdateProduct: (updated: Product) => void;
}

export default function DashboardTab({ product, onUpdateProduct }: DashboardTabProps) {
  const [name, setName] = useState(product.name);
  const [targetAudience, setTargetAudience] = useState(product.targetAudience);
  const [problemStatement, setProblemStatement] = useState(product.problemStatement);
  const [valueProp, setValueProp] = useState(product.valueProp);
  const [objectives, setObjectives] = useState(product.objectives);
  const [isSaved, setIsSaved] = useState(false);

  // Sync state when product shifts
  useEffect(() => {
    setName(product.name);
    setTargetAudience(product.targetAudience);
    setProblemStatement(product.problemStatement);
    setValueProp(product.valueProp);
    setObjectives(product.objectives);
    setIsSaved(false);
  }, [product]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProduct({
      ...product,
      name,
      targetAudience,
      problemStatement,
      valueProp,
      objectives,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Rocket className="w-6 h-6 text-blue-600" />
            Product Vision Studio
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Establish the core strategic context. All generated PRDs, User Stories, and Roadmaps derive directly from these specs.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-2 text-xs text-blue-700 font-mono self-start md:self-center">
          <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
          <span>Core AI Context: Active</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Inputs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 shadow-sm">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 font-mono mb-1.5">
                Product Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-display font-medium"
                required
              />
            </div>

            {/* Target Audience */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Users className="w-4 h-4 text-gray-400" />
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 font-mono">
                  Target Audience
                </label>
              </div>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Indie hackers, startup founders, marketing team heads..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                required
              />
            </div>

            {/* Problem Statement */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <AlertCircle className="w-4 h-4 text-gray-400" />
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 font-mono">
                  Problem Statement
                </label>
              </div>
              <textarea
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="What critical friction or pain point is your audience facing that warrants building this?"
                rows={4}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                required
              />
            </div>

            {/* Value Proposition */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Award className="w-4 h-4 text-gray-400" />
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 font-mono">
                  Key Value Proposition
                </label>
              </div>
              <textarea
                value={valueProp}
                onChange={(e) => setValueProp(e.target.value)}
                placeholder="How does your solution eliminate this friction in a completely unique or superior way?"
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                required
              />
            </div>

            {/* Key Objectives */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Target className="w-4 h-4 text-gray-400" />
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 font-mono">
                  Key Milestones & Objectives
                </label>
              </div>
              <textarea
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                placeholder="1. Reach 10k monthly active users&#10;2. Cut user churn rate down by 20%&#10;3. Set up seamless stripe payouts..."
                rows={4}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono text-xs leading-relaxed"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              {isSaved && (
                <span className="text-xs text-green-600 font-mono font-medium animate-fade-in">
                  ✓ Vision updated successfully!
                </span>
              )}
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Strategy
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Help Card */}
        <div className="space-y-6">
          <div className="bg-slate-50 border border-gray-100 rounded-2xl p-6 space-y-4">
            <h3 className="font-display font-bold text-gray-900 text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-500" /> Why this matters
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              When using Copilot, raw AI tools often lack the business context to produce usable documents. 
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              By filling this out, you provide LaunchPad with a "Strategic compass." When you generate user stories, refine your backlog, or request a roadmap, the backend merges these variables into the prompt payloads.
            </p>
            <div className="border-t border-gray-200/60 pt-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 font-mono">
                Copilot Tip
              </h4>
              <div className="text-xs text-gray-500 bg-white border border-gray-100 rounded-xl p-3 italic">
                "Keep your target audience specific. Instead of 'Everyone,' type 'Product Designers working remotely in corporate SaaS startups.'"
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
