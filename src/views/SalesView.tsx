
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import QRScanner from '../components/QRScanner';
import { Product, ProductVariant } from '../types';


const SalesView: React.FC = () => {
    const { sales, products, recordSale, markRTO } = useStore();
    const [showPos, setShowPos] = useState(false);
    const [scanMode, setScanMode] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [foundItem, setFoundItem] = useState<{ product: Product; variant: ProductVariant } | null>(null);
    const [showRTOs, setShowRTOs] = useState(false);

    // Form Stats
    const [custName, setCustName] = useState('');
    const [custPhone, setCustPhone] = useState('');
    const [custAddr, setCustAddr] = useState('');
    const [channel, setChannel] = useState<'Website' | 'BrokenAlley' | 'StreetJunkies' | 'CC'>('BrokenAlley');
    const [custType, setCustType] = useState<'Customer' | 'Actor' | 'Influencer'>('Customer');

    const handleSearch = (code: string) => {
        let found: { product: Product; variant: ProductVariant } | null = null;
        for (const p of products) {
            const v = p.variants.find(v => v.uniqueCode === code);
            if (v) {
                found = { product: p, variant: v };
                break;
            }
        }

        if (found) {
            setFoundItem(found);
            setScanMode(false);
        } else {
            alert('Item not found!');
        }
    };

    const handleConfirmSale = () => {
        if (!foundItem) return;
        recordSale({
            uniqueCode: foundItem.variant.uniqueCode,
            itemName: foundItem.product.name,
            size: foundItem.variant.size,
            customerName: custName,
            customerPhone: custPhone,
            customerAddress: custAddr,
            channel: channel,
            customerType: custType,
            quantity: 1,
            amount: foundItem.product.salePrice
        });
        resetPos();
    };

    const resetPos = () => {
        setShowPos(false);
        setFoundItem(null);
        setManualCode('');
        setCustName('');
        setCustPhone('');
        setCustAddr('');
        setCustType('Customer');
        setScanMode(false);
    };

    const filteredSales = showRTOs ? sales.filter(s => s.status === 'rto') : sales.filter(s => s.status !== 'rto');

    return (
        <div className="space-y-6 animate-fadeIn relative font-sans">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-black uppercase italic text-cyan-400">
                        {showRTOs ? 'Returns (RTO)' : 'Sales History'}
                    </h2>
                    <button
                        onClick={() => setShowRTOs(!showRTOs)}
                        className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border transition-all ${showRTOs ? 'bg-red-500 text-white border-red-500' : 'border-white/20 text-white/40 hover:text-white'}`}
                    >
                        {showRTOs ? 'Show Sales' : 'Show RTOs'}
                    </button>
                </div>

                <button onClick={() => setShowPos(true)} className="bg-cyan-400 text-black px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-cyan-400/20 active:scale-95 transition-all flex items-center gap-2">
                    <i className="fa-solid fa-cash-register"></i> New Sale
                </button>
            </div>

            <div className="glass rounded-[40px] overflow-hidden border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">Date</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">Customer</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">Item & Size</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40">Channel</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Revenue</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredSales.map(s => (
                                <tr key={s.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-6 text-xs text-white/40">{new Date(s.date).toLocaleDateString()}</td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold">{s.customerName}</p>
                                        <div className="flex gap-2 items-center">
                                            <span className={`text-[9px] px-2 rounded-full font-bold uppercase ${s.customerType === 'Influencer' ? 'bg-purple-500/20 text-purple-400' : s.customerType === 'Actor' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-white/40'}`}>
                                                {s.customerType || 'Customer'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold uppercase">{s.productName}</p>
                                        <p className="text-[10px] text-cyan-400 font-black">SIZE: {s.size} (x{s.quantity})</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{s.channel}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right font-black text-cyan-400">
                                        {s.status === 'rto' ? <span className="line-through text-red-500 decoration-2">₹{s.totalAmount}</span> : `₹${s.totalAmount.toLocaleString()}`}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {s.status !== 'rto' && (
                                            <button onClick={() => {
                                                if (confirm('Mark this sale as Returned (RTO)? Stock will be added back.')) markRTO(s.id);
                                            }} className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-red-500/10 text-red-500 px-3 py-1 rounded hover:bg-red-500 hover:text-white font-bold uppercase">
                                                RTO
                                            </button>
                                        )}
                                        {s.status === 'rto' && <span className="text-[9px] text-red-500 font-black uppercase">Returned</span>}
                                    </td>
                                </tr>
                            ))}
                            {filteredSales.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-white/20 font-bold uppercase tracking-widest">No Records Found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* POS Modal */}
            {showPos && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
                    <div className="glass w-full max-w-lg p-8 rounded-[40px] border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button onClick={resetPos} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"><i className="fa-solid fa-xmark text-xl"></i></button>

                        <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-8 text-center text-cyan-400">New Sale</h3>

                        {!foundItem ? (
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <button onClick={() => setScanMode(true)} className="flex-1 py-10 glass rounded-3xl border-cyan-400/20 hover:bg-cyan-400/10 transition-all flex flex-col items-center gap-4 group">
                                        <i className="fa-solid fa-qrcode text-4xl text-cyan-400 group-hover:scale-110 transition-transform"></i>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Scan QR</span>
                                    </button>
                                </div>

                                {scanMode && (
                                    <div className="my-4">
                                        <QRScanner onScanSuccess={handleSearch} />
                                        <button onClick={() => setScanMode(false)} className="w-full mt-2 py-2 text-xs font-bold text-red-400">Cancel Scan</button>
                                    </div>
                                )}

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-black px-2 text-white/40 font-bold">Or Enter Code</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        value={manualCode}
                                        onChange={(e) => setManualCode(e.target.value)}
                                        placeholder="Enter Unique Code..."
                                        className="flex-1 glass p-4 rounded-2xl border-white/10 text-sm font-bold uppercase placeholder:text-white/20 focus:border-cyan-400 focus:outline-none"
                                    />
                                    <button onClick={() => handleSearch(manualCode)} className="bg-white/10 px-6 rounded-2xl hover:bg-white/20 transition-all"><i className="fa-solid fa-arrow-right"></i></button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="bg-cyan-400/10 p-6 rounded-3xl border border-cyan-400/20 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-1">Item Found</p>
                                    <h4 className="text-xl font-black italic">{foundItem.product.name}</h4>
                                    <p className="text-sm font-bold text-white/60 mt-1">Size: {foundItem.variant.size} • ₹{foundItem.product.salePrice}</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-white/30 mb-2 block">Customer Type</label>
                                            <select
                                                value={custType}
                                                onChange={e => setCustType(e.target.value as any)}
                                                className="w-full glass p-4 rounded-2xl border-white/10 text-sm font-bold text-white bg-black/50 appearance-none focus:border-cyan-400 focus:outline-none"
                                            >
                                                <option>Customer</option>
                                                <option>Actor</option>
                                                <option>Influencer</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-white/30 mb-2 block">Channel</label>
                                            <select
                                                value={channel}
                                                onChange={e => setChannel(e.target.value as any)}
                                                className="w-full glass p-4 rounded-2xl border-white/10 text-sm font-bold text-white bg-black/50 appearance-none focus:border-cyan-400 focus:outline-none"
                                            >
                                                <option value="BrokenAlley">Broken Alley (Store)</option>
                                                <option value="StreetJunkies">Street Junkies</option>
                                                <option value="CC">CC</option>
                                                <option value="Website">Website</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-white/30 mb-2 block">Customer Name</label>
                                        <input value={custName} onChange={e => setCustName(e.target.value)} placeholder="Walk-in Customer" className="w-full glass p-4 rounded-2xl border-white/10 text-sm font-bold text-white bg-transparent focus:border-cyan-400 focus:outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-white/30 mb-2 block">Phone (Optional)</label>
                                            <input value={custPhone} onChange={e => setCustPhone(e.target.value)} placeholder="98XXXXXXXX" type="tel" className="w-full glass p-4 rounded-2xl border-white/10 text-sm font-bold text-white bg-transparent focus:border-cyan-400 focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-white/30 mb-2 block">Address (Optional)</label>
                                            <input value={custAddr} onChange={e => setCustAddr(e.target.value)} placeholder="Metro City..." className="w-full glass p-4 rounded-2xl border-white/10 text-sm font-bold text-white bg-transparent focus:border-cyan-400 focus:outline-none" />
                                        </div>
                                    </div>
                                </div>

                                <button onClick={handleConfirmSale} className="w-full py-5 bg-cyan-400 text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-cyan-400/20 hover:scale-[1.02] active:scale-95 transition-all">
                                    Confirm & Save
                                </button>
                                <button onClick={() => setFoundItem(null)} className="w-full py-3 text-white/40 font-bold text-xs hover:text-white">Back to Search</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


export default SalesView;
