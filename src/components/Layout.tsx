import React, { useState } from 'react';
import { View } from '../types';

interface LayoutProps {
    children: React.ReactNode;
    currentView: View;
    setView: (view: View) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
    const navItems: { view: View; icon: string; label: string }[] = [
        { view: 'Dashboard', icon: 'fa-chart-pie', label: 'Overview' },
        { view: 'Sales', icon: 'fa-cart-shopping', label: 'Sales' },
        { view: 'Inventory', icon: 'fa-boxes-stacked', label: 'Inventory' },
        { view: 'Expenses', icon: 'fa-wallet', label: 'Expenses' },
        { view: 'Customers', icon: 'fa-users', label: 'Customers' },
        { view: 'AIConsole', icon: 'fa-wand-magic-sparkles', label: 'AI Console' },
    ];

    return (
        <div className="flex min-h-screen bg-black text-white font-sans selection:bg-[#0a84ff] selection:text-white">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-[#1c1c1e] fixed h-full z-50">
                <div className="p-8">
                    <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
                        <i className="fa-solid fa-layer-group text-[#0a84ff]"></i>
                        BrokenAlley
                    </h1>
                    <p className="text-xs text-[#8e8e93] mt-1 font-medium tracking-wide">Operations OS</p>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.view}
                            onClick={() => setView(item.view)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[10px] text-sm font-medium transition-all duration-200 ${currentView === item.view
                                ? 'bg-[#0a84ff] text-white shadow-sm'
                                : 'text-[#8e8e93] hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <i className={`fa-solid ${item.icon} w-5 text-center ${currentView === item.view ? 'opacity-100' : 'opacity-70'}`}></i>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-[#2c2c2e] flex items-center justify-center text-xs font-bold text-[#8e8e93]">
                            BA
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">Admin User</p>
                            <p className="text-xs text-[#8e8e93]">admin@brokenalley.com</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 w-full z-50 bg-[#1c1c1e]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                    <i className="fa-solid fa-layer-group text-[#0a84ff]"></i>
                    BrokenAlley
                </h1>
            </div>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-6 lg:p-10 pb-32 lg:pb-10 pt-24 lg:pt-10 max-w-[1600px] mx-auto w-full">
                {children}
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="lg:hidden fixed bottom-6 left-6 right-6 bg-[#1c1c1e]/90 backdrop-blur-2xl border border-white/10 rounded-[20px] p-2 flex justify-between items-center shadow-2xl z-50">
                {navItems.slice(0, 5).map((item) => (
                    <button
                        key={item.view}
                        onClick={() => setView(item.view)}
                        className={`flex flex-col items-center justify-center w-14 h-14 rounded-[16px] transition-all duration-300 ${currentView === item.view ? 'bg-[#0a84ff] text-white shadow-lg shadow-[#0a84ff]/20 translate-y-[-10px]' : 'text-[#8e8e93]'
                            }`}
                    >
                        <i className={`fa-solid ${item.icon} text-lg mb-0.5`}></i>
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default Layout;
