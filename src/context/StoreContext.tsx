
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
    markRTO: (saleId: string) => void;
    deleteProduct: (id: string) => void;
    updateProduct: (product: Product) => void;
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
        const savedData = localStorage.getItem('brokenAlley_data_v6');
        if (savedData) {
            const { p, c, s, e } = JSON.parse(savedData);
            setProducts(p || []); setCustomers(c || []); setSales(s || []); setExpenses(e || []);
        } else {
            // Initial Data seeding if empty
            setProducts([
                {
                    id: '1', sku: 'BA-TEE-01', name: 'Broken Alley Logo Tee', costPrice: 400, salePrice: 1299,
                    variants: [
                        { size: 'S', stockBrokenAlley: 20, stockStreetJunkies: 5, stockCC: 2, uniqueCode: 'BA-TEE-01-S' },
                        { size: 'M', stockBrokenAlley: 30, stockStreetJunkies: 10, stockCC: 5, uniqueCode: 'BA-TEE-01-M' },
                        { size: 'L', stockBrokenAlley: 25, stockStreetJunkies: 5, stockCC: 8, uniqueCode: 'BA-TEE-01-L' },
                        { size: 'XL', stockBrokenAlley: 15, stockStreetJunkies: 0, stockCC: 0, uniqueCode: 'BA-TEE-01-XL' }
                    ],
                    category: 'T-Shirts'
                }
            ]);
        }
    }, []);

    useEffect(() => {
        if (products.length > 0) {
            localStorage.setItem('brokenAlley_data_v6', JSON.stringify({ p: products, c: customers, s: sales, e: expenses }));
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
                    const fromKey = transfer.from === 'BrokenAlley' ? 'stockBrokenAlley' : transfer.from === 'StreetJunkies' ? 'stockStreetJunkies' : 'stockCC';
                    const toKey = transfer.to === 'BrokenAlley' ? 'stockBrokenAlley' : transfer.to === 'StreetJunkies' ? 'stockStreetJunkies' : 'stockCC';

                    if (nextV[fromKey] >= transfer.quantity) {
                        nextV[fromKey] = Math.max(0, nextV[fromKey] - transfer.quantity);
                        nextV[toKey] += transfer.quantity;
                    }
                    return nextV;
                })
            };
        }));
    };

    const recordSale = (data: any) => {
        // Try precise match by uniqueCode first if available
        let product = data.uniqueCode ? products.find(p => p.variants.some(v => v.uniqueCode === data.uniqueCode)) : products.find(p => p.name.toLowerCase().includes(data.itemName?.toLowerCase() || ''));

        // Fallback or default
        if (!product) product = products[0];

        // Determine size: manual selection OR derived from uniqueCode
        let size = data.size?.toUpperCase();
        if (data.uniqueCode && product) {
            const variant = product.variants.find(v => v.uniqueCode === data.uniqueCode);
            if (variant) size = variant.size;
        }
        if (!size) size = product.variants[0].size;

        // 1. Update Customer
        let customer = customers.find(c => c.phone === data.customerPhone || (data.customerName && c.name === data.customerName));
        if (!customer && data.customerName) {
            customer = {
                id: Date.now().toString(),
                name: data.customerName,
                phone: data.customerPhone || 'N/A',
                address: data.customerAddress || 'N/A',
                type: data.customerType || 'Customer',
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
            date: new Date().toISOString(),
            status: 'completed',
            customerType: data.customerType || 'Customer'
        };

        setSales(prev => [newSale, ...prev]);

        // 3. Update Inventory
        setProducts(prev => prev.map(p => {
            if (p.id !== product!.id) return p;
            return {
                ...p,
                variants: p.variants.map(v => {
                    if (v.size.toLowerCase() !== size.toLowerCase()) return v;
                    // Deduct from appropriate channel location
                    const channelKey = newSale.channel === 'StreetJunkies' ? 'stockStreetJunkies' : newSale.channel === 'CC' ? 'stockCC' : 'stockBrokenAlley';
                    return { ...v, [channelKey]: Math.max(0, v[channelKey] - newSale.quantity) };
                })
            };
        }));

        // 4. Update Customer LTV
        if (customer) {
            setCustomers(prev => prev.map(c => c.id === customer!.id ? { ...c, totalSpent: c.totalSpent + newSale.totalAmount, lastOrderDate: newSale.date } : c));
        }
    };

    const markRTO = (saleId: string) => {
        const sale = sales.find(s => s.id === saleId);
        if (!sale || sale.status === 'rto') return;

        // 1. Mark Sale as RTO
        setSales(prev => prev.map(s => s.id === saleId ? { ...s, status: 'rto' } : s));

        // 2. Restock Inventory (Return to Source)
        setProducts(prev => prev.map(p => {
            if (p.id !== sale.productId) return p;
            return {
                ...p,
                variants: p.variants.map(v => {
                    if (v.size !== sale.size) return v;
                    const channelKey = sale.channel === 'StreetJunkies' ? 'stockStreetJunkies' : sale.channel === 'CC' ? 'stockCC' : 'stockBrokenAlley';
                    return { ...v, [channelKey]: v[channelKey] + sale.quantity };
                })
            };
        }));
    };

    const deleteProduct = (id: string) => {
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const updateProduct = (updated: Product) => {
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    };

    const addExpense = (newEx: Expense) => {
        setExpenses(prev => [newEx, ...prev]);
    };

    const addProduct = (prod: Product) => {
        setProducts(prev => [...prev, prod]);
    };

    return (
        <StoreContext.Provider value={{ products, customers, sales, expenses, recordSale, handleTransfer, addExpense, addProduct, markRTO, deleteProduct, updateProduct }}>
            {children}
        </StoreContext.Provider>
    );
};
