
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import QRCodeGenerator from '../components/QRCodeGenerator';
import { Product } from '../types';

interface InventoryViewProps {
    setShowModal: (modal: 'product' | 'transfer' | 'expense' | null) => void;
    setEditingProduct: (product: Product | null) => void;
}


const InventoryView: React.FC<InventoryViewProps> = ({ setShowModal, setEditingProduct }) => {
    const { products, deleteProduct } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [qrModal, setQrModal] = useState<{ code: string; label: string } | null>(null);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fadeIn font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-3xl font-black italic tracking-tighter uppercase text-cyan-400">Inventory Matrix</h2>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-xs"></i>
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search Products..."
                            className="w-full glass py-3 pl-10 pr-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white placeholder:text-white/20 focus:border-cyan-400 focus:outline-none transition-all"
                        />
                    </div>
                    <button onClick={() => setShowModal('transfer')} className="glass px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white border border-white/10 transition-all whitespace-nowrap">Move Stock</button>
                    <button onClick={() => { setEditingProduct(null); setShowModal('product'); }} className="bg-cyan-400 text-black px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-cyan-400/30 active:scale-95 transition-all whitespace-nowrap">New Drop</button>
                </div>
            </div>

            <div className="space-y-4">
                {filteredProducts.map(p => (
                    <div key={p.id} className="glass rounded-[30px] border-white/5 overflow-hidden group hover:border-cyan-400/20 transition-all">
                        <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between bg-white/5 border-b border-white/5">
                            <div>
                                <h3 className="text-xl md:text-2xl font-black uppercase italic leading-none">{p.name}</h3>
                                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">
                                    {p.category} • Cost: ₹{p.costPrice} • Sale: <span className="text-cyan-400">₹{p.salePrice}</span>
                                </p>
                            </div>
                            <div className="flex gap-2 mt-4 md:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditingProduct(p); setShowModal('product'); }} className="w-8 h-8 rounded-full bg-cyan-400/10 text-cyan-400 flex items-center justify-center hover:bg-cyan-400 hover:text-black transition-all">
                                    <i className="fa-solid fa-pen text-xs"></i>
                                </button>
                                <button onClick={() => { if (confirm('Delete this entire product?')) deleteProduct(p.id); }} className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                    <i className="fa-solid fa-trash text-xs"></i>
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-black/20">
                                    <tr>
                                        <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-white/30">Size</th>
                                        <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-white/30 text-center">Broken Alley (Hub)</th>
                                        <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-white/30 text-center">Street Junkies</th>
                                        <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-white/30 text-center">CC</th>
                                        <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-white/30 text-center">Unique Code</th>
                                        <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-white/30 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {p.variants.map(v => (
                                        <tr key={v.size} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-black text-cyan-400">{v.size}</td>
                                            <td className={`px-6 py-4 text-center font-bold text-sm ${v.stockBrokenAlley > 0 && v.stockBrokenAlley <= 2 ? 'text-red-500 animate-pulse' : 'text-white/60'}`}>
                                                {v.stockBrokenAlley}
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-sm text-white/60">{v.stockStreetJunkies}</td>
                                            <td className="px-6 py-4 text-center font-bold text-sm text-white/60">{v.stockCC}</td>
                                            <td className="px-6 py-4 text-center text-xs font-mono text-white/30">{v.uniqueCode}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setQrModal({ code: v.uniqueCode, label: `${p.name} - ${v.size}` })}
                                                    className="w-8 h-8 rounded-full glass hover:bg-cyan-400 hover:text-black flex items-center justify-center transition-all ml-auto"
                                                >
                                                    <i className="fa-solid fa-qrcode text-xs"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

            {/* Print Logic Modal */}
            {qrModal && (
                <div onClick={() => setQrModal(null)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
                    <div onClick={e => e.stopPropagation()} className="glass p-8 rounded-[40px] flex flex-col items-center">
                        <QRCodeGenerator value={qrModal.code} label={qrModal.label} />
                        <button onClick={() => setQrModal(null)} className="mt-6 text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};


export default InventoryView;
