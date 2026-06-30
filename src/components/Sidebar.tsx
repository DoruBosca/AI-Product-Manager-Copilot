import React, { useState } from "react";
import { Product } from "../types";
import { 
  LayoutDashboard, 
  FileText, 
  ListTodo, 
  Milestone, 
  Compass, 
  Plus, 
  Trash2, 
  Sparkles,
  ChevronRight,
  FolderDot
} from "lucide-react";

interface SidebarProps {
  products: Product[];
  currentProductId: string | null;
  activeTab: string;
  onSelectProduct: (id: string) => void;
  onAddProduct: (name: string) => void;
  onDeleteProduct: (id: string) => void;
  onSelectTab: (tab: string) => void;
}

export default function Sidebar({
  products,
  currentProductId,
  activeTab,
  onSelectProduct,
  onAddProduct,
  onDeleteProduct,
  onSelectTab,
}: SidebarProps) {
  const [newProductName, setNewProductName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const activeProduct = products.find(p => p.id === currentProductId) || null;

  const menuItems = [
    { id: "dashboard", label: "Product Vision", icon: LayoutDashboard },
    { id: "prd", label: "PRD Documenter", icon: FileText },
    { id: "stories", label: "Story Breakdown", icon: ListTodo },
    { id: "roadmap", label: "Strategic Roadmap", icon: Milestone },
    { id: "backlog", label: "Backlog Refinement", icon: Compass },
  ];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;
    onAddProduct(newProductName.trim());
    setNewProductName("");
    setShowAddForm(false);
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800">
      {/* Header / Brand */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-bold text-white tracking-tight text-base leading-tight">PM Copilot</h1>
            <p className="text-[10px] text-slate-500 font-mono">Enterprise Elite</p>
          </div>
        </div>
      </div>

      {/* Product Switcher Section */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/20">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
            Initiatives ({products.length})
          </span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors font-medium cursor-pointer"
          >
            <Plus className="w-3 h-3" /> New
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddSubmit} className="mb-3 px-1">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Product Name..."
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500 w-full"
                autoFocus
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Create
              </button>
            </div>
          </form>
        )}

        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
          {products.map((product) => (
            <div
              key={product.id}
              className={`group flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                product.id === currentProductId
                  ? "bg-slate-800 text-blue-400 font-bold"
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-white"
              }`}
            >
              <button
                onClick={() => onSelectProduct(product.id)}
                className="flex-1 text-left truncate flex items-center gap-2"
              >
                <FolderDot className={`w-3.5 h-3.5 ${product.id === currentProductId ? "text-blue-400" : "text-slate-500"}`} />
                <span className="truncate">{product.name}</span>
              </button>

              {products.length > 1 && (
                <button
                  onClick={() => onDeleteProduct(product.id)}
                  title="Delete Workspace"
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity p-0.5 rounded hover:bg-slate-700/50 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono mb-2 px-1">
          Workspace Tools
        </span>

        {activeProduct ? (
          menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
              </button>
            );
          })
        ) : (
          <div className="text-center p-4 text-[11px] text-slate-500 border border-dashed border-slate-800 rounded-lg">
            Select or create an initiative
          </div>
        )}
      </nav>

      {/* User profile footer - Exactly as Design HTML */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2 bg-slate-800 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold text-xs select-none">
            AR
          </div>
          <div>
            <p className="text-xs font-bold text-white">Alex Rivera</p>
            <p className="text-[10px] text-slate-400">Senior PM</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
