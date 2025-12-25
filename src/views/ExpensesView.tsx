
import React from 'react';
import { useStore } from '../context/StoreContext';

interface ExpensesViewProps {
    setShowModal: (modal: 'product' | 'transfer' | 'expense' | null) => void;
}

const ExpensesView: React.FC<ExpensesViewProps> = ({ setShowModal }) => {
    const { expenses } = useStore();

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black uppercase italic">Business Burn</h2>
                <button onClick={() => setShowModal('expense')} className="bg-red-400 text-black px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-400/20 active:scale-95 transition-all">Add Expense</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {expenses.map(e => (
                    <div key={e.id} className="glass p-6 rounded-[30px] flex items-center justify-between border-white/5 hover:border-red-400/20 transition-all">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-red-400/10 flex items-center justify-center text-red-400 text-xl">
                                <i className={`fa-solid ${e.category === 'Marketing' ? 'fa-bullhorn' :
                                        e.category === 'Delivery' ? 'fa-truck' :
                                            e.category === 'Travel' ? 'fa-plane' : 'fa-receipt'
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
