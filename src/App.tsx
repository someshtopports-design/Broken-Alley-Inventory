
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
import { View } from './types';

const Main = () => {
    const [activeView, setActiveView] = useState<View>('Dashboard');
    const [showModal, setShowModal] = useState<'product' | 'transfer' | 'expense' | null>(null);

    const renderContent = () => {
        switch (activeView) {
            case 'Dashboard': return <DashboardView setView={setActiveView} />;
            case 'Inventory': return <InventoryView setShowModal={setShowModal} />;
            case 'Sales': return <SalesView />;
            case 'Expenses': return <ExpensesView setShowModal={setShowModal} />;
            case 'Customers': return <CustomersView />;
            case 'AIConsole': return <AIConsoleView />;
            default: return <DashboardView setView={setActiveView} />;
        }
    };

    return (
        <Layout activeView={activeView} setView={setActiveView}>
            {renderContent()}
            <ManualModals activeModal={showModal} onClose={() => setShowModal(null)} />
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
