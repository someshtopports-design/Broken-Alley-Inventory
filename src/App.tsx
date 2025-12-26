
import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import Layout from './components/Layout';
import ManualModals from './components/ManualModals';
import DashboardView from './views/DashboardView';
import InventoryView from './views/InventoryView';
import SalesView from './views/SalesView';
import ExpensesView from './views/ExpensesView';
import CustomersView from './views/CustomersView';
import AIConsoleView from './views/AIConsoleView';
import DateRangePicker from './components/DateRangePicker';
import { View, Product } from './types';

const Main = () => {
    const [activeView, setActiveView] = useState<View>('Dashboard');
    const [showModal, setShowModal] = useState<'product' | 'transfer' | 'expense' | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });

    const renderContent = () => {
        switch (activeView) {
            case 'Dashboard': return <DashboardView setView={setActiveView} dateRange={dateRange} />;
            case 'Inventory': return <InventoryView setShowModal={setShowModal} setEditingProduct={setEditingProduct} />;
            case 'Sales': return <SalesView dateRange={dateRange} />;
            case 'Expenses': return <ExpensesView setShowModal={setShowModal} dateRange={dateRange} />;
            case 'Customers': return <CustomersView />;
            case 'AIConsole': return <AIConsoleView />;
            default: return <DashboardView setView={setActiveView} dateRange={dateRange} />;
        }
    };

    return (
        <Layout activeView={activeView} setView={setActiveView}>
            {(activeView === 'Dashboard' || activeView === 'Sales' || activeView === 'Expenses') && (
                <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
            )}
            {renderContent()}
            <ManualModals activeModal={showModal} onClose={() => { setShowModal(null); setEditingProduct(null); }} editingProduct={editingProduct} />
        </Layout>
    );
};

const App: React.FC = () => {
    return (
        <StoreProvider>
            <Main />
        </StoreProvider>
    );
};

export default App;
