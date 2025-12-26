import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import QRScanner from '../components/QRScanner';
import { Product, ProductVariant } from '../types';
import { exportSalesToCSV } from '../utils/export';

interface SalesViewProps {
    dateRange: { start: Date | null; end: Date | null };
}

const SalesView: React.FC<SalesViewProps> = ({ dateRange }) => {
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

    const filteredSales = sales.filter(s => {
        const matchesStatus = showRTOs ? s.status === 'rto' : s.status !== 'rto';

        // Date Filter
        let matchesDate = true;
        if (dateRange && dateRange.start && dateRange.end) {
            const saleDate = new Date(s.date);
            saleDate.setHours(0, 0, 0, 0);

            const start = new Date(dateRange.start);
            start.setHours(0, 0, 0, 0);

            const end = new Date(dateRange.end);
            end.setHours(23, 59, 59, 999);

            matchesDate = saleDate >= start && saleDate <= end;
        }

        return matchesStatus && matchesDate;
    });

    return (
        <div className="space-y-8 animate-fadeIn relative font-sans">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <h2 className="heading-page">
                        {showRTOs ? 'Returns (RTO)' : 'Sales History'}
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowRTOs(!showRTOs)}
                            className={`btn-sm border border-white/10 transition-all font-bold uppercase tracking-widest ${showRTOs ? 'bg-red-500 text-white' : 'text-white/40 hover:text-white'}`}
                        >
                            {showRTOs ? 'Show Sales' : 'Show RTOs'}
                        </button>
                        <button
                            onClick={() => exportSalesToCSV(filteredSales)}
                            className="btn-sm border border-white/10 text-white/40 hover:text-white"
                        >
                            Export List
                        </button>
                    </div>
                </div>

                <button onClick={() => setShowPos(true)} className="btn btn-primary shadow-xl shadow-cyan-400/20">
                    <i className="fa-solid fa-cash-register"></i> New Sale
                </button>
            </div>

            <div className="card-std overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/10">
                            <tr>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Date</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Customer</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Item & Size</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">Channel</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Revenue</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredSales.map(s => (
                                <tr key={s.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-6 text-xs text-white/40">{new Date(s.date).toLocaleDateString()}</td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold">{s.customerName}</p>
                                        <div className="flex gap-2 items-center mt-1">
                                            <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wide ${s.customerType === 'Influencer' ? 'bg-purple-500/20 text-purple-400' : s.customerType === 'Actor' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-white/40'}`}>
                                                {s.customerType || 'Customer'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold uppercase">{s.productName}</p>
                                        <p className="text-[10px] text-cyan-400 font-bold tracking-wider mt-1">SIZE: {s.size} (x{s.quantity})</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="bg-white/10 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{s.channel}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right font-black text-cyan-400 text-lg">
                                        {s.status === 'rto' ? <span className="line-through text-red-500 decoration-2">₹{s.totalAmount}</span> : `₹${s.totalAmount.toLocaleString()}`}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {s.status !== 'rto' && (
                                            <button onClick={() => {
                                                if (confirm('Mark this sale as Returned (RTO)? Stock will be added back.')) markRTO(s.id);
                                            }} className="opacity-0 group-hover:opacity-100 transition-opacity btn-sm bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white">
                                                RTO
                                            </button>
                                        )}
                                        {s.status === 'rto' && <span className="text-[9px] text-red-500 font-black uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded">Returned</span>}
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
                    <div className="card-std w-full max-w-lg p-8 bg-[#0a0a0a] border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
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
                                        <button onClick={() => setScanMode(false)} className="w-full mt-2 py-2 text-xs font-bold text-red-400 hover:text-red-300">Cancel Scan</button>
                                    </div>
                                )}

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-[#0a0a0a] px-2 text-white/40 font-bold">Or Enter Code</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        value={manualCode}
                                        onChange={(e) => setManualCode(e.target.value)}
                                        placeholder="Enter Unique Code..."
                                        className="input-std uppercase"
                                    />
                                    <button onClick={() => handleSearch(manualCode)} className="btn btn-secondary w-12 !px-0"><i className="fa-solid fa-arrow-right"></i></button>
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
                                            <label className="label-text">Customer Type</label>
                                            <select
                                                value={custType}
                                                onChange={e => setCustType(e.target.value as any)}
                                                className="input-std appearance-none"
                                            >
                                                <option>Customer</option>
                                                <option>Actor</option>
                                                <option>Influencer</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label-text">Channel</label>
                                            <select
                                                value={channel}
                                                onChange={e => setChannel(e.target.value as any)}
                                                className="input-std appearance-none"
                                            >
                                                <option value="BrokenAlley">Broken Alley (Store)</option>
                                                <option value="StreetJunkies">Street Junkies</option>
                                                <option value="CC">CC</option>
                                                <option value="Website">Website</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label-text">Customer Name</label>
                                        <input value={custName} onChange={e => setCustName(e.target.value)} placeholder="Walk-in Customer" className="input-std" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label-text">Phone (Optional)</label>
                                            <input value={custPhone} onChange={e => setCustPhone(e.target.value)} placeholder="98XXXXXXXX" type="tel" className="input-std" />
                                        </div>
                                        <div>
                                            <label className="label-text">Address (Optional)</label>
                                            <input value={custAddr} onChange={e => setCustAddr(e.target.value)} placeholder="Metro City..." className="input-std" />
                                        </div>
                                    </div>
                                </div>

                                <button onClick={handleConfirmSale} className="btn btn-primary w-full shadow-xl">
                                    Confirm & Save
                                </button>
                                <button onClick={() => setFoundItem(null)} className="btn btn-secondary w-full">Back to Search</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesView;
