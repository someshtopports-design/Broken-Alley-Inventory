import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Customer, Sale, Expense, StockTransfer } from '../types';
import { db } from '../services/firebase';
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    deleteDoc,
    query,
    orderBy,
    setDoc
} from 'firebase/firestore';

interface StoreContextType {
    products: Product[];
    customers: Customer[];
    sales: Sale[];
    expenses: Expense[];
    recordSale: (data: any) => Promise<void>;
    handleTransfer: (transfer: StockTransfer) => Promise<void>;
    addExpense: (expense: Expense) => Promise<void>;
    addProduct: (product: Product) => Promise<void>;
    markRTO: (saleId: string) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    updateProduct: (product: Product) => Promise<void>;
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

    // Real-time Listeners
    useEffect(() => {
        try {
            const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
                setProducts(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Product)));
            });

            const unsubCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
                setCustomers(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Customer)));
            });

            const unsubSales = onSnapshot(query(collection(db, 'sales'), orderBy('date', 'desc')), (snapshot) => {
                setSales(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Sale)));
            });

            const unsubExpenses = onSnapshot(query(collection(db, 'expenses'), orderBy('date', 'desc')), (snapshot) => {
                setExpenses(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Expense)));
            });

            return () => {
                unsubProducts();
                unsubCustomers();
                unsubSales();
                unsubExpenses();
            };
        } catch (error) {
            console.error("Firebase connection failed:", error);
        }
    }, [db]);

    const handleTransfer = async (transfer: StockTransfer) => {
        const product = products.find(p => p.id === transfer.productId);
        if (!product) return;

        const updatedVariants = product.variants.map(v => {
            if (v.size.toLowerCase() !== transfer.size.toLowerCase()) return v;
            const nextV = { ...v };
            const fromKey = transfer.from === 'BrokenAlley' ? 'stockBrokenAlley' : transfer.from === 'StreetJunkies' ? 'stockStreetJunkies' : 'stockCC';
            const toKey = transfer.to === 'BrokenAlley' ? 'stockBrokenAlley' : transfer.to === 'StreetJunkies' ? 'stockStreetJunkies' : 'stockCC';

            if (nextV[fromKey] >= transfer.quantity) {
                nextV[fromKey] = Math.max(0, nextV[fromKey] - transfer.quantity);
                nextV[toKey] += transfer.quantity;
            }
            return nextV;
        });

        const productRef = doc(db, 'products', transfer.productId);
        await updateDoc(productRef, { variants: updatedVariants });
    };

    const recordSale = async (data: any) => {
        let product = data.uniqueCode
            ? products.find(p => p.variants.some(v => v.uniqueCode === data.uniqueCode))
            : products.find(p => p.name.toLowerCase().includes(data.itemName?.toLowerCase() || ''));

        if (!product && products.length > 0) product = products[0];
        if (!product) return;

        let size = data.size?.toUpperCase();
        if (data.uniqueCode) {
            const variant = product.variants.find(v => v.uniqueCode === data.uniqueCode);
            if (variant) size = variant.size;
        }
        if (!size && product.variants.length > 0) size = product.variants[0].size;

        let customerId = 'walk-in';
        let customerName = 'Walk-in Customer';
        let customer = customers.find(c => c.phone === data.customerPhone || (data.customerName && c.name === data.customerName));

        if (data.customerName) {
            if (customer) {
                customerId = customer.id;
                customerName = customer.name;
            } else {
                const newCustomer: any = {
                    name: data.customerName,
                    phone: data.customerPhone || 'N/A',
                    address: data.customerAddress || 'N/A',
                    type: data.customerType || 'Customer',
                    totalSpent: 0,
                    lastOrderDate: new Date().toISOString()
                };
                const docRef = await addDoc(collection(db, 'customers'), newCustomer);
                customerId = docRef.id;
                customerName = data.customerName;
            }
        }

        const saleData: any = {
            productId: product.id,
            productName: product.name,
            size,
            customerId,
            customerName,
            customerPhone: data.customerPhone || (customer ? customer.phone : 'N/A'),
            customerAddress: data.customerAddress || (customer ? customer.address : 'N/A'),
            channel: data.channel || 'Website',
            quantity: data.quantity || 1,
            totalAmount: data.amount || (product.salePrice * (data.quantity || 1)),
            date: new Date().toISOString(),
            status: 'completed',
            customerType: data.customerType || 'Customer'
        };


        await addDoc(collection(db, 'sales'), saleData);

        const updatedVariants = product.variants.map(v => {
            if (v.size.toLowerCase() !== size.toLowerCase()) return v;
            const channelKey = saleData.channel === 'StreetJunkies' ? 'stockStreetJunkies' : saleData.channel === 'CC' ? 'stockCC' : 'stockBrokenAlley';
            return { ...v, [channelKey]: Math.max(0, v[channelKey] - saleData.quantity) };
        });

        const productRef = doc(db, 'products', product.id);
        await updateDoc(productRef, { variants: updatedVariants });

        if (customerId !== 'walk-in') {
            const customerRef = doc(db, 'customers', customerId);
            const currentSpent = customer ? customer.totalSpent : 0;
            await updateDoc(customerRef, {
                totalSpent: currentSpent + saleData.totalAmount,
                lastOrderDate: saleData.date
            });
        }
    };

    const markRTO = async (saleId: string) => {
        const sale = sales.find(s => s.id === saleId);
        if (!sale || sale.status === 'rto') return;

        const saleRef = doc(db, 'sales', saleId);
        await updateDoc(saleRef, { status: 'rto' });

        const product = products.find(p => p.id === sale.productId);
        if (product) {
            const updatedVariants = product.variants.map(v => {
                if (v.size !== sale.size) return v;
                const channelKey = sale.channel === 'StreetJunkies' ? 'stockStreetJunkies' : sale.channel === 'CC' ? 'stockCC' : 'stockBrokenAlley';
                return { ...v, [channelKey]: v[channelKey] + sale.quantity };
            });
            const productRef = doc(db, 'products', product.id);
            await updateDoc(productRef, { variants: updatedVariants });
        }
    };

    const deleteProduct = async (id: string) => {
        await deleteDoc(doc(db, 'products', id));
    };

    const updateProduct = async (updated: Product) => {
        const { id, ...data } = updated;
        await updateDoc(doc(db, 'products', id), data as any);
    };

    const addExpense = async (newEx: Expense) => {
        const { id, ...data } = newEx;
        await addDoc(collection(db, 'expenses'), data);
    };

    const addProduct = async (prod: Product) => {
        const { id, ...data } = prod;
        await addDoc(collection(db, 'products'), data);
    };

    return (
        <StoreContext.Provider value={{ products, customers, sales, expenses, recordSale, handleTransfer, addExpense, addProduct, markRTO, deleteProduct, updateProduct }}>
            {children}
        </StoreContext.Provider>
    );
};
