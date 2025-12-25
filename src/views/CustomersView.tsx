
import React from 'react';
import { useStore } from '../context/StoreContext';

const CustomersView: React.FC = () => {
    const { customers } = useStore();

    return (
        <div className="space-y-8 animate-fadeIn">
            <h2 className="text-3xl font-black uppercase italic italic tracking-tighter">Broken Alley Fam</h2>
            {customers.length === 0 ? (
                <div className="text-center py-20 opacity-30">
                    <i className="fa-solid fa-users text-4xl mb-4"></i>
                    <p className="uppercase font-black tracking-widest">No customers recorded yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {customers.map(c => (
                        <div key={c.id} className="glass p-8 rounded-[40px] border-white/5 group hover:border-lime-400/30 transition-all">
                            <div className="flex items-center gap-6 mb-6">
                                <div className="w-16 h-16 rounded-[25px] bg-lime-400 text-black flex items-center justify-center font-black text-2xl italic shadow-xl shadow-lime-400/20">
                                    {c.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-black uppercase text-xl italic leading-none">{c.name}</h3>
                                    <p className="text-xs font-bold text-white/30 mt-1">{c.phone}</p>
                                </div>
                            </div>
                            <div className="space-y-4 pt-6 border-t border-white/5">
                                <div className="flex justify-between items-center text-[10px] uppercase font-black text-white/40 tracking-[0.2em]">
                                    <span>Lifetime Value</span>
                                    <span className="text-lime-400 text-sm">₹{c.totalSpent.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] uppercase font-black text-white/40 tracking-[0.2em]">
                                    <span>Loyalty Since</span>
                                    <span className="text-white/60">{new Date(c.lastOrderDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomersView;
