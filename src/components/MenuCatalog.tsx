import React, { useState } from 'react';
import { 
  Coffee, 
  Flame, 
  Zap, 
  ShieldCheck, 
  Plus, 
  Check, 
  AlertCircle, 
  Filter, 
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { CoffeeItem } from '../types';

interface MenuCatalogProps {
  catalog: CoffeeItem[];
  onAddToCart: (item: CoffeeItem, customizations?: any) => void;
}

export const MenuCatalog: React.FC<MenuCatalogProps> = ({
  catalog,
  onAddToCart
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAllergenFilter, setSelectedAllergenFilter] = useState<string>('none');
  const [customizingItem, setCustomizingItem] = useState<CoffeeItem | null>(null);
  const [extraShot, setExtraShot] = useState(false);
  const [milkType, setMilkType] = useState<string>('standard');
  const [addedItemNotification, setAddedItemNotification] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'cold-brew', label: 'Nitro & Cold Brew' },
    { id: 'espresso', label: 'Espresso & Flat Whites' },
    { id: 'pour-over', label: 'Single Origin Pour-Over' },
    { id: 'food', label: 'Cyclist Fuel & Food' },
    { id: 'merch', label: 'Bidons & Merch' }
  ];

  const filteredCatalog = catalog.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    if (selectedAllergenFilter === 'nut-free' && item.allergens.includes('nuts')) {
      return false;
    }
    if (selectedAllergenFilter === 'dairy-free' && item.allergens.includes('dairy')) {
      return false;
    }
    if (selectedAllergenFilter === 'gluten-free' && item.allergens.includes('gluten')) {
      return false;
    }
    if (selectedAllergenFilter === 'decaf-only' && !item.isDecaf) {
      return false;
    }
    return true;
  });

  const handleQuickAdd = (item: CoffeeItem) => {
    onAddToCart(item);
    showToast(item.name);
  };

  const handleCustomizedAdd = () => {
    if (!customizingItem) return;
    const customizations: any = {};
    if (extraShot) customizations.extraShot = true;
    if (milkType !== 'standard') customizations.milkType = milkType;

    onAddToCart(customizingItem, customizations);
    showToast(customizingItem.name);
    setCustomizingItem(null);
    setExtraShot(false);
    setMilkType('standard');
  };

  const showToast = (name: string) => {
    setAddedItemNotification(`Added ${name} to order`);
    setTimeout(() => setAddedItemNotification(null), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Catalog Hero Banner */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#020617] text-[#38BDF8] border border-[#1E293B] tracking-wider">
              AUTHORITATIVE_CATALOG
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Cyclist Recovery & Specialty Coffee Menu
            </h2>
          </div>
          <p className="text-sm text-[#94A3B8] mt-1">
            Engineered with high bioavailability caffeine, electrolyte infusions, and Swiss Mountain Water decaffeination (&lt; 3.0mg caffeine).
          </p>
        </div>

        {/* Dietary Allergen Quick Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs scrollbar-none">
          <span className="text-[#64748B] text-[11px] font-mono mr-1">Exclusions:</span>
          {[
            { id: 'none', label: 'All' },
            { id: 'nut-free', label: 'Nut-Free' },
            { id: 'dairy-free', label: 'Dairy-Free' },
            { id: 'gluten-free', label: 'Gluten-Free' },
            { id: 'decaf-only', label: 'Decaf (<3mg)' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedAllergenFilter(f.id)}
              className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer whitespace-nowrap font-mono text-[11px] ${
                selectedAllergenFilter === f.id
                  ? 'bg-[#020617] border-[#38BDF8]/60 text-[#38BDF8] font-bold shadow-[0_0_10px_rgba(56,189,248,0.15)]'
                  : 'bg-[#020617]/60 border-[#1E293B] text-[#94A3B8] hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer uppercase tracking-wider font-mono ${
              selectedCategory === cat.id
                ? 'bg-[#2563EB] text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                : 'bg-[#0F172A] border border-[#1E293B] text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCatalog.map((item) => (
          <div
            key={item.id}
            className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-5 flex flex-col justify-between hover:border-[#38BDF8]/40 transition-all shadow-2xl group"
          >
            <div>
              {/* Header Badge & Price */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#020617] text-[#38BDF8] border border-[#1E293B]">
                      {item.badge}
                    </span>
                  )}
                  {item.isDecaf && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#020617] text-[#22C55E] border border-green-500/40">
                      Decaf &lt;3mg
                    </span>
                  )}
                </div>

                <div className="text-base font-bold font-mono text-[#38BDF8]">
                  ${item.price.toFixed(2)}
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-bold text-white mt-2 group-hover:text-[#38BDF8] transition-colors">
                {item.name}
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                {item.description}
              </p>

              {/* Athletic Benefit Highlight */}
              <div className="mt-3 bg-[#020617] rounded-xl p-3 border border-[#1E293B]">
                <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-[#22C55E] font-mono">
                  <Zap className="w-3.5 h-3.5" />
                  <span>CYCLIST_BIO_BENEFIT</span>
                </div>
                <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                  {item.cyclistBenefits}
                </p>
              </div>

              {/* Nutrition & Caffeine Footprint */}
              <div className="mt-3 flex items-center space-x-3 text-[11px] text-[#64748B] font-mono">
                {item.caffeineMg > 0 ? (
                  <span>⚡ {item.caffeineMg}mg caffeine</span>
                ) : (
                  <span>🌿 Caffeine-Free</span>
                )}
                {item.calories > 0 && <span>🔥 {item.calories} kcal</span>}
              </div>

              {/* Allergen Tags */}
              <div className="mt-2 flex flex-wrap gap-1">
                {item.allergens.map((allg, idx) => (
                  <span
                    key={idx}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                      allg === 'none'
                        ? 'bg-[#020617] text-[#22C55E] border border-green-500/30'
                        : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                    }`}
                  >
                    {allg === 'none' ? 'Allergen Safe' : `Contains: ${allg}`}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center space-x-2">
              <button
                onClick={() => handleQuickAdd(item)}
                className="flex-1 py-2 px-3 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(37,99,235,0.25)]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Quick Add (${item.price.toFixed(2)})</span>
              </button>

              {item.category === 'espresso' && (
                <button
                  onClick={() => setCustomizingItem(item)}
                  className="py-2 px-3 rounded-xl bg-[#020617] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white text-xs font-semibold border border-[#1E293B] transition-colors cursor-pointer"
                  title="Customize drink options"
                >
                  Options
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Toast Notification */}
      {addedItemNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] border border-[#38BDF8]/50 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-medium animate-fadeIn font-mono">
          <Check className="w-4 h-4 text-[#22C55E]" />
          <span>{addedItemNotification}</span>
        </div>
      )}

      {/* Drink Customizer Modal */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 bg-[#0A0B10]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  Customize {customizingItem.name}
                </h3>
                <p className="text-xs text-[#64748B] font-mono">Base Price: ${customizingItem.price.toFixed(2)}</p>
              </div>
              <button
                onClick={() => setCustomizingItem(null)}
                className="text-[#64748B] hover:text-white text-xs font-mono cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Customization Controls */}
            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#020617] border border-[#1E293B] cursor-pointer">
                <div>
                  <div className="font-semibold text-white">+ Extra Ristretto Shot</div>
                  <div className="text-[11px] text-[#64748B]">+75mg caffeine for intense mountain rides</div>
                </div>
                <input
                  type="checkbox"
                  checked={extraShot}
                  onChange={(e) => setExtraShot(e.target.checked)}
                  className="rounded text-[#2563EB] focus:ring-[#2563EB]"
                />
              </label>

              <div className="space-y-1.5">
                <span className="font-semibold text-[#94A3B8]">Milk Selection:</span>
                <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                  {['standard', 'oat', 'almond'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMilkType(m)}
                      className={`p-2 rounded-lg border uppercase transition-colors cursor-pointer ${
                        milkType === m
                          ? 'bg-[#020617] border-[#38BDF8] text-[#38BDF8] font-bold shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                          : 'bg-[#020617] border-[#1E293B] text-[#64748B] hover:text-white'
                      }`}
                    >
                      {m === 'standard' ? 'Whole (Dairy)' : `${m} (+0.75)`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Submit */}
            <button
              onClick={handleCustomizedAdd}
              className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#3B82F6] text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                Add to Cart with Options ($
                {(
                  customizingItem.price +
                  (extraShot ? 1.0 : 0) +
                  (milkType !== 'standard' ? 0.75 : 0)
                ).toFixed(2)}
                )
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
