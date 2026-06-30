import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getInitialWorkspace } from "./initialState";
import { WorkspaceState, Product, PRD, UserStory, RoadmapItem, BacklogItem } from "./types";
import Sidebar from "./components/Sidebar";
import DashboardTab from "./components/DashboardTab";
import PrdTab from "./components/PrdTab";
import UserStoryTab from "./components/UserStoryTab";
import RoadmapTab from "./components/RoadmapTab";
import BacklogTab from "./components/BacklogTab";
import { FolderHeart, ChevronRight, CheckCircle, Flame, Target } from "lucide-react";

export default function App() {
  const [state, setState] = useState<WorkspaceState>(() => {
    const saved = localStorage.getItem("ai_pm_copilot_workspace_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.products && parsed.products.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved workspace state", e);
      }
    }
    return getInitialWorkspace();
  });

  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    localStorage.setItem("ai_pm_copilot_workspace_v1", JSON.stringify(state));
  }, [state]);

  const currentProduct = state.products.find(p => p.id === state.currentProductId) || null;

  // PRODUCT ACTIONS
  const handleSelectProduct = (id: string) => {
    setState(prev => ({ ...prev, currentProductId: id }));
  };

  const handleAddProduct = (name: string) => {
    const newProduct: Product = {
      id: `product-${Date.now()}`,
      name,
      targetAudience: "Not specified yet",
      problemStatement: "Describe the core user problem here...",
      valueProp: "Outline your product value proposition here...",
      objectives: "1. Key objective here",
      createdAt: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      products: [...prev.products, newProduct],
      currentProductId: newProduct.id
    }));
    setActiveTab("dashboard");
  };

  const handleDeleteProduct = (id: string) => {
    setState(prev => {
      const remainingProducts = prev.products.filter(p => p.id !== id);
      let nextActiveId = prev.currentProductId;
      if (prev.currentProductId === id) {
        nextActiveId = remainingProducts.length > 0 ? remainingProducts[0].id : null;
      }
      return {
        ...prev,
        products: remainingProducts,
        currentProductId: nextActiveId,
        // Optional cascade deletes
        prds: prev.prds.filter(prd => prd.productId !== id),
        userStories: prev.userStories.filter(us => us.productId !== id),
        roadmapItems: prev.roadmapItems.filter(rm => rm.productId !== id),
        backlogItems: prev.backlogItems.filter(bl => bl.productId !== id)
      };
    });
  };

  const handleUpdateProduct = (updated: Product) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === updated.id ? updated : p)
    }));
  };

  // PRD ACTIONS
  const handleAddPRD = (prd: PRD) => {
    setState(prev => ({
      ...prev,
      prds: [prd, ...prev.prds]
    }));
  };

  const handleUpdatePRD = (updated: PRD) => {
    setState(prev => ({
      ...prev,
      prds: prev.prds.map(p => p.id === updated.id ? updated : p)
    }));
  };

  const handleDeletePRD = (id: string) => {
    setState(prev => ({
      ...prev,
      prds: prev.prds.filter(p => p.id !== id)
    }));
  };

  // USER STORY ACTIONS
  const handleAddStory = (story: UserStory) => {
    setState(prev => ({
      ...prev,
      userStories: [story, ...prev.userStories]
    }));
  };

  const handleUpdateStory = (updated: UserStory) => {
    setState(prev => ({
      ...prev,
      userStories: prev.userStories.map(s => s.id === updated.id ? updated : s)
    }));
  };

  const handleDeleteStory = (id: string) => {
    setState(prev => ({
      ...prev,
      userStories: prev.userStories.filter(s => s.id !== id)
    }));
  };

  // ROADMAP ACTIONS
  const handleAddRoadmapItem = (item: RoadmapItem) => {
    setState(prev => ({
      ...prev,
      roadmapItems: [...prev.roadmapItems, item]
    }));
  };

  const handleUpdateRoadmapItem = (updated: RoadmapItem) => {
    setState(prev => ({
      ...prev,
      roadmapItems: prev.roadmapItems.map(item => item.id === updated.id ? updated : item)
    }));
  };

  const handleDeleteRoadmapItem = (id: string) => {
    setState(prev => ({
      ...prev,
      roadmapItems: prev.roadmapItems.filter(item => item.id !== id)
    }));
  };

  // BACKLOG ACTIONS
  const handleAddBacklogItem = (item: BacklogItem) => {
    setState(prev => ({
      ...prev,
      backlogItems: [item, ...prev.backlogItems]
    }));
  };

  const handleUpdateBacklogItem = (updated: BacklogItem) => {
    setState(prev => ({
      ...prev,
      backlogItems: prev.backlogItems.map(b => b.id === updated.id ? updated : b)
    }));
  };

  const handleDeleteBacklogItem = (id: string) => {
    setState(prev => ({
      ...prev,
      backlogItems: prev.backlogItems.filter(b => b.id !== id)
    }));
  };

  // Quick stats indicators for top header
  const getProductStats = () => {
    if (!currentProduct) return null;
    const prdCount = state.prds.filter(p => p.productId === currentProduct.id).length;
    const storyCount = state.userStories.filter(s => s.productId === currentProduct.id).length;
    const roadmapCount = state.roadmapItems.filter(r => r.productId === currentProduct.id).length;
    const backlogCount = state.backlogItems.filter(b => b.productId === currentProduct.id && b.status === "unrefined").length;

    return { prdCount, storyCount, roadmapCount, backlogCount };
  };

  const stats = getProductStats();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 font-sans text-gray-800">
      {/* Sidebar navigation */}
      <Sidebar
        products={state.products}
        currentProductId={state.currentProductId}
        activeTab={activeTab}
        onSelectProduct={handleSelectProduct}
        onAddProduct={handleAddProduct}
        onDeleteProduct={handleDeleteProduct}
        onSelectTab={setActiveTab}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-150 px-8 py-4.5 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
            <FolderHeart className="w-4 h-4 text-slate-500" />
            <span>Workspace</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-bold font-display">
              {currentProduct ? currentProduct.name : "Select Initiative"}
            </span>
          </div>

          {/* KPI Mini badging */}
          {currentProduct && stats && (
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 bg-slate-50 border border-gray-100 rounded-lg px-2.5 py-1">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                <span className="text-[10px] font-mono text-gray-500 uppercase">Stories Breakdown:</span>
                <span className="text-xs font-bold text-gray-800">{stats.storyCount}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 border border-gray-100 rounded-lg px-2.5 py-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-[10px] font-mono text-gray-500 uppercase">Roadmaps Milestones:</span>
                <span className="text-xs font-bold text-gray-800">{stats.roadmapCount}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 border border-gray-100 rounded-lg px-2.5 py-1">
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-[10px] font-mono text-gray-500 uppercase">Backlog drafts:</span>
                <span className="text-xs font-bold text-gray-800">{stats.backlogCount}</span>
              </div>
            </div>
          )}
        </header>

        {/* Dynamic Canvas Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {currentProduct ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
                className="h-full"
              >
                {activeTab === "dashboard" && (
                  <DashboardTab
                    product={currentProduct}
                    onUpdateProduct={handleUpdateProduct}
                  />
                )}
                {activeTab === "prd" && (
                  <PrdTab
                    product={currentProduct}
                    prds={state.prds}
                    onAddPRD={handleAddPRD}
                    onUpdatePRD={handleUpdatePRD}
                    onDeletePRD={handleDeletePRD}
                  />
                )}
                {activeTab === "stories" && (
                  <UserStoryTab
                    product={currentProduct}
                    prds={state.prds}
                    userStories={state.userStories}
                    onAddStory={handleAddStory}
                    onUpdateStory={handleUpdateStory}
                    onDeleteStory={handleDeleteStory}
                  />
                )}
                {activeTab === "roadmap" && (
                  <RoadmapTab
                    product={currentProduct}
                    backlogItems={state.backlogItems}
                    roadmapItems={state.roadmapItems}
                    onAddRoadmapItem={handleAddRoadmapItem}
                    onUpdateRoadmapItem={handleUpdateRoadmapItem}
                    onDeleteRoadmapItem={handleDeleteRoadmapItem}
                  />
                )}
                {activeTab === "backlog" && (
                  <BacklogTab
                    product={currentProduct}
                    backlogItems={state.backlogItems}
                    onAddBacklogItem={handleAddBacklogItem}
                    onUpdateBacklogItem={handleUpdateBacklogItem}
                    onDeleteBacklogItem={handleDeleteBacklogItem}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-12 max-w-sm mx-auto">
              <div className="bg-indigo-100 text-indigo-700 p-4 rounded-full mb-4">
                <FolderHeart className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="font-display font-bold text-gray-900 text-base">Welcome to PM Copilot</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Create a new Product Initiative in the sidebar or select an existing one to unlock your strategic workspace tools.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
