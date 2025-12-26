
import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { View } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardViewProps {
    setView: (view: View) => void;
}


const DashboardView: React.FC<DashboardViewProps> = ({ setView }) => {
    const { products, sales, expenses } = useStore();

    const stats = useMemo(() => {
        const totalRev = sales.filter(s => s.status !== 'rto').reduce((a, b) => a + b.totalAmount, 0); // Exclude RTOs from revenue
        const totalExp = expenses.reduce((a, b) => a + b.amount, 0);
        const totalInvValue = products.reduce((acc, p) => {
            const totalUnits = p.variants.reduce((vAcc, v) => vAcc + v.stockBrokenAlley + v.stockStreetJunkies + v.stockCC, 0);
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
        <div className="space-y-6 animate-fadeIn relative font-sans">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Revenue', val: stats.revenue, color: 'text-cyan-400', icon: 'fa-indian-rupee-sign', action: () => setView('Sales') },
                    { label: 'Total Burn', val: stats.expenses, color: 'text-red-400', icon: 'fa-fire', action: () => setView('Expenses') },
                    { label: 'Net Margin', val: stats.profit, color: stats.profit >= 0 ? 'text-cyan-400' : 'text-red-400', icon: 'fa-chart-pie', action: () => setView('Sales') },
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
                        <i className="fa-solid fa-chart-line text-cyan-400"></i>
                        Revenue Stream (Last 10 Sales)
                    </h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={sales.filter(s => s.status !== 'rto').slice(-10)}>
                            <XAxis dataKey="date" hide />
                            <Tooltip contentStyle={{ background: '#111', border: 'none', borderRadius: '12px', fontSize: '12px', fontFamily: '"Space Grotesk", sans-serif' }} />
                            <Bar dataKey="totalAmount" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="glass p-6 rounded-3xl flex flex-col">
                    <h3 className="font-bold mb-4">Hub Stock Alerts (1-2 Left)</h3>
                    <div className="space-y-3 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
                        {products.flatMap(p =>
                            p.variants
                                .filter(v => v.stockBrokenAlley > 0 && v.stockBrokenAlley <= 2)
                                .map((v, i) => (
                                    <div key={`${p.id}-${v.size}`} className="flex items-center justify-between p-3 rounded-2xl bg-red-400/5 border border-red-400/10">
                                        <div>
                                            <p className="text-xs font-bold truncate text-red-400">{p.name} ({v.size})</p>
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest">Hub Stock: {v.stockBrokenAlley}</p>
                                        </div>
                                        <i className="fa-solid fa-triangle-exclamation text-red-400 text-xs animate-pulse"></i>
                                    </div>
                                ))
                        )}
                        {products.every(p => p.variants.every(v => v.stockBrokenAlley === 0 || v.stockBrokenAlley > 2)) && (
                            <p className="text-xs text-white/20 text-center py-10 font-bold uppercase tracking-widest">All Clear</p>
                        )}
                    </div>
                    <button onClick={() => setView('Inventory')} className="mt-auto w-full py-4 text-[10px] font-black uppercase tracking-widest text-cyan-400 border border-cyan-400/20 rounded-2xl hover:bg-cyan-400/10 transition-all">
                        Full Inventory
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
