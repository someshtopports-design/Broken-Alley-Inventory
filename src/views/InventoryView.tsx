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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <h2 className="heading-page">Inventory Matrix</h2>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
                        <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-xs"></i>
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search Products..."
                            className="input-std pl-10 h-12 uppercase tracking-widest text-[10px]"
                        />
                    </div>
                    <button onClick={() => setShowModal('transfer')} className="btn btn-secondary whitespace-nowrap">
                        Move Stock
                    </button>
                    <button onClick={() => { setEditingProduct(null); setShowModal('product'); }} className="btn btn-primary whitespace-nowrap shadow-xl shadow-cyan-400/20">
                        New Drop
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {filteredProducts.map(p => (
                    <div key={p.id} className="card-std group hover:border-cyan-400/20">
                        <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between bg-white/5 border-b border-white/5">
                            <div>
                                <h3 className="text-2xl font-black uppercase italic leading-none text-white">{p.name}</h3>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="px-2 py-1 bg-white/10 rounded text-[9px] font-bold uppercase tracking-widest text-white/60">{p.category}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Cost: ₹{p.costPrice}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Sale: ₹{p.salePrice}</span>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4 md:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditingProduct(p); setShowModal('product'); }} className="btn-icon bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400 hover:text-black">
                                    <i className="fa-solid fa-pen text-xs"></i>
                                </button>
                                <button onClick={() => { if (confirm('Delete this entire product?')) deleteProduct(p.id); }} className="btn-icon bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white">
                                    <i className="fa-solid fa-trash text-xs"></i>
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-black/20">
                                    <tr>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white/30">Size</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white/30 text-center">Broken Alley (Hub)</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white/30 text-center">Street Junkies</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white/30 text-center">CC</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white/30 text-center">Unique Code</th>
                                        <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white/30 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {p.variants.map(v => (
                                        <tr key={v.size} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-black text-cyan-400 text-sm">{v.size}</td>
                                            <td className={`px-6 py-4 text-center font-bold text-sm ${v.stockBrokenAlley > 0 && v.stockBrokenAlley <= 2 ? 'text-red-500 animate-pulse' : 'text-white/60'}`}>
                                                {v.stockBrokenAlley}
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-sm text-white/60">{v.stockStreetJunkies}</td>
                                            <td className="px-6 py-4 text-center font-bold text-sm text-white/60">{v.stockCC}</td>
                                            <td className="px-6 py-4 text-center text-xs font-mono text-white/30">{v.uniqueCode}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setQrModal({ code: v.uniqueCode, label: `${p.name} - ${v.size}` })}
                                                    className="btn-icon w-8 h-8 ml-auto bg-white/5 hover:bg-white/20"
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
                    <div onClick={e => e.stopPropagation()} className="card-std p-10 flex flex-col items-center bg-[#0a0a0a] border-white/10 shadow-2xl">
                        <QRCodeGenerator value={qrModal.code} label={qrModal.label} />
                        <button onClick={() => setQrModal(null)} className="btn btn-secondary mt-8 w-full">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};


export default InventoryView;
