import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  ShoppingBag, 
  AlertTriangle, 
  CheckCircle,
  Bug,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, CartValidationResponse } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  validatedState: CartValidationResponse | null;
  onSimulatePriceTamper: (id: string, tamperedPrice: number) => void;
  onSimulateNegativeQty: (id: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  validatedState,
  onSimulatePriceTamper,
  onSimulateNegativeQty
}) => {
  const [showAttackSimulator, setShowAttackSimulator] = useState(false);
  const [checkoutCompleted, setCheckoutCompleted] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#ffffff']
    });
    setCheckoutCompleted(true);
    setTimeout(() => {
      onClearCart();
      setCheckoutCompleted(false);
      onClose();
    }, 2800);
  };

  const subtotal = validatedState ? validatedState.subtotal : items.reduce((acc, i) => acc + i.lineTotal, 0);
  const tax = validatedState ? validatedState.tax : subtotal * 0.0825;
  const total = validatedState ? validatedState.total : subtotal + tax;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0A0B10]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0F172A] border-l border-[#1E293B] shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-[#1E293B] flex items-center justify-between bg-[#0F172A]">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-[#020617] text-[#38BDF8] border border-[#1E293B]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Cyclist Fuel Order</h3>
                <div className="flex items-center space-x-1.5 text-[11px] text-[#22C55E] font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authoritative Server Pricing</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Security Alert Banner (If Tampering Detected) */}
          {validatedState?.tamperingDetected && (
            <div className="bg-rose-950/80 border-b border-rose-500/40 p-4 text-xs text-rose-200 font-mono space-y-1.5 animate-fadeIn">
              <div className="flex items-center space-x-1.5 text-rose-400 font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>CART VALIDATOR: EXPLOIT NEUTRALIZED</span>
              </div>
              <ul className="text-[11px] list-disc list-inside space-y-0.5 text-rose-300">
                {validatedState.securityViolations.map((v, idx) => (
                  <li key={idx}>{v}</li>
                ))}
              </ul>
              <div className="text-[10px] text-[#22C55E] font-semibold pt-1">
                ✓ Server restored 100% authoritative catalog prices and quantities.
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12 text-[#64748B] space-y-3">
                <ShoppingBag className="w-12 h-12 mx-auto stroke-[1.2] text-[#475569]" />
                <p className="text-sm font-medium">Your cyclist order is empty.</p>
                <p className="text-xs text-[#64748B]">Select cold brews or power flapjacks from the catalog.</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#020617] border border-[#1E293B] rounded-2xl p-4 space-y-2 shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        {item.name}
                      </h4>
                      <div className="text-[11px] text-[#64748B] font-mono">
                        ${item.unitPrice.toFixed(2)} each
                      </div>
                      {item.appliedCustomizations && (
                        <div className="text-[10px] text-[#38BDF8] font-mono mt-0.5">
                          {Object.values(item.appliedCustomizations).join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="text-sm font-bold font-mono text-[#38BDF8]">
                      ${item.lineTotal.toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity & Removal Controls */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2 bg-[#0A0B10] border border-[#1E293B] rounded-lg p-1">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-[#1E293B] text-[#94A3B8] hover:text-white rounded cursor-pointer"
                        title="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-bold text-white w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-[#1E293B] text-[#94A3B8] hover:text-white rounded cursor-pointer"
                        title="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-[#64748B] hover:text-rose-400 p-1.5 transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Attack Simulation Lab (For Penetration Testing Demonstration) */}
            {items.length > 0 && (
              <div className="pt-2">
                <button
                  onClick={() => setShowAttackSimulator(!showAttackSimulator)}
                  className="w-full py-2 px-3 rounded-xl bg-[#020617] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#38BDF8] text-xs font-mono flex items-center justify-between border border-[#1E293B] cursor-pointer transition-colors"
                >
                  <span className="flex items-center space-x-1.5">
                    <Bug className="w-3.5 h-3.5 text-rose-400" />
                    <span>Test Penetration Attacks</span>
                  </span>
                  <span>{showAttackSimulator ? '▲' : '▼'}</span>
                </button>

                {showAttackSimulator && (
                  <div className="mt-2 p-3.5 bg-[#020617] border border-[#1E293B] rounded-xl space-y-2.5 text-xs font-mono animate-fadeIn">
                    <div className="text-[11px] text-[#64748B]">
                      Simulate client-side exploits to test <strong className="text-[#22C55E]">CartSecurityValidator</strong> defense:
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onSimulatePriceTamper(items[0]?.id, 0.01)}
                        className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 text-rose-300 text-[11px] font-semibold text-left cursor-pointer transition-colors"
                      >
                        ⚠️ Tamper Price to $0.01
                      </button>
                      <button
                        onClick={() => onSimulateNegativeQty(items[0]?.id)}
                        className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 text-rose-300 text-[11px] font-semibold text-left cursor-pointer transition-colors"
                      >
                        ⚠️ Inject Negative Qty (-5)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer & Authoritative Totals */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#1E293B] bg-[#0A0B10] space-y-3">
              <div className="space-y-1.5 text-xs text-[#64748B] font-mono">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#E0E0E0]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Municipal Coffee Tax (8.25%)</span>
                  <span className="text-[#E0E0E0]">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-1.5 border-t border-[#1E293B]">
                  <span className="text-[#38BDF8]">Authoritative Total</span>
                  <span className="text-[#38BDF8]">${total.toFixed(2)}</span>
                </div>
              </div>

              {checkoutCompleted ? (
                <div className="w-full py-3 rounded-xl bg-[#22C55E] text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 animate-fadeIn font-mono">
                  <CheckCircle className="w-4 h-4" />
                  <span>Order Verified & Paid! Ride Safe!</span>
                </div>
              ) : (
                <button
                  id="btn-authoritative-checkout"
                  onClick={handleCheckout}
                  className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Authorize & Place Order (${total.toFixed(2)})</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
