
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { parseBusinessInput } from '../services/geminiService';
import { Expense } from '../types';

const AIConsoleView: React.FC = () => {
    const { recordSale, handleTransfer, addExpense, products } = useStore();
    const [aiInput, setAiInput] = useState('');
    const [isAiProcessing, setIsAiProcessing] = useState(false);

    const handleAiAction = async () => {
        if (!aiInput.trim()) return;
        setIsAiProcessing(true);
        const result = await parseBusinessInput(aiInput);

        if (result) {
            if (result.type === 'expense') {
                const newEx: Expense = {
                    id: Date.now().toString(),
                    category: (result.data.category || 'Other') as Expense['category'],
                    amount: result.data.amount || 0,
                    description: result.data.description || aiInput,
                    date: new Date().toISOString()
                };
                addExpense(newEx);
            } else if (result.type === 'sale') {
                recordSale(result.data);
            } else if (result.type === 'transfer') {
                const prod = products.find(p => p.name.toLowerCase().includes(result.data.itemName?.toLowerCase() || '')) || products[0]; // TODO: Better error handling if no product found
                if (prod) {
                    handleTransfer({
                        productId: prod.id,
                        size: result.data.size || prod.variants[0].size,
                        from: (result.data.from || 'Home') as any,
                        to: (result.data.to || 'Store A') as any,
                        quantity: result.data.quantity || 1
                    });
                }
            }
            setAiInput('');
        }
        setIsAiProcessing(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 py-10 animate-fadeIn">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-[30px] bg-lime-400 text-black text-3xl mb-4 shadow-[0_0_50px_rgba(163,230,53,0.4)]">
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                </div>
                <h2 className="text-4xl font-black tracking-tighter uppercase italic">Operations AI</h2>
                <p className="text-white/40 text-sm max-w-sm mx-auto font-medium">Size tracking, stock movement, and customer CRM—all through simple text.</p>
            </div>

            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-lime-400 to-emerald-500 rounded-[40px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative">
                    <textarea
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        placeholder='e.g., "Sold 2 Medium Tees at Store A to Rahul (98110XXXXX) for ₹2598."'
                        className="w-full h-56 glass p-8 rounded-[40px] border-white/10 focus:border-lime-400 focus:outline-none transition-all placeholder:text-white/10 text-xl font-bold italic resize-none"
                    />
                    <button
                        disabled={isAiProcessing || !aiInput.trim()}
                        onClick={handleAiAction}
                        className={`absolute bottom-8 right-8 bg-lime-400 text-black px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center gap-3 ${isAiProcessing || !aiInput.trim() ? 'opacity-20 cursor-not-allowed' : 'hover:scale-105 active:scale-95 shadow-2xl shadow-lime-400/40'}`}
                    >
                        {isAiProcessing ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-bolt"></i>}
                        Run Command
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { icon: 'fa-truck-fast', text: "Move 5 XL Hoodies from Home to Store B", color: 'text-blue-400' },
                    { icon: 'fa-money-bill-trend-up', text: "Lump sum 15000 added to Delivery Partner portal", color: 'text-purple-400' },
                    { icon: 'fa-user-tag', text: "Sold Medium Shadow Hoodie at Website to Jane", color: 'text-lime-400' },
                    { icon: 'fa-box-open', text: "New Stock: 50 Small Tees arrived at Home", color: 'text-orange-400' }
                ].map((tip, i) => (
                    <button
                        key={i}
                        onClick={() => setAiInput(tip.text)}
                        className="glass p-5 rounded-[25px] border-white/5 hover:border-lime-400/20 text-left flex items-start gap-4 group transition-all"
                    >
                        <i className={`fa-solid ${tip.icon} mt-1 ${tip.color} group-hover:scale-110 transition-transform`}></i>
                        <p className="text-xs font-black uppercase tracking-wider text-white/40 leading-relaxed group-hover:text-white transition-colors">{tip.text}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AIConsoleView;
