import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Play, 
  RefreshCw, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  X,
  Sparkles
} from 'lucide-react';
import { TestSuiteResult } from '../types';

interface TestSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestSuiteModal: React.FC<TestSuiteModalProps> = ({
  isOpen,
  onClose
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestSuiteResult | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const runTests = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/tests/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      console.error('Test run failed:', err);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isOpen && !results && !isRunning) {
      runTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredTests = results?.tests.filter((t) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'unit' && t.category === 'Unit Test') return true;
    if (activeCategory === 'security' && t.category === 'Security Test') return true;
    if (activeCategory === 'integration' && t.category === 'Integration Test') return true;
    return true;
  }) || [];

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0B10]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-[#1E293B] bg-[#0F172A] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#020617] text-[#22C55E] border border-[#1E293B] flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Automated Test Suite</span>
                <span className="text-xs font-mono text-[#22C55E] font-normal">(14/14 Tests)</span>
              </h3>
              <p className="text-xs text-[#94A3B8] font-mono">
                RAG Ranking • Allergen Filters • PromptGuard Penetration • Cart Tamper Defense
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={runTests}
              disabled={isRunning}
              className="px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] disabled:opacity-50 text-white font-bold text-xs font-mono flex items-center space-x-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.3)]"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Running Tests...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Re-Run All 14 Tests</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results Overview Bar */}
        {results && (
          <div className="px-5 py-3 bg-[#020617] border-b border-[#1E293B] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5">
                <span className="text-[#64748B]">Status:</span>
                <span className={`font-bold ${results.summary.status === 'ALL_PASSED_GREEN' ? 'text-[#22C55E]' : 'text-rose-400'}`}>
                  {results.summary.status}
                </span>
              </span>
              <span className="text-[#94A3B8]">
                Passed: <strong className="text-[#22C55E]">{results.summary.passed}</strong> / {results.summary.total}
              </span>
              <span className="text-[#64748B]">
                Duration: {results.summary.durationMs}ms
              </span>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center space-x-1">
              {[
                { id: 'all', label: 'All (14)' },
                { id: 'unit', label: 'Unit (3)' },
                { id: 'security', label: 'Security (10)' },
                { id: 'integration', label: 'Integration (1)' }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                    activeCategory === c.id
                      ? 'bg-[#020617] text-[#38BDF8] font-bold border border-[#38BDF8]/60 shadow-[0_0_8px_rgba(56,189,248,0.2)]'
                      : 'text-[#64748B] hover:text-white border border-transparent'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tests List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className={`p-3.5 rounded-xl border flex flex-col space-y-1 font-mono text-xs transition-all ${
                test.passed
                  ? 'bg-[#020617] border-[#1E293B] hover:border-[#22C55E]/40 text-[#E0E0E0]'
                  : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {test.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span className="font-bold text-white">
                    [TEST {test.id.toString().padStart(2, '0')}/14] {test.name}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-[#0F172A] border border-[#1E293B] text-[#38BDF8] uppercase tracking-wider">
                  {test.category}
                </span>
              </div>
              <div className="text-[11px] text-[#94A3B8] pl-6 leading-relaxed">
                {test.details}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
