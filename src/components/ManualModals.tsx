
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { parseBusinessInput } from '../services/geminiService';
import { Product, Expense } from '../types';

interface ManualModalsProps {
    activeModal: 'product' | 'transfer' | 'expense' | null;
    onClose: () => void;
    editingProduct?: Product | null;
}

const ManualModals: React.FC<ManualModalsProps> = ({ activeModal, onClose, editingProduct }) => {
    const { products, handleTransfer, addExpense, addProduct, updateProduct } = useStore();
    const [autoSizes, setAutoSizes] = useState(true);
    const [sizeStocks, setSizeStocks] = useState({ S: 0, M: 0, L: 0, XL: 0 });

    // State for form fields to handle editing population
    const [pName, setPName] = useState('');
    const [pCost, setPCost] = useState('');
    const [pSale, setPSale] = useState('');

    useEffect(() => {
        if (activeModal === 'product') {
            if (editingProduct) {
                setPName(editingProduct.name);
                setPCost(editingProduct.costPrice.toString());
                setPSale(editingProduct.salePrice.toString());
            } else {
                setPName('');
                setPCost('');
                setPSale('');
                setSizeStocks({ S: 0, M: 0, L: 0, XL: 0 });
            }
        }
    }, [activeModal, editingProduct]);

    if (!activeModal) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn font-sans">
            <div className="glass w-full max-w-md p-10 rounded-[50px] border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                <button onClick={onClose} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"><i className="fa-solid fa-xmark text-xl"></i></button>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-8 text-center text-cyan-400">
                    {activeModal === 'product' ? (editingProduct ? 'Edit Details' : 'New Drop') : activeModal === 'transfer' ? 'Stock Move' : 'Log Burn'}
                </h3>

                <div className="space-y-6">
                    {/* ... Transfer and Expense logic (omitted for brevity in replacement if possible, but tool requires contiguous... I'll check line numbers) */}
                    {activeModal === 'transfer' && (
                        <>
                            <div>
                                <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] mb-2 block">Product</label>
                                <select id="t-prod" className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold uppercase text-white bg-black/50 appearance-none focus:border-cyan-400 focus:outline-none">
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] mb-2 block">Size</label>
                                    <select id="t-size" className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold uppercase text-white bg-black/50 appearance-none focus:border-cyan-400 focus:outline-none">
                                        <option>S</option><option>M</option><option>L</option><option>XL</option><option>XXL</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] mb-2 block">Qty</label>
                                    <input id="t-qty" type="number" defaultValue={1} className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold text-white bg-transparent focus:border-cyan-400 focus:outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] mb-2 block">From</label>
                                    <select id="t-from" className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold uppercase text-white bg-black/50 appearance-none focus:border-cyan-400 focus:outline-none">
                                        <option value="BrokenAlley">Broken Alley (Hub)</option>
                                        <option value="StreetJunkies">Street Junkies</option>
                                        <option value="CC">CC</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] mb-2 block">To</label>
                                    <select id="t-to" className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold uppercase text-white bg-black/50 appearance-none focus:border-cyan-400 focus:outline-none">
                                        <option value="StreetJunkies">Street Junkies</option>
                                        <option value="CC">CC</option>
                                        <option value="BrokenAlley">Broken Alley (Hub)</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    const pid = (document.getElementById('t-prod') as HTMLSelectElement).value;
                                    const from = (document.getElementById('t-from') as HTMLSelectElement).value as any;
                                    const to = (document.getElementById('t-to') as HTMLSelectElement).value as any;
                                    const size = (document.getElementById('t-size') as HTMLSelectElement).value;
                                    const qty = parseInt((document.getElementById('t-qty') as HTMLInputElement).value);
                                    handleTransfer({ productId: pid, size, from, to, quantity: qty });
                                    onClose();
                                }}
                                className="w-full py-6 bg-cyan-400 text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-2xl shadow-cyan-400/20 mt-4 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Confirm Transfer
                            </button>
                        </>
                    )}
                    {activeModal === 'expense' && (
                        <>
                            <div>
                                <label className="text-[10px] font-black uppercase text-white/30 mb-2 block">Category</label>
                                <select id="e-cat" className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold uppercase text-white bg-black/50 appearance-none focus:border-cyan-400 focus:outline-none">
                                    <option>Marketing</option><option>Delivery</option><option>Samples</option><option>Travel</option><option>Manufacturing</option><option>Production</option><option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-white/30 mb-2 block">Description</label>
                                <input id="e-desc" placeholder="Meta Marketing Burn..." className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold text-white bg-transparent focus:border-cyan-400 focus:outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-white/30 mb-2 block">Amount (₹)</label>
                                <input id="e-amt" type="number" placeholder="0" className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold text-white bg-transparent focus:border-cyan-400 focus:outline-none" />
                            </div>
                            <button
                                onClick={() => {
                                    const cat = (document.getElementById('e-cat') as HTMLSelectElement).value as any;
                                    const desc = (document.getElementById('e-desc') as HTMLInputElement).value;
                                    const amt = parseInt((document.getElementById('e-amt') as HTMLInputElement).value);
                                    if (amt > 0 && desc) {
                                        addExpense({ id: Date.now().toString(), category: cat, description: desc, amount: amt, date: new Date().toISOString() });
                                        onClose();
                                    }
                                }}
                                className="w-full py-6 bg-red-400 text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl mt-4 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Log Burn
                            </button>
                        </>
                    )}
                    {activeModal === 'product' && (
                        <>
                            <div>
                                <label className="text-[10px] font-black uppercase text-white/30 mb-2 block">Name</label>
                                <input
                                    value={pName}
                                    onChange={e => setPName(e.target.value)}
                                    placeholder="New Tee Name"
                                    className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold text-white bg-transparent focus:border-cyan-400 focus:outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white/30 mb-2 block">Cost (₹)</label>
                                    <input
                                        type="number"
                                        value={pCost}
                                        onChange={e => setPCost(e.target.value)}
                                        placeholder="400"
                                        className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold text-white bg-transparent focus:border-cyan-400 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white/30 mb-2 block">Sale (₹)</label>
                                    <input
                                        type="number"
                                        value={pSale}
                                        onChange={e => setPSale(e.target.value)}
                                        placeholder="1299"
                                        className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold text-white bg-transparent focus:border-cyan-400 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <hr className="border-white/10 my-2" />

                            {!editingProduct && (
                                <>
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase text-white/30">Auto-Generate Sizes</label>
                                        <div onClick={() => setAutoSizes(!autoSizes)} className={`w-10 h-5 rounded-full cursor-pointer transition-colors relative ${autoSizes ? 'bg-cyan-400' : 'bg-white/10'}`}>
                                            <div className={`absolute top-1 w-3 h-3 bg-black rounded-full transition-all ${autoSizes ? 'left-6' : 'left-1'}`}></div>
                                        </div>
                                    </div>

                                    {autoSizes ? (
                                        <div className="grid grid-cols-4 gap-2">
                                            {(['S', 'M', 'L', 'XL'] as const).map(size => (
                                                <div key={size}>
                                                    <label className="text-[8px] font-black uppercase text-white/30 mb-1 block text-center">Qty {size}</label>
                                                    <input
                                                        type="number"
                                                        value={sizeStocks[size]}
                                                        onChange={e => setSizeStocks({ ...sizeStocks, [size]: parseInt(e.target.value) || 0 })}
                                                        className="w-full glass p-3 rounded-xl border-white/10 text-xs font-bold text-center text-white bg-transparent focus:border-cyan-400 focus:outline-none"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-white/30 mb-2 block">Size</label>
                                                <select id="p-size" className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold uppercase text-white bg-black/50 appearance-none focus:border-cyan-400 focus:outline-none">
                                                    <option>S</option><option>M</option><option>L</option><option>XL</option><option>XXL</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase text-white/30 mb-2 block">Stock (Hub)</label>
                                                <input id="p-qty" type="number" defaultValue={0} className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold text-white bg-transparent focus:border-cyan-400 focus:outline-none" />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                            {editingProduct && (
                                <p className="text-[10px] text-white/40 text-center uppercase tracking-widest bg-white/5 py-3 rounded-xl border border-white/10">Stocks managed via Transfers</p>
                            )}

                            <button
                                onClick={() => {
                                    const name = pName;
                                    const cost = parseInt(pCost);
                                    const sale = parseInt(pSale);

                                    if (editingProduct && name && cost && sale) {
                                        updateProduct({
                                            ...editingProduct,
                                            name, costPrice: cost, salePrice: sale
                                        });
                                        onClose();
                                        return;
                                    }

                                    if (name && cost && sale && !editingProduct) {
                                        const baseId = Date.now().toString();

                                        let variants;
                                        if (autoSizes) {
                                            variants = Object.entries(sizeStocks).map(([size, qty]) => ({
                                                size,
                                                stockBrokenAlley: qty,
                                                stockStreetJunkies: 0,
                                                stockCC: 0,
                                                uniqueCode: `${name.substring(0, 3).toUpperCase()} -${size} -${baseId.substring(9)} `
                                            }));
                                        } else {
                                            const size = (document.getElementById('p-size') as HTMLSelectElement).value;
                                            const qty = parseInt((document.getElementById('p-qty') as HTMLInputElement).value);
                                            variants = [{
                                                size,
                                                stockBrokenAlley: qty,
                                                stockStreetJunkies: 0,
                                                stockCC: 0,
                                                uniqueCode: `${name.substring(0, 3).toUpperCase()} -${size} -${baseId.substring(9)} `
                                            }];
                                        }

                                        addProduct({
                                            id: baseId,
                                            name, costPrice: cost, salePrice: sale,
                                            variants: variants,
                                            category: 'T-Shirts'
                                        });
                                        onClose();
                                    }
                                }}
                                className="w-full py-6 bg-cyan-400 text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-2xl shadow-cyan-400/20 mt-4 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                {editingProduct ? 'Update Drop' : 'Launch Drop'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManualModals;
