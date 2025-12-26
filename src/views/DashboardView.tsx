import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { View } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardViewProps {
    setView: (view: View) => void;
    dateRange: { start: Date | null; end: Date | null };
}

const DashboardView: React.FC<DashboardViewProps> = ({ setView, dateRange }) => {
    const { products, sales, expenses } = useStore();

    const stats = useMemo(() => {
        let filteredSales = sales.filter(s => s.status !== 'rto');
        let filteredExpenses = expenses;

        if (dateRange && dateRange.start && dateRange.end) {
            const start = new Date(dateRange.start);
            start.setHours(0, 0, 0, 0);
            const end = new Date(dateRange.end);
            end.setHours(23, 59, 59, 999);

            filteredSales = filteredSales.filter(s => {
                const d = new Date(s.date);
                d.setHours(0, 0, 0, 0);
                return d >= start && d <= end;
            });

            filteredExpenses = filteredExpenses.filter(e => {
                const d = new Date(e.date);
                d.setHours(0, 0, 0, 0);
                return d >= start && d <= end;
            });
        }

        const totalRev = filteredSales.reduce((a, b) => a + b.totalAmount, 0);
        const totalExp = filteredExpenses.reduce((a, b) => a + b.amount, 0);
        const totalInvValue = products.reduce((acc, p) => {
            const totalUnits = p.variants.reduce((vAcc, v) => vAcc + v.stockBrokenAlley + v.stockStreetJunkies + v.stockCC, 0);
            return acc + (totalUnits * p.costPrice);
        }, 0);

        return {
            revenue: totalRev,
            expenses: totalExp,
            profit: totalRev - totalExp,
            inventoryValue: totalInvValue,
            recentSales: filteredSales.slice(-20) // Use for chart
        };
    }, [sales, expenses, products, dateRange]);

    return (
        <div className="space-y-8 animate-fadeIn relative font-sans">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Revenue', val: stats.revenue, color: 'text-cyan-400', icon: 'fa-indian-rupee-sign', action: () => setView('Sales') },
                    { label: 'Total Burn', val: stats.expenses, color: 'text-red-400', icon: 'fa-fire', action: () => setView('Expenses') },
                    { label: 'Net Margin', val: stats.profit, color: stats.profit >= 0 ? 'text-cyan-400' : 'text-red-400', icon: 'fa-chart-pie', action: () => setView('Sales') },
                    { label: 'Asset Value', val: stats.inventoryValue, color: 'text-white/60', icon: 'fa-boxes-stacked', action: () => setView('Inventory') }
                ].map((item, i) => (
                    <div key={i} onClick={item.action} className="card-std p-6 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer group hover:border-white/20">
                        <div className="flex justify-between items-start mb-4">
                            <span className="label-text group-hover:text-white transition-colors">{item.label}</span>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                <i className={`fa-solid ${item.icon} text-xs opacity-50 group-hover:opacity-100`}></i>
                            </div>
                        </div>
                        <h2 className={`text-2xl lg:text-3xl font-black italic tracking-tighter ${item.color}`}>₹{item.val.toLocaleString()}</h2>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="card-std p-8 flex flex-col h-[450px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black italic uppercase flex items-center gap-3">
                            <i className="fa-solid fa-triangle-exclamation text-red-500"></i>
                            Low Stock Alerts (Hub)
                        </h3>
                        <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Broken Alley</span>
                    </div>

                    <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1 -mr-2">
                        {products.flatMap(p =>
                            p.variants
                                .filter(v => v.stockBrokenAlley > 0 && v.stockBrokenAlley <= 2)
                                .map((v, i) => (
                                    <div key={`${p.id}-${v.size}`} className="flex items-center justify-between p-4 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                                                <i className="fa-solid fa-shirt text-red-500 text-lg"></i>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold truncate text-white uppercase">{p.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold uppercase">{v.size}</span>
                                                    <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Only {v.stockBrokenAlley} Left</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => setView('Inventory')} className="btn btn-sm bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white uppercase tracking-wider">
                                            Restock
                                        </button>
                                    </div>
                                ))
                        )}
                        {products.every(p => p.variants.every(v => v.stockBrokenAlley === 0 || v.stockBrokenAlley > 2)) && (
                            <div className="flex flex-col items-center justify-center h-full text-white/20">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <i className="fa-solid fa-check text-4xl text-green-400/40"></i>
                                </div>
                                <p className="text-xs font-bold uppercase tracking-widest">Stock Levels Healthy</p>
                            </div>
                        )}
                    </div>

                    <button onClick={() => setView('Inventory')} className="btn btn-primary w-full mt-6">
                        View Full Inventory
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
