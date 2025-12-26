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
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="heading-page">Inventory</h2>
                    <p className="subheading">Manage stock across all locations</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <i className="fa-solid fa-search input-icon"></i>
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                            className="input-std input-with-icon"
                        />
                    </div>
                    <button onClick={() => setShowModal('transfer')} className="btn btn-secondary">
                        Transfer
                    </button>
                    <button onClick={() => { setEditingProduct(null); setShowModal('product'); }} className="btn btn-primary">
                        Add Product
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {filteredProducts.map(p => (
                    <div key={p.id} className="card-std group">
                        <div className="card-header">
                            <div>
                                <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-medium text-white/60 uppercase tracking-wide">{p.category}</span>
                                    <span className="text-xs text-[#8e8e93]">Cost: ₹{p.costPrice}</span>
                                    <span className="text-xs text-[#0a84ff] font-medium">Sale: ₹{p.salePrice}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setEditingProduct(p); setShowModal('product'); }} className="btn-icon">
                                    <i className="fa-solid fa-pen text-xs"></i>
                                </button>
                                <button onClick={() => { if (confirm('Delete this entire product?')) deleteProduct(p.id); }} className="btn-icon text-[#ff453a] hover:bg-[#ff453a]/10 hover:text-[#ff453a]">
                                    <i className="fa-solid fa-trash text-xs"></i>
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="table-std">
                                <thead>
                                    <tr>
                                        <th>Size</th>
                                        <th className="text-center">Broken Alley (Hub)</th>
                                        <th className="text-center">Street Junkies</th>
                                        <th className="text-center">CC</th>
                                        <th className="text-center">Unique Code</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {p.variants.map(v => (
                                        <tr key={v.size}>
                                            <td className="font-medium text-white">{v.size}</td>
                                            <td className={`text-center font-medium ${v.stockBrokenAlley > 0 && v.stockBrokenAlley <= 2 ? 'text-[#ff453a]' : 'text-[#8e8e93]'}`}>
                                                {v.stockBrokenAlley}
                                            </td>
                                            <td className="text-center text-[#8e8e93]">{v.stockStreetJunkies}</td>
                                            <td className="text-center text-[#8e8e93]">{v.stockCC}</td>
                                            <td className="text-center text-xs font-mono text-[#8e8e93]/70">{v.uniqueCode}</td>
                                            <td className="text-right">
                                                <button
                                                    onClick={() => setQrModal({ code: v.uniqueCode, label: `${p.name} - ${v.size}` })}
                                                    className="btn-icon w-8 h-8 ml-auto"
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
                <div onClick={() => setQrModal(null)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div onClick={e => e.stopPropagation()} className="card-std p-8 flex flex-col items-center shadow-2xl">
                        <QRCodeGenerator value={qrModal.code} label={qrModal.label} />
                        <button onClick={() => setQrModal(null)} className="btn btn-secondary mt-6 w-full">Close Dialog</button>
                    </div>
                </div>
            )}
        </div>
    );
};


export default InventoryView;
