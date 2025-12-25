
import React from 'react';
import { useStore } from '../context/StoreContext';

interface InventoryViewProps {
    setShowModal: (modal: 'product' | 'transfer' | 'expense' | null) => void;
}

const InventoryView: React.FC<InventoryViewProps> = ({ setShowModal }) => {
    const { products } = useStore();

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black italic tracking-tighter uppercase">Inventory Matrix</h2>
                <div className="flex gap-2">
                    <button onClick={() => setShowModal('transfer')} className="glass px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white border border-white/10 transition-all">Move Stock</button>
                    <button onClick={() => setShowModal('product')} className="bg-lime-400 text-black px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-lime-400/30 active:scale-95 transition-all">New Drop</button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {products.map(p => (
                    <div key={p.id} className="glass p-8 rounded-[40px] border-white/5 group hover:border-lime-400/20 transition-all">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <span className="text-[10px] text-lime-400 font-black uppercase tracking-[0.2em]">{p.sku}</span>
                                <h3 className="text-2xl font-black uppercase italic leading-none mt-1">{p.name}</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Retail</p>
                                <p className="text-2xl font-black text-white">₹{p.salePrice}</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-white/20">Size</th>
                                        <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-white/20 text-center">Home</th>
                                        <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-white/20 text-center">Store A</th>
                                        <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-white/20 text-center">Store B</th>
                                        <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-white/20 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {p.variants.map(v => {
                                        const total = v.stockHome + v.stockStoreA + v.stockStoreB;
                                        return (
                                            <tr key={v.size} className="hover:bg-white/5">
                                                <td className="py-4 font-black text-lime-400">{v.size}</td>
                                                <td className="py-4 text-center font-bold text-sm text-white/60">{v.stockHome}</td>
                                                <td className="py-4 text-center font-bold text-sm text-white/60">{v.stockStoreA}</td>
                                                <td className="py-4 text-center font-bold text-sm text-white/60">{v.stockStoreB}</td>
                                                <td className="py-4 text-right font-black text-sm">{total}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InventoryView;
