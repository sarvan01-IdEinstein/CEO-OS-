'use client';
import { useState } from 'react';
import { Plus, Trash2, DollarSign, Calculator } from 'lucide-react';

interface DreamItem {
    id: number;
    name: string;
    cost: number;
}

export default function LifestyleCalculator() {
    const [items, setItems] = useState<DreamItem[]>([]);
    const [baseBurn, setBaseBurn] = useState(5000);
    const [newItem, setNewItem] = useState('');
    const [newCost, setNewCost] = useState('');

    const addItem = () => {
        if (!newItem || !newCost) return;
        setItems([...items, { id: Date.now(), name: newItem, cost: parseInt(newCost) }]);
        setNewItem('');
        setNewCost('');
    };

    const totalMonthly = baseBurn + items.reduce((acc, curr) => acc + curr.cost, 0);
    const totalAnnual = totalMonthly * 12;
    const preTaxApprox = totalAnnual * 1.35; // Rough 35% tax buffer

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4 px-4">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif">Lifestyle Design Calculator</h1>
                <p className="text-[var(--muted)] max-w-xl mx-auto text-sm sm:text-base">
                    "People don't want to be millionaires — they want to experience what they believe only millions can buy." — Tim Ferriss
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left: Inputs */}
                <div className="space-y-8">
                    <div className="card">
                        <h3 className="font-bold uppercase text-xs mb-4">1. Base Reality</h3>
                        <label className="block text-sm text-[var(--muted)] mb-2">Monthly "Burn Rate" (Rent, Food, Utils)</label>
                        <div className="relative">
                            <DollarSign className="absolute top-3 left-3 text-[var(--muted)]" size={16} />
                            <input
                                type="number"
                                value={baseBurn}
                                onChange={e => setBaseBurn(parseInt(e.target.value))}
                                className="w-full p-2 pl-9 bg-[var(--bg)] border border-[var(--border)] rounded"
                            />
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="font-bold uppercase text-xs mb-4">2. The Dream Lines</h3>
                        <div className="flex flex-col sm:flex-row gap-2 mb-4">
                            <input
                                placeholder="Item (e.g. Aston Martin Lease)"
                                className="flex-1 p-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm"
                                value={newItem}
                                onChange={e => setNewItem(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Mthly Cost"
                                    className="w-full sm:w-24 p-2 bg-[var(--bg)] border border-[var(--border)] rounded text-sm"
                                    value={newCost}
                                    onChange={e => setNewCost(e.target.value)}
                                />
                                <button onClick={addItem} className="btn shrink-0"><Plus size={16} /></button>
                            </div>
                        </div>

                        <ul className="space-y-2">
                            {items.map(item => (
                                <li key={item.id} className="flex justify-between items-center text-sm p-2 bg-[var(--bg)] rounded group">
                                    <span>{item.name}</span>
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono">${item.cost.toLocaleString()}/mo</span>
                                        <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                                    </div>
                                </li>
                            ))}
                            {items.length === 0 && <li className="text-[var(--muted)] text-xs italic">No dream items added yet.</li>}
                        </ul>
                    </div>
                </div>

                {/* Right: The Bill */}
                <div className="card bg-[var(--fg)] text-white flex flex-col justify-center items-center text-center p-6 sm:p-12">
                    <Calculator size={48} className="mb-6 opacity-50" />
                    <div className="space-y-1">
                        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest opacity-70">Target Monthly Income</h2>
                        <p className="text-3xl sm:text-5xl font-mono font-bold">${totalMonthly.toLocaleString()}</p>
                    </div>

                    <div className="w-full h-px bg-white/20 my-8"></div>

                    <div className="space-y-1">
                        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest opacity-70">Target Annual Income (Pre-Tax)</h2>
                        <p className="text-2xl sm:text-3xl font-mono">${Math.round(preTaxApprox).toLocaleString()}</p>
                    </div>

                    <div className="mt-8 p-4 bg-white/10 rounded text-sm opacity-80">
                        Often this number is surprisingly lower than "$10 Million." This is your freedom line.
                    </div>
                </div>
            </div>
        </div>
    );
}
