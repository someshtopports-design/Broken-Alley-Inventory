
import React from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Expense } from '../types';

interface ManualModalsProps {
    activeModal: 'product' | 'transfer' | 'expense' | null;
    onClose: () => void;
}

const ManualModals: React.FC<ManualModalsProps> = ({ activeModal, onClose }) => {
    const { products, handleTransfer, addExpense, addProduct } = useStore();

    if (!activeModal) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
            <div className="glass w-full max-w-md p-10 rounded-[50px] border border-white/10 shadow-2xl relative">
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
                                        <option>Home</option><option>Store A</option><option>Store B</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em] mb-2 block">To</label>
                                    <select id="t-to" className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold uppercase text-white bg-black/50 appearance-none">
                                        <option>Store A</option><option>Store B</option><option>Home</option>
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
                                    <option>Marketing</option><option>Delivery</option><option>Samples</option><option>Travel</option><option>Other</option>
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
                            {/* Basic product add implementation */}
                            <div>
                                <label className="text-[10px] font-black uppercase text-white/30 mb-2 block">SKU</label>
                                <input id="p-sku" placeholder="BA-TEE-X" className="w-full glass p-5 rounded-2xl border-white/10 text-sm font-bold text-white bg-transparent" />
                            </div>
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
                            <button
                                onClick={() => {
                                    const sku = (document.getElementById('p-sku') as HTMLInputElement).value;
                                    const name = (document.getElementById('p-name') as HTMLInputElement).value;
                                    const cost = parseInt((document.getElementById('p-cost') as HTMLInputElement).value);
                                    const sale = parseInt((document.getElementById('p-sale') as HTMLInputElement).value);

                                    if (sku && name && cost && sale) {
                                        addProduct({
                                            id: Date.now().toString(),
                                            sku, name, costPrice: cost, salePrice: sale,
                                            category: 'T-Shirts',
                                            variants: [
                                                { size: 'S', stockHome: 0, stockStoreA: 0, stockStoreB: 0 },
                                                { size: 'M', stockHome: 0, stockStoreA: 0, stockStoreB: 0 },
                                                { size: 'L', stockHome: 0, stockStoreA: 0, stockStoreB: 0 },
                                                { size: 'XL', stockHome: 0, stockStoreA: 0, stockStoreB: 0 }
                                            ]
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
