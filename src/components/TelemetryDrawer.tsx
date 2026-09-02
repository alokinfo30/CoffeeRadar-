import React from 'react';
import { 
  Activity, 
  Terminal, 
  Database, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { AgentMessage } from '../types';

interface TelemetryDrawerProps {
  messages: AgentMessage[];
}

export const TelemetryDrawer: React.FC<TelemetryDrawerProps> = ({ messages }) => {
  // Aggregate all telemetry traces across all agent interactions
  const allTraces = messages.flatMap((m) =>
    (m.telemetryTraces || []).map((t) => ({
      ...t,
      messageId: m.id,
      threatScore: m.threatEvaluation?.threatScore,
      threatLevel: m.threatEvaluation?.threatLevel
    }))
  );

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ADK TELEMETRY &amp; TRACING
            </span>
            <h2 className="text-xl font-bold text-stone-100">
              Agent Execution &amp; Model Context Protocol Traces
            </h2>
          </div>
          <p className="text-sm text-stone-400 mt-1">
            Real-time multi-agent execution pipeline inspecting PromptGuard evaluation, RAG vector similarity, BigQuery MCP tool execution, and Gemini reasoning.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800">
            <span className="text-stone-400">Total Steps Recorded: </span>
            <strong className="text-amber-400">{allTraces.length}</strong>
          </div>
        </div>
      </div>

      {/* Trace Timeline */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider font-mono flex items-center space-x-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Execution Graph Timeline</span>
        </h3>

        {allTraces.length === 0 ? (
          <div className="text-center py-12 text-stone-500 space-y-2">
            <Terminal className="w-10 h-10 mx-auto stroke-[1.2] text-stone-600" />
            <p className="text-sm">No agent traces recorded yet.</p>
            <p className="text-xs text-stone-600">Send a query to Sage or run a site analysis to generate live MCP traces.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allTraces.map((trace, idx) => (
              <div
                key={idx}
                className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 font-mono text-xs space-y-2 transition-all hover:border-stone-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800/80 pb-2">
                  <div className="flex items-center space-x-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      trace.actionType === 'PROMPTGUARD_SCAN'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                        : trace.actionType === 'RAG_RETRIEVAL'
                        ? 'bg-sky-950/80 text-sky-400 border border-sky-500/30'
                        : trace.actionType === 'MCP_TOOL_CALL' || trace.actionType === 'BIGQUERY_EXECUTION'
                        ? 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                        : 'bg-purple-950/80 text-purple-400 border border-purple-500/30'
                    }`}>
                      {trace.actionType}
                    </span>
                    <span className="text-stone-200 font-bold text-xs">{trace.stepName}</span>
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] text-stone-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-stone-500" />
                      <span>{trace.durationMs}ms</span>
                    </span>
                    <span>{new Date(trace.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>
                </div>

                {/* Structured JSON Payload */}
                <div className="bg-stone-900/90 rounded-lg p-3 border border-stone-800/60 overflow-x-auto text-[11px] text-stone-300">
                  <pre>{JSON.stringify(trace.details, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
