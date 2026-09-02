import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  X, 
  Sparkles, 
  FileText, 
  Tag, 
  TrendingUp,
  Cpu
} from 'lucide-react';

interface RAGKnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseQueryInAgent?: (query: string) => void;
}

export const RAGKnowledgeModal: React.FC<RAGKnowledgeModalProps> = ({
  isOpen,
  onClose,
  onUseQueryInAgent
}) => {
  const [searchQuery, setSearchQuery] = useState('decaf caffeine purity recovery');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (q: string) => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/rag/search?q=${encodeURIComponent(q)}&topK=4`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error('RAG Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      handleSearch(searchQuery);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0B10]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-[#1E293B] bg-[#0F172A] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#020617] text-[#38BDF8] border border-[#1E293B] flex items-center justify-center shadow-inner">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                RAG Domain Knowledge Engine
              </h3>
              <p className="text-xs text-[#94A3B8] font-mono">
                TF-IDF Cosine Vector Similarity Search across Coffee Science & GIS Corpora
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-[#020617] border-b border-[#1E293B] flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              placeholder="Search coffee chemistry, decaf thresholds, siting radii..."
              className="w-full bg-[#0F172A] border border-[#1E293B] text-white text-xs sm:text-sm rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-[#38BDF8] font-mono transition-colors"
            />
          </div>
          <button
            onClick={() => handleSearch(searchQuery)}
            disabled={isSearching}
            className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white font-bold text-xs font-mono transition-all cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.25)]"
          >
            {isSearching ? 'Searching...' : 'Vector Search'}
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {results.map((doc) => (
            <div
              key={doc.id}
              className="bg-[#020617] border border-[#1E293B] rounded-2xl p-4 space-y-2 hover:border-[#38BDF8]/40 transition-all shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0F172A] text-[#38BDF8] border border-[#1E293B]">
                      {doc.category}
                    </span>
                    <span className="text-xs font-mono text-[#64748B]">{doc.id}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">
                    {doc.title}
                  </h4>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-[#38BDF8] font-mono">
                    Score: {doc.similarityScore}
                  </div>
                  <div className="text-[9px] text-[#64748B] font-mono">Cosine Match</div>
                </div>
              </div>

              <p className="text-xs text-[#94A3B8] leading-relaxed">
                {doc.content}
              </p>

              <div className="flex flex-wrap gap-1 pt-1">
                {doc.keywords.map((kw: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#0F172A] border border-[#1E293B] text-[#64748B]"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
