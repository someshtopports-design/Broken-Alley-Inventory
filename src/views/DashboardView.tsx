import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { View } from '../types';

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
        };
    }, [sales, expenses, products, dateRange]);

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="heading-page">Overview</h2>
                    <p className="subheading">Real-time business performance</p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Revenue', val: stats.revenue, color: 'text-[#0a84ff]', icon: 'fa-indian-rupee-sign', action: () => setView('Sales') },
                    { label: 'Expenses', val: stats.expenses, color: 'text-[#ff453a]', icon: 'fa-arrow-trend-down', action: () => setView('Expenses') },
                    { label: 'Net Profit', val: stats.profit, color: stats.profit >= 0 ? 'text-[#32d74b]' : 'text-[#ff453a]', icon: 'fa-wallet', action: () => setView('Sales') },
                    { label: 'Asset Value', val: stats.inventoryValue, color: 'text-white', icon: 'fa-box', action: () => setView('Inventory') }
                ].map((item, i) => (
                    <div key={i} onClick={item.action} className="card-std p-6 cursor-pointer hover:border-white/10 group">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-medium text-[#8e8e93] uppercase tracking-wide">{item.label}</span>
                            <i className={`fa-solid ${item.icon} text-sm text-[#8e8e93] group-hover:text-white transition-colors`}></i>
                        </div>
                        <h2 className={`text-2xl lg:text-3xl font-semibold tracking-tight ${item.color}`}>₹{item.val.toLocaleString()}</h2>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="card-std h-[450px] flex flex-col">
                    <div className="card-header">
                        <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                            <i className="fa-solid fa-triangle-exclamation text-[#ff453a]"></i>
                            Low Stock Alerts
                        </h3>
                    </div>

                    <div className="p-2 space-y-1 overflow-y-auto custom-scrollbar flex-1">
                        {products.flatMap(p =>
                            p.variants
                                .filter(v => v.stockBrokenAlley > 0 && v.stockBrokenAlley <= 2)
                                .map((v, i) => (
                                    <div key={`${p.id}-${v.size}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/5 mx-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-[#2c2c2e] flex items-center justify-center">
                                                <i className="fa-solid fa-shirt text-[#8e8e93]"></i>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{p.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-[#8e8e93]">{v.size}</span>
                                                    <span className="text-[10px] bg-[#ff453a]/10 text-[#ff453a] px-1.5 py-0.5 rounded font-medium">Only {v.stockBrokenAlley} Left</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => setView('Inventory')} className="btn btn-sm btn-secondary">
                                            Restock
                                        </button>
                                    </div>
                                ))
                        )}
                        {products.every(p => p.variants.every(v => v.stockBrokenAlley === 0 || v.stockBrokenAlley > 2)) && (
                            <div className="flex flex-col items-center justify-center h-full text-[#8e8e93]">
                                <i className="fa-solid fa-check-circle text-4xl mb-3 text-[#32d74b]/20"></i>
                                <p className="text-sm font-medium">Stock Levels Healthy</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
