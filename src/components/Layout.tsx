
import React from 'react';
import { View } from '../types';

interface LayoutProps {
    children: React.ReactNode;
    activeView: View;
    setView: (view: View) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setView }) => {
    const navItems = [
        { id: 'Dashboard', icon: 'fa-chart-line', label: 'Home' },
        { id: 'Inventory', icon: 'fa-box', label: 'Stock' },
        { id: 'Sales', icon: 'fa-shopping-cart', label: 'Sales' },
        { id: 'Expenses', icon: 'fa-wallet', label: 'Costs' },
        { id: 'Customers', icon: 'fa-users', label: 'CRM' },
        { id: 'AIConsole', icon: 'fa-wand-magic-sparkles', label: 'AI' }
    ];

    return (
        <div className="min-h-screen pb-24 lg:pb-0 lg:pl-64 flex flex-col text-white font-sans transition-all duration-300">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 glass border-r border-white/10 p-6 z-50">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-10 h-10 bg-cyan-400 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                        <i className="fa-solid fa-bolt text-black text-xl"></i>
                    </div>
                    <h1 className="font-bold text-xl tracking-tighter">BROKEN ALLEY</h1>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id as View)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === item.id
                                ? 'bg-cyan-400 text-black font-bold shadow-lg shadow-cyan-400/20'
                                : 'hover:bg-white/10 text-white/70'
                                }`}
                        >
                            <i className={`fa-solid ${item.icon} w-6`}></i>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto p-4 glass rounded-2xl border-cyan-400/20">
                    <p className="text-xs text-white/50 mb-1">Status</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                        <span className="text-sm font-medium">Syncing Real-time</span>
                    </div>
                </div>
            </aside>

            {/* Header - Mobile */}
            <header className="lg:hidden px-6 py-4 glass sticky top-0 z-40 flex items-center justify-between border-b border-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                        <i className="fa-solid fa-bolt text-black text-xs"></i>
                    </div>
                    <h1 className="font-black text-lg tracking-tighter italic">BROKEN ALLEY</h1>
                </div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 lg:p-10 w-full max-w-7xl mx-auto">
                {children}
            </main>

            {/* Bottom Nav - Mobile */}
            <nav className="lg:hidden fixed bottom-4 left-4 right-4 glass rounded-2xl border border-white/10 flex justify-between px-2 py-3 z-50 shadow-2xl backdrop-blur-2xl">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setView(item.id as View)}
                        className={`flex flex-col items-center justify-center gap-1 w-full transition-all ${activeView === item.id
                            ? 'text-cyan-400 scale-110'
                            : 'text-white/40 hover:text-white/60'
                            }`}
                    >
                        <i className={`fa-solid ${item.icon} text-lg ${activeView === item.id ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : ''}`}></i>
                        {activeView === item.id && (
                            <span className="text-[8px] font-black uppercase tracking-widest leading-none mt-1 animate-fadeIn">{item.label}</span>
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default Layout;
