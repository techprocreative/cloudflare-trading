import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../components/ui/resizable";
import { ChatPanel } from "../components/ChatPanel";
import { DashboardPanel } from "../components/DashboardPanel";
import { ThemeToggle } from "../components/ThemeToggle";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { useIsMobile } from "../hooks/use-mobile";
import { Bot, LineChart, Menu, X, CreditCard, FileText } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (isMobile) {
    return (
      <div className="relative flex h-screen flex-col bg-gray-950 text-white">
        {/* Mobile Header */}
        <div className="relative flex items-center justify-between border-b border-white/10 bg-gray-900 p-4">
          <h1 className="text-lg font-bold">Signal Sage AI</h1>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-b border-white/10 bg-gray-800 p-4">
            <nav className="grid grid-cols-2 gap-4">
              <Link
                to="/pricing"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-gray-700 p-3 text-center text-sm hover:bg-gray-600"
              >
                <CreditCard className="h-4 w-4" />
                {t('nav.pricing')}
              </Link>
              <Link
                to="/terms"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-gray-700 p-3 text-center text-sm hover:bg-gray-600"
              >
                <FileText className="h-4 w-4" />
                {t('legal.termsOfService')}
              </Link>
            </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {activeTab === 'dashboard' && <DashboardPanel />}
          {activeTab === 'chat' && <ChatPanel />}
        </main>

        {/* Bottom Navigation */}
        <nav className="flex flex-shrink-0 border-t border-white/10 bg-gray-900">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 p-3 text-xs transition-colors",
              activeTab === 'dashboard' ? "text-indigo-400" : "text-gray-400 hover:text-white"
            )}
          >
            <LineChart className="h-5 w-5" />
            {t('nav.dashboard')}
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 p-3 text-xs transition-colors",
              activeTab === 'chat' ? "text-indigo-400" : "text-gray-400 hover:text-white"
            )}
          >
            <Bot className="h-5 w-5" />
            {t('nav.chat')}
          </button>
        </nav>
      </div>
    );
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-gray-950 text-white">
      {/* Desktop Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-gray-900 p-4">
        <h1 className="text-xl font-bold">Signal Sage AI</h1>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/pricing"
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              {t('nav.pricing')}
            </Link>
            <Link
              to="/terms"
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              <FileText className="h-4 w-4" />
              {t('legal.termsOfService')}
            </Link>
          </nav>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      <div className="relative mx-auto h-full max-w-screen-2xl p-4 md:p-6">
        <ResizablePanelGroup
          direction="horizontal"
          className="h-full rounded-lg border border-white/10"
        >
          <ResizablePanel defaultSize={40} minSize={30}>
            <ChatPanel />
          </ResizablePanel>
          <ResizableHandle withHandle className="bg-gray-800" />
          <ResizablePanel defaultSize={60} minSize={40}>
            <DashboardPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </main>
  );
}