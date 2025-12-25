
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Expense } from '../types';

interface ManualModalsProps {
    activeModal: 'product' | 'transfer' | 'expense' | null;
    onClose: () => void;
}

const ManualModals: React.FC<ManualModalsProps> = ({ activeModal, onClose }) => {
    const { products, handleTransfer, addExpense, addProduct } = useStore();
    const [autoSizes, setAutoSizes] = useState(true);

    if (!activeModal) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn font-sans">
            <div className="glass w-full max-w-md p-10 rounded-[50px] border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                <button onClick={onClose} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"><i className="fa-solid fa-xmark text-xl"></i></button>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-8 text-center">
                    {activeModal === 'product' ? 'New Drop' : activeModal === 'transfer' ? 'Internal Move' : 'Log Burn'}
                </h3>

                <div className="space-y-6">
                    {activeModal === 'transfer' && (
                        <>
                            <div>
                                <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] mb-2 block">Product</label>
                                <select id="t-prod" className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold uppercase text-white bg-black/50 appearance-none">
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] mb-2 block">Size</label>
                                    <select id="t-size" className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold uppercase text-white bg-black/50 appearance-none">
                                        <option>S</option><option>M</option><option>L</option><option>XL</option><option>XXL</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] mb-2 block">Qty</label>
                                    <input id="t-qty" type="number" defaultValue={1} className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold text-white bg-transparent" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] mb-2 block">From</label>
                                    <select id="t-from" className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold uppercase text-white bg-black/50 appearance-none">
                                        <option>Home</option><option>BrokenAlley</option><option>CC</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] mb-2 block">To</label>
                                    <select id="t-to" className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold uppercase text-white bg-black/50 appearance-none">
                                        <option>BrokenAlley</option><option>CC</option><option>Home</option>
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
                                className="w-full py-6 bg-lime-400 text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-2xl shadow-lime-400/20 mt-4 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Confirm Transfer
                            </button>
                        </>
                    )}
                    {activeModal === 'expense' && (
                        <>
                            <div>
                                <label className="text-[10px] font-black uppercase text-white/30 mb-2 block">Category</label>
                                <select id="e-cat" className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold uppercase text-white bg-black/50 appearance-none">
                                    <option>Marketing</option><option>Delivery</option><option>Samples</option><option>Travel</option><option>Manufacturing</option><option>Production</option><option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-white/30 mb-2 block">Description</label>
                                <input id="e-desc" placeholder="Meta Marketing Burn..." className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold text-white bg-transparent" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-white/30 mb-2 block">Amount (₹)</label>
                                <input id="e-amt" type="number" placeholder="0" className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold text-white bg-transparent" />
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
                                <input id="p-name" placeholder="New Tee Name" className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold text-white bg-transparent" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white/30 mb-2 block">Cost (₹)</label>
                                    <input id="p-cost" type="number" placeholder="400" className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold text-white bg-transparent" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white/30 mb-2 block">Sale (₹)</label>
                                    <input id="p-sale" type="number" placeholder="1299" className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold text-white bg-transparent" />
                                </div>
                            </div>

                            <hr className="border-white/10 my-2" />

                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase text-white/30">Auto-Generate Sizes (M,L,XL)</label>
                                <div onClick={() => setAutoSizes(!autoSizes)} className={`w-10 h-5 rounded-full cursor-pointer transition-colors relative ${autoSizes ? 'bg-lime-400' : 'bg-white/10'}`}>
                                    <div className={`absolute top-1 w-3 h-3 bg-black rounded-full transition-all ${autoSizes ? 'left-6' : 'left-1'}`}></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white/30 mb-2 block">Initial Size (S)</label>
                                    <select id="p-size" className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold uppercase text-white bg-black/50 appearance-none">
                                        <option>S</option><option>M</option><option>L</option><option>XL</option><option>XXL</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white/30 mb-2 block">Stocks (Home)</label>
                                    <input id="p-qty" type="number" defaultValue={0} className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold text-white bg-transparent" />
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    const name = (document.getElementById('p-name') as HTMLInputElement).value;
                                    const cost = parseInt((document.getElementById('p-cost') as HTMLInputElement).value);
                                    const sale = parseInt((document.getElementById('p-sale') as HTMLInputElement).value);

                                    const initialSize = (document.getElementById('p-size') as HTMLSelectElement).value;
                                    const initialQty = parseInt((document.getElementById('p-qty') as HTMLInputElement).value);

                                    if (name && cost && sale) {
                                        const baseId = Date.now().toString();
                                        const sizes = autoSizes ? ['S', 'M', 'L', 'XL'] : [initialSize];

                                        const variants = sizes.map(s => ({
                                            size: s,
                                            stockHome: s === initialSize ? initialQty : 0,
                                            stockBrokenAlley: 0,
                                            stockCC: 0,
                                            uniqueCode: `${name.substring(0, 3).toUpperCase()}-${s}-${baseId.substring(9)}`
                                        }));

                                        addProduct({
                                            id: baseId,
                                            name, costPrice: cost, salePrice: sale,
                                            category: 'T-Shirts',
                                            variants: variants
                                        });
                                        onClose();
                                    }
                                }}
                                className="w-full py-6 bg-lime-400 text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-2xl shadow-lime-400/20 mt-4 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Launch Drop
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManualModals;
