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
        <div className="space-y-6 animate-fadeIn font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-black uppercase italic text-cyan-400">Business Burn</h2>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setCategoryFilter('All')}
                        className={`px-4 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all ${categoryFilter === 'All' ? 'bg-white text-black' : 'glass text-white/40 hover:text-white'}`}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-4 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest whitespace-nowrap transition-all ${categoryFilter === cat ? 'bg-white text-black' : 'glass text-white/40 hover:text-white'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => exportExpensesToCSV(filteredExpenses)}
                        className="glass px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white border border-white/10 transition-all whitespace-nowrap"
                    >
                        Export List
                    </button>
                    <button onClick={() => setShowModal('expense')} className="bg-red-400 text-black px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-400/20 active:scale-95 transition-all w-full md:w-auto whitespace-nowrap">Add Expense</button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredExpenses.map(e => (
                    <div key={e.id} className="glass p-6 rounded-[30px] flex items-center justify-between border-white/5 hover:border-red-400/20 transition-all">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-red-400/10 flex items-center justify-center text-red-400 text-xl">
                                <i className={`fa-solid ${e.category === 'Marketing' ? 'fa-bullhorn' :
                                    e.category === 'Delivery' ? 'fa-truck' :
                                        e.category === 'Travel' ? 'fa-plane' :
                                            e.category === 'Manufacturing' ? 'fa-industry' :
                                                e.category === 'Production' ? 'fa-shirt' :
                                                    'fa-receipt'
                                    }`}></i>
                            </div>
                            <div>
                                <p className="font-black uppercase italic text-lg">{e.description}</p>
                                <div className="flex gap-3 items-center mt-1">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-white/30">{e.category}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
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
