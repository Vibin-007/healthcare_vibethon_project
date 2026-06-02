import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, Bell, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AIChatBot from "./AIChatBot";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile } = useAuth();

  return (
    <div className="flex h-screen bg-neutral-50 bg-dot-grid">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between p-4 bg-white border-b border-neutral-200 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="hidden lg:block w-64">
              {/* Optional space for breadcrumbs or title */}
            </div>
          </div>

          <div className="flex items-center gap-4 flex-1 justify-end max-w-xl">
            
            <button className="relative p-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-full hover:bg-neutral-50">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-black rounded-full border-2 border-white"></span>
            </button>
            
            <button className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden border border-neutral-200 shadow-sm ring-1 ring-neutral-100">
              {profile?.name ? (
                <span className="text-white text-sm font-semibold">{profile.name.charAt(0).toUpperCase()}</span>
              ) : (
                <User size={18} className="text-white" />
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto animate-fade-in">
          {children}
        </main>
      </div>
      
      {/* Global AI Chatbot Widget */}
      <AIChatBot />
    </div>
  );
}
