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
    const { sales, products, recordSale, markRTO, salesSession, updateSalesSession } = useStore();

    // UI State (Local)
    const [scanMode, setScanMode] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [foundItem, setFoundItem] = useState<{ product: Product; variant: ProductVariant } | null>(null);
    const [customPrice, setCustomPrice] = useState<string>('');
    const [showRTOs, setShowRTOs] = useState(false);

    // Destructure session for easier access
    const { cart, custName, custPhone, custAddr, custType, channel, showPos } = salesSession;

    const handleSearch = (code: string) => {
        const cleanCode = code.trim().toLowerCase();
        let found: { product: Product; variant: ProductVariant } | null = null;

        for (const p of products) {
            // Case-insensitive check
            const v = p.variants.find(v => v.uniqueCode.toLowerCase() === cleanCode);
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
            alert('Item not found! Please check the code.');
        }
    };

    const addToCart = () => {
        if (!foundItem) return;
        const price = parseFloat(customPrice) || foundItem.product.salePrice;

        const newItem = {
            product: foundItem.product,
            variant: foundItem.variant,
            quantity: 1,
            price: price
        };

        updateSalesSession({ cart: [...cart, newItem] });
        setFoundItem(null);
        setCustomPrice('');
    };

    const removeFromCart = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        updateSalesSession({ cart: newCart });
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
                amount: item.price
            });
        }

        resetPos();
    };

    const resetPos = () => {
        setFoundItem(null);
        setManualCode('');
        setScanMode(false);
        // Reset session
        updateSalesSession({
            cart: [],
            custName: '',
            custPhone: '',
            custAddr: '',
            custType: 'Customer',
            showPos: false
        });
    };

    const togglePos = (open: boolean) => {
        updateSalesSession({ showPos: open });
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

    const cartTotal = cart.reduce((sum: number, item: any) => sum + item.price, 0);

    return (
        <div className="space-y-6 animate-fadeIn relative">
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="heading-page">
                        {showRTOs ? 'Returns (RTO)' : 'Sales'}
                    </h2>
                    <p className="subheading">Transaction history and POS</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => exportSalesToCSV(filteredSales)}
                        className="btn btn-secondary"
                    >
                        Export CSV
                    </button>
                    <button
                        onClick={() => setShowRTOs(!showRTOs)}
                        className={`btn ${showRTOs ? 'btn-danger' : 'btn-secondary'}`}
                    >
                        {showRTOs ? 'View Active Sales' : 'View Returns'}
                    </button>
                    <button onClick={() => togglePos(true)} className="btn btn-primary">
                        <i className="fa-solid fa-plus"></i> New Sale
                    </button>
                </div>
            </div>

            <div className="card-std overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table-std">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Item</th>
                                <th>Channel</th>
                                <th className="text-right">Price</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.map(s => (
                                <tr key={s.id} className="group">
                                    <td className="w-32 text-[#8e8e93] text-xs font-mono">{new Date(s.date).toLocaleDateString()}</td>
                                    <td>
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{s.customerName}</span>
                                            <span className={`text-[10px] uppercase font-bold tracking-wide mt-0.5 w-fit ${s.customerType === 'Influencer' ? 'text-purple-400' : s.customerType === 'Actor' ? 'text-amber-400' : 'text-[#8e8e93]'}`}>
                                                {s.customerType || 'Customer'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <p className="text-sm font-medium">{s.productName}</p>
                                        <p className="text-xs text-[#8e8e93] mt-0.5">Size: {s.size} <span className="mx-1">•</span> Qty: {s.quantity}</p>
                                    </td>
                                    <td>
                                        <span className="px-2 py-1 bg-white/5 rounded text-[10px] uppercase font-medium text-[#8e8e93]">{s.channel}</span>
                                    </td>
                                    <td className="text-right font-medium text-[#0a84ff]">
                                        {s.status === 'rto' ? <span className="line-through text-[#ff453a] opacity-60">₹{s.totalAmount}</span> : `₹${s.totalAmount.toLocaleString()}`}
                                    </td>
                                    <td className="text-right">
                                        {s.status !== 'rto' && (
                                            <button onClick={() => {
                                                if (confirm('Mark this sale as Returned (RTO)? Stock will be added back.')) markRTO(s.id);
                                            }} className="btn-sm btn-danger opacity-0 group-hover:opacity-100 transition-opacity">
                                                RTO
                                            </button>
                                        )}
                                        {s.status === 'rto' && <span className="text-[10px] text-[#ff453a] font-bold uppercase bg-[#ff453a]/10 px-2 py-1 rounded">Returned</span>}
                                    </td>
                                </tr>
                            ))}
                            {filteredSales.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-12 text-center text-[#8e8e93] text-sm">No records found matching your filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* POS Modal - Professional Layout */}
            {showPos && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fadeIn">
                    <div className="bg-[#1c1c1e] w-full max-w-6xl h-[85vh] flex overflow-hidden rounded-[24px] border border-white/10 shadow-2xl relative">
                        <button onClick={() => togglePos(false)} className="absolute top-6 right-6 z-10 text-[#8e8e93] hover:text-white transition-colors cursor-pointer w-8 h-8 flex items-center justify-center bg-[#2c2c2e] rounded-full border border-white/5">
                            <i className="fa-solid fa-xmark text-sm"></i>
                        </button>

                        {/* LEFT: Item Selection */}
                        <div className="w-[400px] border-r border-white/5 flex flex-col bg-[#2c2c2e]/30">
                            <div className="p-6 border-b border-white/5">
                                <h3 className="text-lg font-semibold text-white">Add Items</h3>
                                <p className="text-xs text-[#8e8e93]">Scan or search inventory</p>
                            </div>

                            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                                {!foundItem ? (
                                    <>
                                        <button onClick={() => setScanMode(true)} className="w-full py-12 border-2 border-dashed border-white/10 rounded-[16px] hover:border-[#0a84ff]/50 hover:bg-[#0a84ff]/5 transition-all group flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#0a84ff] transition-colors">
                                                <i className="fa-solid fa-qrcode text-xl text-[#8e8e93] group-hover:text-white"></i>
                                            </div>
                                            <span className="text-sm font-medium text-[#8e8e93] group-hover:text-[#0a84ff]">Click to Scan QR</span>
                                        </button>

                                        {scanMode && (
                                            <div className="card-std overflow-hidden relative">
                                                <QRScanner onScanSuccess={handleSearch} />
                                                <button onClick={() => setScanMode(false)} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-xs hover:bg-black/80">Stop Scanning</button>
                                            </div>
                                        )}

                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-white/10"></div>
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase">
                                                <span className="bg-[#252527] px-2 text-[#8e8e93]">Or</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <i className="fa-solid fa-barcode absolute left-3 top-1/2 -translate-y-1/2 text-[#8e8e93]"></i>
                                                <input
                                                    value={manualCode}
                                                    onChange={(e) => setManualCode(e.target.value)}
                                                    placeholder="Enter Code..."
                                                    className="input-std pl-9"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(manualCode)}
                                                />
                                            </div>
                                            <button onClick={() => handleSearch(manualCode)} className="btn btn-secondary w-10 !px-0"><i className="fa-solid fa-arrow-right text-xs"></i></button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col animate-fadeIn">
                                        <div className="bg-[#2c2c2e] p-6 rounded-[16px] border border-white/5 text-center mb-6">
                                            <div className="w-12 h-12 rounded-full bg-[#0a84ff]/20 text-[#0a84ff] flex items-center justify-center mx-auto mb-3">
                                                <i className="fa-solid fa-check text-lg"></i>
                                            </div>
                                            <h4 className="text-lg font-semibold text-white">{foundItem.product.name}</h4>
                                            <p className="text-sm text-[#8e8e93] mt-1">Size: {foundItem.variant.size}</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="label-text">Selling Price (INR)</label>
                                                <input
                                                    type="number"
                                                    value={customPrice}
                                                    onChange={(e) => setCustomPrice(e.target.value)}
                                                    className="input-std font-mono text-right text-lg"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-auto space-y-3">
                                            <button onClick={addToCart} className="btn btn-primary w-full h-12 text-base shadow-lg shadow-blue-500/20">
                                                Add to Cart
                                            </button>
                                            <button onClick={() => setFoundItem(null)} className="btn btn-secondary w-full">Cancel</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Cart & Checkout */}
                        <div className="flex-1 flex flex-col bg-[#1c1c1e]">
                            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Current Order</h3>
                                    <p className="text-xs text-[#8e8e93]">{cart.length} items in cart</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-[#8e8e93] uppercase tracking-wide">Total</p>
                                    <p className="text-2xl font-bold text-white font-mono">₹{cartTotal.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Cart List */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-[#8e8e93]/40 border-2 border-dashed border-white/5 rounded-[20px]">
                                        <i className="fa-solid fa-cart-plus text-4xl mb-3"></i>
                                        <p className="text-sm font-medium">Cart is empty</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {cart.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-4 rounded-[12px] bg-[#2c2c2e]/50 border border-white/5 hover:border-[#0a84ff]/30 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-[#3a3a3c] flex items-center justify-center text-[#8e8e93] text-lg font-medium">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{item.product.name}</p>
                                                        <p className="text-xs text-[#8e8e93]">Size: {item.variant.size}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <p className="font-mono text-white">₹{item.price}</p>
                                                    <button onClick={() => removeFromCart(idx)} className="text-[#8e8e93] hover:text-[#ff453a] transition-colors">
                                                        <i className="fa-solid fa-trash-can"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Checkout Form */}
                            <div className="p-8 bg-[#2c2c2e]/30 border-t border-white/5">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="label-text">Customer Type</label>
                                        <div className="relative">
                                            <select
                                                value={custType}
                                                onChange={e => updateSalesSession({ custType: e.target.value as any })}
                                                className="input-std appearance-none"
                                            >
                                                <option>Customer</option>
                                                <option>Actor</option>
                                                <option>Influencer</option>
                                            </select>
                                            <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[#8e8e93] text-xs pointer-events-none"></i>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label-text">Sales Channel</label>
                                        <div className="relative">
                                            <select
                                                value={channel}
                                                onChange={e => updateSalesSession({ channel: e.target.value as any })}
                                                className="input-std appearance-none"
                                            >
                                                <option value="BrokenAlley">Broken Alley (Store)</option>
                                                <option value="StreetJunkies">Street Junkies</option>
                                                <option value="CC">CC</option>
                                                <option value="Website">Website</option>
                                            </select>
                                            <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[#8e8e93] text-xs pointer-events-none"></i>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="col-span-1">
                                        <label className="label-text">Name</label>
                                        <input value={custName} onChange={e => updateSalesSession({ custName: e.target.value })} placeholder="Name" className="input-std" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="label-text">Phone</label>
                                        <input value={custPhone} onChange={e => updateSalesSession({ custPhone: e.target.value })} placeholder="Phone" type="tel" className="input-std" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="label-text">Address</label>
                                        <input value={custAddr} onChange={e => updateSalesSession({ custAddr: e.target.value })} placeholder="Addr" className="input-std" />
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={cart.length === 0}
                                    className="btn btn-primary w-full h-12 text-base font-medium shadow-none hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50"
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesView;
