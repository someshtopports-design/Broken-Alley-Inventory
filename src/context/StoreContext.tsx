
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Customer, Sale, Expense, StockTransfer } from '../types';

interface StoreContextType {
    products: Product[];
    customers: Customer[];
    sales: Sale[];
    expenses: Expense[];
    recordSale: (data: any) => void;
    handleTransfer: (transfer: StockTransfer) => void;
    addExpense: (expense: Expense) => void;
    addProduct: (product: Product) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) throw new Error('useStore must be used within a StoreProvider');
    return context;
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    // Persistence Engine
    useEffect(() => {
        const savedData = localStorage.getItem('brokenAlley_data_v3');
        if (savedData) {
            const { p, c, s, e } = JSON.parse(savedData);
            setProducts(p || []); setCustomers(c || []); setSales(s || []); setExpenses(e || []);
        } else {
            // Initial Data seeding if empty
            setProducts([
                {
                    id: '1', sku: 'BA-TEE-01', name: 'Broken Alley Logo Tee', costPrice: 400, salePrice: 1299,
                    variants: [
                        { size: 'S', stockHome: 20, stockStoreA: 5, stockStoreB: 2 },
                        { size: 'M', stockHome: 30, stockStoreA: 10, stockStoreB: 5 },
                        { size: 'L', stockHome: 25, stockStoreA: 5, stockStoreB: 8 },
                        { size: 'XL', stockHome: 15, stockStoreA: 0, stockStoreB: 0 }
                    ],
                    category: 'T-Shirts'
                },
                {
                    id: '2', sku: 'BA-HOOD-02', name: 'Shadow Realm Hoodie', costPrice: 900, salePrice: 2899,
                    variants: [
                        { size: 'M', stockHome: 10, stockStoreA: 2, stockStoreB: 2 },
                        { size: 'L', stockHome: 15, stockStoreA: 5, stockStoreB: 3 },
                        { size: 'XL', stockHome: 10, stockStoreA: 3, stockStoreB: 0 }
                    ],
                    category: 'Outerwear'
                }
            ]);
        }
    }, []);

    useEffect(() => {
        if (products.length > 0) { // Only save if data exists to avoid wiping on first render race condition
            localStorage.setItem('brokenAlley_data_v3', JSON.stringify({ p: products, c: customers, s: sales, e: expenses }));
        }
    }, [products, customers, sales, expenses]);

    const handleTransfer = (transfer: StockTransfer) => {
        setProducts(prev => prev.map(p => {
            if (p.id !== transfer.productId) return p;
            return {
                ...p,
                variants: p.variants.map(v => {
                    if (v.size.toLowerCase() !== transfer.size.toLowerCase()) return v;
                    const nextV = { ...v };
                    const fromKey = transfer.from === 'Home' ? 'stockHome' : transfer.from === 'Store A' ? 'stockStoreA' : 'stockStoreB';
                    const toKey = transfer.to === 'Home' ? 'stockHome' : transfer.to === 'Store A' ? 'stockStoreA' : 'stockStoreB';

                    if (nextV[fromKey] >= transfer.quantity) {
                        nextV[fromKey] = Math.max(0, nextV[fromKey] - transfer.quantity); // Double safety
                        nextV[toKey] += transfer.quantity;
                    }
                    return nextV;
                })
            };
        }));
    };

    const recordSale = (data: any) => {
        const product = products.find(p => p.name.toLowerCase().includes(data.itemName?.toLowerCase() || '')) || products[0];
        const size = data.size?.toUpperCase() || product.variants[0].size;

        // 1. Update Customer
        let customer = customers.find(c => c.phone === data.customerPhone || (data.customerName && c.name === data.customerName));
        if (!customer && data.customerName) {
            customer = {
                id: Date.now().toString(),
                name: data.customerName,
                phone: data.customerPhone || 'N/A',
                address: data.customerAddress || 'N/A',
                totalSpent: 0,
                lastOrderDate: new Date().toISOString()
            };
            setCustomers(prev => [...prev, customer!]);
        }

        // 2. Create Sale
        const newSale: Sale = {
            id: Date.now().toString(),
            productId: product.id,
            productName: product.name,
            size,
            customerId: customer?.id || 'walk-in',
            customerName: customer?.name || 'Walk-in Customer',
            channel: (data.channel || 'Website') as Sale['channel'],
            quantity: data.quantity || 1,
            totalAmount: data.amount || (product.salePrice * (data.quantity || 1)),
            date: new Date().toISOString()
        };

        setSales(prev => [newSale, ...prev]);

        // 3. Update Inventory
        setProducts(prev => prev.map(p => {
            if (p.id !== product.id) return p;
            return {
                ...p,
                variants: p.variants.map(v => {
                    if (v.size.toLowerCase() !== size.toLowerCase()) return v;
                    const channelKey = newSale.channel === 'Store A' ? 'stockStoreA' : newSale.channel === 'Store B' ? 'stockStoreB' : 'stockHome';
                    return { ...v, [channelKey]: Math.max(0, v[channelKey] - newSale.quantity) };
                })
            };
        }));

        // 4. Update Customer LTV
        if (customer) {
            setCustomers(prev => prev.map(c => c.id === customer!.id ? { ...c, totalSpent: c.totalSpent + newSale.totalAmount, lastOrderDate: newSale.date } : c));
        }
    };

    const addExpense = (newEx: Expense) => {
        setExpenses(prev => [newEx, ...prev]);
    };

    const addProduct = (prod: Product) => {
        setProducts(prev => [...prev, prod]);
    };

    return (
        <StoreContext.Provider value={{ products, customers, sales, expenses, recordSale, handleTransfer, addExpense, addProduct }}>
            {children}
        </StoreContext.Provider>
    );
};
