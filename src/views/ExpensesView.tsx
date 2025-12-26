import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Expense } from '../types';
import { exportExpensesToCSV } from '../utils/export';

interface ExpensesViewProps {
    setShowModal: (modal: 'product' | 'transfer' | 'expense' | null) => void;
    dateRange: { start: Date | null; end: Date | null };
}

const ExpensesView: React.FC<ExpensesViewProps> = ({ setShowModal, dateRange }) => {
    const { expenses } = useStore();
    const [categoryFilter, setCategoryFilter] = useState<'All' | Expense['category']>('All');

    const filteredExpenses = expenses.filter(e => {
        const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
        let matchesDate = true;
        if (dateRange && dateRange.start && dateRange.end) {
            const expDate = new Date(e.date);
            expDate.setHours(0, 0, 0, 0);

            const start = new Date(dateRange.start);
            start.setHours(0, 0, 0, 0);

            const end = new Date(dateRange.end);
            end.setHours(23, 59, 59, 999);

            matchesDate = expDate >= start && expDate <= end;
        }
        return matchesCategory && matchesDate;
    });

    const categories: Expense['category'][] = ['Marketing', 'Delivery', 'Samples', 'Travel', 'Production', 'Manufacturing', 'Other'];

    return (
        <div className="space-y-8 animate-fadeIn font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <h2 className="heading-page">Business Burn</h2>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setCategoryFilter('All')}
                        className={`btn-sm transition-all font-bold uppercase tracking-widest ${categoryFilter === 'All' ? 'bg-white text-black' : 'glass text-white/40 hover:text-white'}`}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`btn-sm whitespace-nowrap transition-all font-bold uppercase tracking-widest ${categoryFilter === cat ? 'bg-white text-black' : 'glass text-white/40 hover:text-white'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => exportExpensesToCSV(filteredExpenses)}
                        className="btn btn-secondary whitespace-nowrap"
                    >
                        Export List
                    </button>
                    <button onClick={() => setShowModal('expense')} className="btn btn-danger whitespace-nowrap shadow-xl shadow-red-500/10">
                        Add Expense
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredExpenses.map(e => (
                    <div key={e.id} className="card-std p-6 flex items-center justify-between hover:border-red-400/20 group">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-red-500/5 group-hover:bg-red-500/10 transition-colors flex items-center justify-center text-red-500 text-xl">
                                <i className={`fa-solid ${e.category === 'Marketing' ? 'fa-bullhorn' :
                                    e.category === 'Delivery' ? 'fa-truck' :
                                        e.category === 'Travel' ? 'fa-plane' :
                                            e.category === 'Manufacturing' ? 'fa-industry' :
                                                e.category === 'Production' ? 'fa-shirt' :
                                                    'fa-receipt'
                                    }`}></i>
                            </div>
                            <div>
                                <p className="font-black uppercase italic text-lg leading-none">{e.description}</p>
                                <div className="flex gap-3 items-center mt-2">
                                    <span className="px-2 py-1 rounded bg-white/5 text-[9px] uppercase font-bold tracking-widest text-white/40">{e.category}</span>
                                    <span className="text-[10px] font-bold text-white/20">{new Date(e.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-2xl font-black">₹{e.amount.toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExpensesView;
