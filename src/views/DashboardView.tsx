
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
        <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Revenue', val: stats.revenue, color: 'text-lime-400', icon: 'fa-indian-rupee-sign' },
                    { label: 'Total Burn', val: stats.expenses, color: 'text-red-400', icon: 'fa-fire' },
                    { label: 'Net Margin', val: stats.profit, color: stats.profit >= 0 ? 'text-lime-400' : 'text-red-400', icon: 'fa-chart-pie' },
                    { label: 'Asset Value', val: stats.inventoryValue, color: 'text-white/60', icon: 'fa-boxes-stacked' }
                ].map((item, i) => (
                    <div key={i} className="glass p-5 rounded-3xl border-white/5 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{item.label}</span>
                            <i className={`fa-solid ${item.icon} text-xs opacity-30`}></i>
                        </div>
                        <h2 className={`text-xl lg:text-2xl font-black ${item.color}`}>₹{item.val.toLocaleString()}</h2>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass p-6 rounded-3xl h-[350px]">
                    <h3 className="font-bold mb-6 flex items-center gap-2">
                        <i className="fa-solid fa-chart-line text-lime-400"></i>
                        Revenue Stream
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
                    <h3 className="font-bold mb-4">Urgent Stock Alerts</h3>
                    <div className="space-y-3 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
                        {products.flatMap(p =>
                            p.variants
                                .filter(v => (v.stockHome + v.stockStoreA + v.stockStoreB) < 5)
                                .map((v, i) => (
                                    <div key={`${p.id}-${v.size}`} className="flex items-center justify-between p-3 rounded-2xl bg-red-400/5 border border-red-400/10">
                                        <div>
                                            <p className="text-xs font-bold truncate">{p.name} ({v.size})</p>
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest">Only {v.stockHome + v.stockStoreA + v.stockStoreB} left</p>
                                        </div>
                                        <i className="fa-solid fa-triangle-exclamation text-red-400 text-xs"></i>
                                    </div>
                                ))
                        ).slice(0, 5)}
                    </div>
                    <button onClick={() => setView('Inventory')} className="mt-auto w-full py-4 text-[10px] font-black uppercase tracking-widest text-lime-400 border border-lime-400/20 rounded-2xl hover:bg-lime-400/10 transition-all">
                        Open Inventory Matrix
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
