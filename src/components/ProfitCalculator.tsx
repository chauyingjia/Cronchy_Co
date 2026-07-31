import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { formatMoney } from '../utils/storage';
import { Calculator, Layers, ChevronDown, ChevronRight, Package } from 'lucide-react';

interface ProfitCalculatorProps {
  currencySymbol: string;
}

export const ProfitCalculator: React.FC<ProfitCalculatorProps> = ({
  currencySymbol,
}) => {
  // --- RECIPE COST STATE ---
  const [cookieQty, setCookieQty] = useState<string>('6');

  const [draftBulk, setDraftBulk] = useState({
    roastedPistachio: { name: 'Roasted Powder Pistachio (开心果粉)', price: '65.00', grams: '500' },
    pistachioPaste: { name: 'Pistachio Paste (开心果酱)', price: '40.82', grams: '1000' },
    chocolatePaste: { name: 'BWY Nuturra Hazelnut (巧克力酱)', price: '28.19', grams: '1000' },
    kataifi: { name: 'Kataifi (面包丝/酥丝面)', price: '11.20', grams: '500' },
    marshmallow: { name: 'Marshmallow (棉花糖)', price: '19.80', grams: '1000' },
    milkPowder: { name: 'Milk Powder (奶粉)', price: '10.00', grams: '500' },
    cocoaPowder: { name: 'Cocoa Powder (可可粉)', price: '6.90', grams: '250' },
    butter: { name: 'Butter (牛油)', price: '9.90', grams: '250' },
  });
  const [bulk, setBulk] = useState(draftBulk);

  const [draftPackaging, setDraftPackaging] = useState({
    box: { name: 'Box', price: '0.1018', qty: '1' },
    plasticBag: { name: 'Plastic Bags', price: '0.098', qty: '1' },
    bakingPaper: { name: 'Baking Paper', price: '0.013', qty: '1' },
    sticker: { name: 'Stickers', price: '0.01724', qty: '1' },
  });
  const [packaging, setPackaging] = useState(draftPackaging);

  const updateBulk = (key: keyof typeof draftBulk, field: 'price' | 'grams', val: string) => {
    setDraftBulk(prev => ({ ...prev, [key]: { ...prev[key], [field]: val } }));
  };
  const updatePack = (key: keyof typeof draftPackaging, field: 'price' | 'qty', val: string) => {
    setDraftPackaging(prev => ({ ...prev, [key]: { ...prev[key], [field]: val } }));
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'calculator', 'pricing'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.bulk) {
          setDraftBulk(data.bulk);
          setBulk(data.bulk);
        }
        if (data.packaging) {
          setDraftPackaging(data.packaging);
          setPackaging(data.packaging);
        }
      }
    });
    return () => unsub();
  }, []);

  const handleCalculate = async () => {
    setBulk(draftBulk);
    setPackaging(draftPackaging);

    try {
      await setDoc(doc(db, 'calculator', 'pricing'), {
        bulk: draftBulk,
        packaging: draftPackaging
      });
    } catch (e) {
      console.error("Error saving calculator pricing: ", e);
    }
  };

  const getUnitCost = (item?: { price: string, grams?: string, qty?: string }) => {
    if (!item) return 0;
    const p = parseFloat(item.price) || 0;
    const q = parseFloat(item.grams || item.qty || '1') || 1;
    return p / q;
  };

  const cookiesToMake = parseFloat(cookieQty) || 1;
  const batchMultiplier = cookiesToMake / 6;

  // Recipe: Pistachio (for 6 cookies)
  const pistRecipe = {
    kataifi: 75, butter: 45, pistachioPaste: 72.5, roastedPistachio: 72.5,
    marshmallow: 100, cocoaPowder: 10, milkPowder: 15
  };
  let pistIngCost = 0;
  pistIngCost += getUnitCost((bulk as any).kataifi) * pistRecipe.kataifi;
  pistIngCost += getUnitCost((bulk as any).butter) * pistRecipe.butter;
  pistIngCost += getUnitCost((bulk as any).pistachioPaste) * pistRecipe.pistachioPaste;
  pistIngCost += getUnitCost((bulk as any).roastedPistachio) * pistRecipe.roastedPistachio;
  pistIngCost += getUnitCost((bulk as any).marshmallow) * pistRecipe.marshmallow;
  pistIngCost += getUnitCost((bulk as any).cocoaPowder) * pistRecipe.cocoaPowder;
  pistIngCost += getUnitCost((bulk as any).milkPowder) * pistRecipe.milkPowder;
  pistIngCost *= batchMultiplier;

  // Recipe: Chocolate (for 6 cookies)
  const chocRecipe = {
    kataifi: 75, butter: 45, chocolatePaste: 66.5, cocoaPowder: 16,
    marshmallow: 100, milkPowder: 15
  };
  let chocIngCost = 0;
  chocIngCost += getUnitCost((bulk as any).kataifi) * chocRecipe.kataifi;
  chocIngCost += getUnitCost((bulk as any).butter) * chocRecipe.butter;
  chocIngCost += getUnitCost((bulk as any).chocolatePaste) * chocRecipe.chocolatePaste;
  chocIngCost += getUnitCost((bulk as any).cocoaPowder) * chocRecipe.cocoaPowder;
  chocIngCost += getUnitCost((bulk as any).marshmallow) * chocRecipe.marshmallow;
  chocIngCost += getUnitCost((bulk as any).milkPowder) * chocRecipe.milkPowder;
  chocIngCost *= batchMultiplier;

  // Packaging cost (per cookie = 1 serve)
  const packCostPerCookie = getUnitCost(packaging.box) + getUnitCost(packaging.plasticBag) + getUnitCost(packaging.bakingPaper) + getUnitCost(packaging.sticker);
  const totalPackCost = packCostPerCookie * cookiesToMake;

  const pistTotalCost = pistIngCost + totalPackCost;
  const chocTotalCost = chocIngCost + totalPackCost;

  const pistSales = 12.00 * cookiesToMake;
  const chocSales = 11.00 * cookiesToMake;

  const inputClass = "w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:border-purple-500 focus:outline-none transition-colors";

  const [showIngredients, setShowIngredients] = useState(true);

  return (
    <div className="space-y-8 pb-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-stone-900 to-purple-950 p-5 sm:p-6 rounded-3xl border-2 border-purple-500/40 shadow-lg text-white">
        <div className="flex items-center gap-2 text-purple-300 font-bold text-sm tracking-wide uppercase mb-1">
          <Calculator className="w-5 h-5 text-purple-300" />
          <span>Smart Profit Tools</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Profit Calculator
        </h2>
      </div>

      {/* RECIPE BATCH COST */}
      <div className="bg-white border-2 border-slate-200 p-5 sm:p-6 rounded-3xl shadow-xs space-y-6">


        {/* Bulk Pricing Inputs (Toggleable) */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowIngredients(!showIngredients)}
            className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors font-bold text-slate-800"
          >
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              Ingredients & Packaging Prices
            </div>
            {showIngredients ? <ChevronDown className="w-5 h-5 text-slate-600" /> : <ChevronRight className="w-5 h-5 text-slate-600" />}
          </button>

          {showIngredients && (
            <div className="p-5 border-t border-slate-200 space-y-6">
              <div>
                <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-3">Ingredients (Price per Grams)</h4>
                <div className="flex flex-col gap-4">
                  {(['roastedPistachio', 'pistachioPaste', 'chocolatePaste', 'kataifi', 'marshmallow', 'butter', 'milkPowder', 'cocoaPowder'] as Array<keyof typeof draftBulk>).map((key) => (
                    draftBulk[key] ? (
                      <div key={key} className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-100 transition-colors">
                        <span className="text-base font-bold text-slate-700 flex-1 pr-2">{draftBulk[key].name}</span>
                        <div className="flex items-center gap-1 flex-none justify-end">
                          <span className="text-sm text-slate-400">{currencySymbol}</span>
                          <input type="number" value={draftBulk[key].price} onChange={(e) => updateBulk(key, 'price', e.target.value)} className={"w-16 text-sm px-2 py-1.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none " + inputClass} />
                          <span className="text-sm text-slate-400">per</span>
                          <input type="number" value={draftBulk[key].grams} onChange={(e) => updateBulk(key, 'grams', e.target.value)} className={"w-16 text-sm px-2 py-1.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none " + inputClass} />
                          <span className="text-sm text-slate-400">g</span>
                        </div>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-3">Packaging (Price per Qty)</h4>
                <div className="flex flex-col gap-4">
                  {(['box', 'plasticBag', 'bakingPaper', 'sticker'] as Array<keyof typeof draftPackaging>).map((key) => (
                    draftPackaging[key] ? (
                      <div key={key} className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-100 transition-colors">
                        <span className="text-base font-bold text-slate-700 flex-1 pr-2">{draftPackaging[key].name}</span>
                        <div className="flex items-center gap-1 flex-none justify-end">
                          <span className="text-sm text-slate-400">{currencySymbol}</span>
                          <input type="number" value={draftPackaging[key].price} onChange={(e) => updatePack(key, 'price', e.target.value)} className={"w-16 text-sm px-2 py-1.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none " + inputClass} />
                          <span className="text-sm text-slate-400">per</span>
                          <input type="number" value={draftPackaging[key].qty} onChange={(e) => updatePack(key, 'qty', e.target.value)} className={"w-16 text-sm px-2 py-1.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none " + inputClass} />
                          <span className="text-sm text-slate-400">pcs</span>
                        </div>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-center">
                <button
                  onClick={handleCalculate}
                  className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-extrabold px-10 py-3.5 rounded-2xl shadow-md transition-all flex items-center gap-2 text-lg active:scale-95 border border-amber-300"
                >
                  <Calculator className="w-6 h-6" />
                  Calculate Batch Cost
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recipe Calculator Results */}
        <div className="pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h4 className="font-extrabold text-slate-900 text-lg">Batch Calculator</h4>
            <div className="flex items-center gap-3 bg-amber-100 p-2 px-4 rounded-2xl border border-amber-300">
              <span className="font-bold text-sm text-amber-800">Cookies to make:</span>
              <input type="number" value={cookieQty} onChange={(e) => setCookieQty(e.target.value)} className="w-16 text-center font-black text-lg bg-white rounded-xl px-2 py-1 border-2 border-amber-400 focus:outline-none" min="1" />
              <span className="text-xs font-semibold text-amber-700">pcs</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pistachio Recipe Card */}
            <div className="bg-white border-2 border-emerald-200 rounded-3xl p-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">Pistachio</div>
              <h5 className="font-extrabold text-emerald-800 mb-4 text-lg">Pistachio Dubai Chewy</h5>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between text-slate-600"><span>Ingredients Cost:</span> <span>{formatMoney(pistIngCost, currencySymbol)}</span></div>
                <div className="flex justify-between text-slate-600"><span>Packaging Cost:</span> <span>{formatMoney(totalPackCost, currencySymbol)}</span></div>
                <div className="flex justify-between font-bold text-slate-800 border-t border-emerald-100 pt-2"><span>Total Cost:</span> <span>{formatMoney(pistTotalCost, currencySymbol)}</span></div>
                <div className="flex justify-between font-bold text-emerald-700"><span>Cost per Cookie:</span> <span>{formatMoney(pistTotalCost / cookiesToMake, currencySymbol)}</span></div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 space-y-2">
                <div className="flex justify-between text-xs font-bold text-emerald-700 uppercase">Selling Price: <span>{formatMoney(12.00, currencySymbol)}</span></div>
                <div className="flex justify-between text-lg font-black text-emerald-900">Total Profit: <span>{formatMoney(pistSales - pistTotalCost, currencySymbol)}</span></div>
                <div className="flex justify-between text-sm font-bold text-emerald-600">Profit per Cookie: <span>{formatMoney(12.00 - (pistTotalCost / cookiesToMake), currencySymbol)}</span></div>
              </div>
            </div>

            {/* Chocolate Recipe Card */}
            <div className="bg-white border-2 border-amber-200 rounded-3xl p-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">Chocolate</div>
              <h5 className="font-extrabold text-amber-800 mb-4 text-lg">Chocolate Dubai Chewy</h5>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between text-slate-600"><span>Ingredients Cost:</span> <span>{formatMoney(chocIngCost, currencySymbol)}</span></div>
                <div className="flex justify-between text-slate-600"><span>Packaging Cost:</span> <span>{formatMoney(totalPackCost, currencySymbol)}</span></div>
                <div className="flex justify-between font-bold text-slate-800 border-t border-amber-100 pt-2"><span>Total Cost:</span> <span>{formatMoney(chocTotalCost, currencySymbol)}</span></div>
                <div className="flex justify-between font-bold text-amber-700"><span>Cost per Cookie:</span> <span>{formatMoney(chocTotalCost / cookiesToMake, currencySymbol)}</span></div>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 space-y-2">
                <div className="flex justify-between text-xs font-bold text-amber-700 uppercase">Selling Price: <span>{formatMoney(11.00, currencySymbol)}</span></div>
                <div className="flex justify-between text-lg font-black text-amber-900">Total Profit: <span>{formatMoney(chocSales - chocTotalCost, currencySymbol)}</span></div>
                <div className="flex justify-between text-sm font-bold text-amber-600">Profit per Cookie: <span>{formatMoney(11.00 - (chocTotalCost / cookiesToMake), currencySymbol)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
