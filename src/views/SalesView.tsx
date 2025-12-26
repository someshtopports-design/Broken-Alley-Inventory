import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import QRScanner from '../components/QRScanner';
import { Product, ProductVariant } from '../types';
import { exportSalesToCSV } from '../utils/export';

interface SalesViewProps {
    dateRange: { start: Date | null; end: Date | null };
}

interface CartItem {
    product: Product;
    variant: ProductVariant;
    quantity: number;
    price: number;
}

const SalesView: React.FC<SalesViewProps> = ({ dateRange }) => {
    const { sales, products, recordSale, markRTO } = useStore();
    const [showPos, setShowPos] = useState(false);
    const [scanMode, setScanMode] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [foundItem, setFoundItem] = useState<{ product: Product; variant: ProductVariant } | null>(null);
    const [customPrice, setCustomPrice] = useState<string>(''); // String to handle empty input easily
    const [showRTOs, setShowRTOs] = useState(false);

    // Cart State
    const [cart, setCart] = useState<CartItem[]>([]);

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
            setCustomPrice(found.product.salePrice.toString());
            setScanMode(false);
            setManualCode('');
        } else {
            alert('Item not found!');
        }
    };

    const addToCart = () => {
        if (!foundItem) return;
        const price = parseFloat(customPrice) || foundItem.product.salePrice;

        setCart([...cart, {
            product: foundItem.product,
            variant: foundItem.variant,
            quantity: 1,
            price: price
        }]);

        setFoundItem(null);
        setCustomPrice('');
    };

    const removeFromCart = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        // Process all items
        for (const item of cart) {
            await recordSale({
                uniqueCode: item.variant.uniqueCode,
                itemName: item.product.name,
                size: item.variant.size,
                customerName: custName,
                customerPhone: custPhone,
                customerAddress: custAddr,
                channel: channel,
                customerType: custType,
                quantity: 1,
                amount: item.price // Use the custom price from cart
            });
        }

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
        setCart([]);
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

    const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

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
                    <div className="card-std w-full max-w-5xl h-[85vh] flex overflow-hidden bg-[#0a0a0a] border-white/10 shadow-2xl relative">
                        <button onClick={resetPos} className="absolute top-6 right-6 z-10 text-white/20 hover:text-white transition-colors cursor-pointer"><i className="fa-solid fa-xmark text-xl"></i></button>

                        {/* LEFT COLUMN: Input & Item Adding */}
                        <div className="w-1/3 border-r border-white/5 p-8 flex flex-col gap-6 bg-white/[0.02]">
                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-cyan-400">Add Items</h3>

                            {!foundItem ? (
                                <div className="space-y-6 flex-1">
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
                                            <span className="bg-[#111] px-2 text-white/40 font-bold">Or Enter Code</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <input
                                            value={manualCode}
                                            onChange={(e) => setManualCode(e.target.value)}
                                            placeholder="Enter Unique Code..."
                                            className="input-std uppercase flex-1"
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch(manualCode)}
                                        />
                                        <button onClick={() => handleSearch(manualCode)} className="btn btn-secondary w-12 !px-0 rounded-2xl"><i className="fa-solid fa-arrow-right"></i></button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col gap-4 animate-fadeIn">
                                    <div className="bg-cyan-400/10 p-6 rounded-3xl border border-cyan-400/20 text-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-1">Item Found</p>
                                        <h4 className="text-xl font-black italic">{foundItem.product.name}</h4>
                                        <p className="text-sm font-bold text-white/60 mt-1">Size: {foundItem.variant.size}</p>
                                    </div>

                                    <div>
                                        <label className="label-text">Selling Price</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-bold">₹</span>
                                            <input
                                                type="number"
                                                value={customPrice}
                                                onChange={(e) => setCustomPrice(e.target.value)}
                                                className="input-std pl-8"
                                            />
                                        </div>
                                    </div>

                                    <button onClick={addToCart} className="btn btn-primary w-full shadow-xl mt-auto">
                                        Add to Bill <i className="fa-solid fa-plus"></i>
                                    </button>
                                    <button onClick={() => setFoundItem(null)} className="btn btn-secondary w-full">Back</button>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Bill & Checkout */}
                        <div className="flex-1 p-8 flex flex-col gap-6 overflow-hidden">
                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Current Bill</h3>

                            {/* Cart List */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20 rounded-2xl border border-white/5 p-4 space-y-2">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-white/20">
                                        <i className="fa-solid fa-basket-shopping text-4xl mb-2"></i>
                                        <p className="text-xs font-bold uppercase tracking-widest">Cart is Empty</p>
                                    </div>
                                ) : (
                                    cart.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hovered">
                                            <div>
                                                <p className="text-sm font-bold uppercase">{item.product.name}</p>
                                                <p className="text-[10px] text-white/40 font-bold mt-1">Size: {item.variant.size} • ₹{item.price}</p>
                                            </div>
                                            <button onClick={() => removeFromCart(idx)} className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                                <i className="fa-solid fa-trash text-xs"></i>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Total */}
                            <div className="py-4 border-t border-b border-white/10 flex justify-between items-center">
                                <span className="text-sm font-bold uppercase text-white/40">Total Amount</span>
                                <span className="text-2xl font-black italic text-cyan-400">₹{cartTotal.toLocaleString()}</span>
                            </div>

                            {/* Checkout Form */}
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
                                    <label className="label-text">Phone</label>
                                    <input value={custPhone} onChange={e => setCustPhone(e.target.value)} placeholder="98XXXXXXXX" type="tel" className="input-std" />
                                </div>
                                <div>
                                    <label className="label-text">Address</label>
                                    <input value={custAddr} onChange={e => setCustAddr(e.target.value)} placeholder="Metro City..." className="input-std" />
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={cart.length === 0}
                                className="btn btn-primary w-full shadow-xl"
                            >
                                Checkout ({cart.length} Items)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesView;
