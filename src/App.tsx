import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SitingMapLab } from './components/SitingMapLab';
import { AIAgentChat } from './components/AIAgentChat';
import { MenuCatalog } from './components/MenuCatalog';
import { CartDrawer } from './components/CartDrawer';
import { TelemetryDrawer } from './components/TelemetryDrawer';
import { TestSuiteModal } from './components/TestSuiteModal';
import { SoundSynthesizerModal } from './components/SoundSynthesizerModal';
import { RAGKnowledgeModal } from './components/RAGKnowledgeModal';
import { 
  CoffeeItem, 
  CartItem, 
  CartValidationResponse, 
  CityData, 
  CandidateShopSite, 
  AgentMessage 
} from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'siting' | 'agent' | 'catalog' | 'telemetry'>('siting');
  const [selectedCity, setSelectedCity] = useState<string>('austin');
  const [cityData, setCityData] = useState<CityData | null>(null);
  const [catalog, setCatalog] = useState<CoffeeItem[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartValidation, setCartValidation] = useState<CartValidationResponse | null>(null);

  // Modals
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
  const [isRAGModalOpen, setIsRAGModalOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Agent State
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'agent',
      content: `Welcome to VeloBrew Roasters! ☕🚴\n\nI am **Sage**, your AI Expansion Strategist and Barista Lead. I connect Gemini with our **BigQuery MCP Server** and municipal bikeshare datasets to identify high-converting, cyclist-friendly cafe placement sites.\n\nAsk me to analyze bicycle commuter corridors, rank candidate properties by ROI, or verify decaf purity thresholds (<3mg)!`,
      timestamp: new Date().toISOString(),
      threatEvaluation: {
        isSafe: true,
        threatLevel: 'CLEAN',
        threatScore: 0,
        flaggedPatterns: [],
        reasons: []
      }
    }
  ]);

  // Load Catalog on mount
  useEffect(() => {
    fetch('/api/catalog')
      .then((res) => res.json())
      .then((data) => {
        if (data.catalog) setCatalog(data.catalog);
      })
      .catch((err) => console.error('Failed to load catalog:', err));
  }, []);

  // Load City Data when city changes
  useEffect(() => {
    fetch(`/api/datasets/${selectedCity}`)
      .then((res) => res.json())
      .then((data) => setCityData(data))
      .catch((err) => console.error('Failed to load city data:', err));
  }, [selectedCity]);

  // Validate cart on server whenever items change
  const validateCartOnServer = async (items: CartItem[]) => {
    try {
      const res = await fetch('/api/cart/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      const data: CartValidationResponse = await res.json();
      setCartValidation(data);
      if (data.items) {
        setCartItems(data.items);
      }
    } catch (err) {
      console.error('Cart validation failed:', err);
    }
  };

  const handleAddToCart = (item: CoffeeItem, customizations?: any) => {
    const existingIndex = cartItems.findIndex((i) => i.id === item.id);
    let updated: CartItem[];

    if (existingIndex > -1) {
      updated = cartItems.map((ci, idx) =>
        idx === existingIndex
          ? {
              ...ci,
              quantity: ci.quantity + 1,
              lineTotal: (ci.quantity + 1) * ci.unitPrice
            }
          : ci
      );
    } else {
      let unitPrice = item.price;
      if (customizations?.extraShot) unitPrice += 1.0;
      if (customizations?.milkType && customizations.milkType !== 'standard') unitPrice += 0.75;

      const newItem: CartItem = {
        id: item.id,
        name: item.name,
        quantity: 1,
        unitPrice,
        lineTotal: unitPrice,
        catalogItem: item,
        appliedCustomizations: customizations
      };
      updated = [...cartItems, newItem];
    }

    validateCartOnServer(updated);
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }
    const updated = cartItems.map((ci) =>
      ci.id === id
        ? { ...ci, quantity: newQty, lineTotal: newQty * ci.unitPrice }
        : ci
    );
    validateCartOnServer(updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = cartItems.filter((ci) => ci.id !== id);
    validateCartOnServer(updated);
  };

  const handleClearCart = () => {
    setCartItems([]);
    setCartValidation(null);
  };

  // Tamper Attack Simulator Handlers
  const handleSimulatePriceTamper = (id: string, tamperedPrice: number) => {
    const tamperedPayload = cartItems.map((ci) =>
      ci.id === id ? { ...ci, clientSubmittedPrice: tamperedPrice } : ci
    );
    validateCartOnServer(tamperedPayload);
  };

  const handleSimulateNegativeQty = (id: string) => {
    const tamperedPayload = cartItems.map((ci) =>
      ci.id === id ? { ...ci, quantity: -5 } : ci
    );
    validateCartOnServer(tamperedPayload);
  };

  // Expansion Agent Query Handler
  const handleSendMessageToAgent = async (userText: string) => {
    const userMsg: AgentMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: userText,
      timestamp: new Date().toISOString()
    };

    setAgentMessages((prev) => [...prev, userMsg]);
    setIsAgentLoading(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, city: selectedCity })
      });
      const data = await res.json();

      const agentMsg: AgentMessage = {
        id: `agent-${Date.now()}`,
        sender: data.threatEvaluation?.threatLevel === 'CRITICAL_BLOCK' ? 'security_system' : 'agent',
        content: data.reply || data.error || 'Agent execution completed.',
        timestamp: new Date().toISOString(),
        threatEvaluation: data.threatEvaluation,
        toolCallsExecuted: data.toolCallsExecuted,
        ragDocumentsUsed: data.ragDocumentsUsed,
        telemetryTraces: data.telemetryTraces,
        recommendedSite: data.recommendedSite,
        totalLatencyMs: data.totalLatencyMs
      };

      setAgentMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      setAgentMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'security_system',
          content: `Error communicating with Expansion Agent: ${err.message}`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsAgentLoading(false);
    }
  };

  const handleCandidateSelectedForAgent = (site: CandidateShopSite) => {
    setActiveTab('agent');
    handleSendMessageToAgent(
      `Perform an in-depth siting analysis for candidate site "${site.name}" (ID: ${site.siteId}) located at ${site.address} in ${site.city}. Evaluate cyclist traffic, competitor buffer, and recommended store format.`
    );
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0A0B10] text-[#E0E0E0] flex flex-col font-sans selection:bg-[#38BDF8]/30 selection:text-[#38BDF8] relative overflow-x-hidden">
      {/* Ambient background glow & subtle cyber grid */}
      <div className="fixed inset-0 bg-radial-glow pointer-events-none z-0" />
      <div className="fixed inset-0 bg-grid-cyber opacity-[0.035] pointer-events-none z-0" />
      
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        cartCount={totalCartCount}
        openCart={() => setIsCartDrawerOpen(true)}
        openTestModal={() => setIsTestModalOpen(true)}
        openSoundModal={() => setIsSoundModalOpen(true)}
        openRAGModal={() => setIsRAGModalOpen(true)}
      />

      {/* Main Workspace Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {activeTab === 'siting' && (
          <SitingMapLab
            cityData={cityData}
            selectedCity={selectedCity}
            onSelectCandidateForAgent={handleCandidateSelectedForAgent}
            onOpenBigQueryQuery={(sql) => {
              setActiveTab('siting');
            }}
          />
        )}

        {activeTab === 'agent' && (
          <AIAgentChat
            messages={agentMessages}
            onSendMessage={handleSendMessageToAgent}
            isLoading={isAgentLoading}
            selectedCity={selectedCity}
          />
        )}

        {activeTab === 'catalog' && (
          <MenuCatalog
            catalog={catalog}
            onAddToCart={handleAddToCart}
          />
        )}

        {activeTab === 'telemetry' && (
          <TelemetryDrawer messages={agentMessages} />
        )}
      </main>

      {/* Modals & Drawers */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        validatedState={cartValidation}
        onSimulatePriceTamper={handleSimulatePriceTamper}
        onSimulateNegativeQty={handleSimulateNegativeQty}
      />

      <TestSuiteModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />

      <SoundSynthesizerModal
        isOpen={isSoundModalOpen}
        onClose={() => setIsSoundModalOpen(false)}
      />

      <RAGKnowledgeModal
        isOpen={isRAGModalOpen}
        onClose={() => setIsRAGModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-[#1E293B] bg-[#0F172A]/80 backdrop-blur-md py-4 text-center text-xs text-[#64748B] font-mono relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]"></span>
            <span>BEANSTREAM / VELOBREW EXPANSION AGENT • Siting Optimization &amp; BigQuery MCP</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-green-400 font-semibold tracking-wide uppercase text-[11px]">Defense-in-Depth ACTIVE (PromptGuard • CartValidator • InputSanitizer)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
