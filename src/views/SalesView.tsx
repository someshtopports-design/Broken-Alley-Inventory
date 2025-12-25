
import React from 'react';
import { useStore } from '../context/StoreContext';

const SalesView: React.FC = () => {
    const { sales } = useStore();

    return (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-black uppercase italic">Sales History</h2>
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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sales.map(s => (
                                <tr key={s.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-8 py-6 text-xs text-white/40">{new Date(s.date).toLocaleDateString()}</td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold">{s.customerName}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold uppercase">{s.productName}</p>
                                        <p className="text-[10px] text-lime-400 font-black">SIZE: {s.size} (x{s.quantity})</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{s.channel}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right font-black text-lime-400">₹{s.totalAmount.toLocaleString()}</td>
                                </tr>
                            ))}
                            {sales.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-white/20 font-bold uppercase tracking-widest">No Sales Recorded</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalesView;
