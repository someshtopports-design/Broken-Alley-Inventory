
import React, { useMemo, useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { View } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardViewProps {
    setView: (view: View) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ setView }) => {
    const { products, sales, expenses, storeConfig, updateStoreConfig } = useStore();
    const [showOnboard, setShowOnboard] = useState(false);

    // Date Filters for interactive charts could go here
    // For now, simple stats

    useEffect(() => {
        if (!storeConfig) setShowOnboard(true);
    }, [storeConfig]);

    const stats = useMemo(() => {
        const totalRev = sales.reduce((a, b) => a + b.totalAmount, 0);
        const totalExp = expenses.reduce((a, b) => a + b.amount, 0);
        const totalInvValue = products.reduce((acc, p) => {
            const totalUnits = p.variants.reduce((vAcc, v) => vAcc + v.stockHome + v.stockStoreA + v.stockStoreB, 0);
            return acc + (totalUnits * p.costPrice);
        }, 0);

        return {
            revenue: totalRev,
            expenses: totalExp,
            profit: totalRev - totalExp,
            inventoryValue: totalInvValue
        };
    }, [sales, expenses, products]);

    return (
        <div className="space-y-6 animate-fadeIn relative">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Revenue', val: stats.revenue, color: 'text-lime-400', icon: 'fa-indian-rupee-sign', action: () => setView('Sales') },
                    { label: 'Total Burn', val: stats.expenses, color: 'text-red-400', icon: 'fa-fire', action: () => setView('Expenses') },
                    { label: 'Net Margin', val: stats.profit, color: stats.profit >= 0 ? 'text-lime-400' : 'text-red-400', icon: 'fa-chart-pie', action: () => setView('Sales') },
                    { label: 'Asset Value', val: stats.inventoryValue, color: 'text-white/60', icon: 'fa-boxes-stacked', action: () => setView('Inventory') }
                ].map((item, i) => (
                    <div key={i} onClick={item.action} className="glass p-5 rounded-3xl border-white/5 shadow-sm hover:scale-[1.02] active:scale-95 transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{item.label}</span>
                            <i className={`fa-solid ${item.icon} text-xs opacity-30 group-hover:opacity-100 transition-opacity`}></i>
                        </div>
                        <h2 className={`text-xl lg:text-2xl font-black ${item.color}`}>₹{item.val.toLocaleString()}</h2>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass p-6 rounded-3xl h-[350px]">
                    <h3 className="font-bold mb-6 flex items-center gap-2">
                        <i className="fa-solid fa-chart-line text-lime-400"></i>
                        Revenue Stream (Last 10 Sales)
                    </h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={sales.slice(-10)}>
                            <XAxis dataKey="date" hide />
                            <Tooltip contentStyle={{ background: '#111', border: 'none', borderRadius: '12px', fontSize: '12px' }} />
                            <Bar dataKey="totalAmount" fill="#a3e635" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="glass p-6 rounded-3xl flex flex-col">
                    <h3 className="font-bold mb-4">Urgent Stock Alerts (Home &lt; 3)</h3>
                    <div className="space-y-3 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
                        {products.flatMap(p =>
                            p.variants
                                .filter(v => v.stockHome < 3)
                                .map((v, i) => (
                                    <div key={`${p.id}-${v.size}`} className="flex items-center justify-between p-3 rounded-2xl bg-red-400/5 border border-red-400/10">
                                        <div>
                                            <p className="text-xs font-bold truncate text-red-400">{p.name} ({v.size})</p>
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest">Home Stock: {v.stockHome}</p>
                                        </div>
                                        <i className="fa-solid fa-triangle-exclamation text-red-400 text-xs animate-pulse"></i>
                                    </div>
                                ))
                        )}
                        {products.every(p => p.variants.every(v => v.stockHome >= 3)) && (
                            <p className="text-xs text-white/20 text-center py-10 font-bold uppercase tracking-widest">All Clear</p>
                        )}
                    </div>
                    <button onClick={() => setView('Inventory')} className="mt-auto w-full py-4 text-[10px] font-black uppercase tracking-widest text-lime-400 border border-lime-400/20 rounded-2xl hover:bg-lime-400/10 transition-all">
                        Full Inventory
                    </button>
                </div>
            </div>

            {showOnboard && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fadeIn">
                    <div className="glass w-full max-w-md p-10 rounded-[50px] border border-lime-400/20 shadow-[0_0_100px_rgba(163,230,53,0.1)] relative text-center">
                        <div className="w-20 h-20 bg-lime-400 rounded-3xl mx-auto flex items-center justify-center text-3xl text-black mb-6 shadow-xl shadow-lime-400/20">
                            <i className="fa-solid fa-store"></i>
                        </div>
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Welcome to Ops</h2>
                        <p className="text-white/40 text-sm font-medium mb-8">Please setup your Store details to begin.</p>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const name = (document.getElementById('s-name') as HTMLInputElement).value;
                            const c1 = (document.getElementById('s-c1') as HTMLInputElement).value;
                            const c2 = (document.getElementById('s-c2') as HTMLInputElement).value;
                            if (name && c1) {
                                updateStoreConfig({
                                    name,
                                    contacts: [
                                        { name: 'Primary', phone: c1 },
                                        { name: 'Secondary', phone: c2 }
                                    ]
                                });
                                setShowOnboard(false);
                            }
                        }} className="space-y-4 text-left">
                            <div>
                                <label className="text-[10px] uppercase font-black tracking-widest text-white/30 ml-2">Store Name</label>
                                <input id="s-name" defaultValue="Store A" className="w-full glass p-4 rounded-2xl font-bold border-white/10 focus:border-lime-400 focus:outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-black tracking-widest text-white/30 ml-2">Manager Contact</label>
                                <input id="s-c1" placeholder="+91 98..." className="w-full glass p-4 rounded-2xl font-bold border-white/10 focus:border-lime-400 focus:outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-black tracking-widest text-white/30 ml-2">Staff Contact</label>
                                <input id="s-c2" placeholder="+91 98..." className="w-full glass p-4 rounded-2xl font-bold border-white/10 focus:border-lime-400 focus:outline-none" />
                            </div>
                            <button type="submit" className="w-full py-5 bg-lime-400 text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-lime-400/20 hover:scale-[1.02] active:scale-95 transition-all mt-4">
                                Complete Setup
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardView;
