
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

            <div className="grid grid-cols-1 gap-6">
                <div className="glass p-6 rounded-3xl flex flex-col h-[400px]">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-triangle-exclamation text-red-400"></i>
                        Low Stock Alerts (Hub)
                    </h3>
                    <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                        {products.flatMap(p =>
                            p.variants
                                .filter(v => v.stockBrokenAlley > 0 && v.stockBrokenAlley <= 2)
                                .map((v, i) => (
                                    <div key={`${p.id}-${v.size}`} className="flex items-center justify-between p-4 rounded-2xl bg-red-400/5 border border-red-400/10 hover:bg-red-400/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-red-400/10 flex items-center justify-center">
                                                <i className="fa-solid fa-shirt text-red-400 text-sm"></i>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold truncate text-white">{p.name} ({v.size})</p>
                                                <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mt-1">Only {v.stockBrokenAlley} Left</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setView('Inventory')} className="px-4 py-2 rounded-xl bg-white/5 text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 transition-all">
                                            Restock
                                        </button>
                                    </div>
                                ))
                        )}
                        {products.every(p => p.variants.every(v => v.stockBrokenAlley === 0 || v.stockBrokenAlley > 2)) && (
                            <div className="flex flex-col items-center justify-center h-full text-white/20">
                                <i className="fa-solid fa-circle-check text-4xl mb-4 text-green-400/20"></i>
                                <p className="text-xs font-bold uppercase tracking-widest">All Stock Levels Normal</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
