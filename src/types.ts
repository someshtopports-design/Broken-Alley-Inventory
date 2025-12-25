
export interface ProductVariant {
    size: string;
    stockHome: number;
    stockBrokenAlley: number;
    stockCC: number;
    uniqueCode: string; // SKU/UUID for QR scanning
}

export interface StoreConfig {
    name: string;
    contacts: { name: string; phone: string }[];
}

export interface Product {
    id: string;
    sku?: string; // Kept for legacy, optional
    name: string;
    costPrice: number;
    salePrice: number;
    variants: ProductVariant[];
    category: string;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    address: string;
    totalSpent: number;
    lastOrderDate: string;
}

export interface Sale {
    id: string;
    productId: string;
    productName: string;
    size: string;
    customerId: string;
    customerName: string;
    channel: 'Website' | 'BrokenAlley' | 'CC';
    quantity: number;
    totalAmount: number;
    date: string;
}

export interface Expense {
    id: string;
    category: 'Samples' | 'Marketing' | 'Delivery' | 'Travel' | 'Production' | 'Manufacturing' | 'Other';
    amount: number;
    description: string;
    date: string;
}

export type View = 'Dashboard' | 'Inventory' | 'Sales' | 'Expenses' | 'Customers' | 'AIConsole' | 'Settings';

export interface StockTransfer {
    productId: string;
    size: string;
    from: 'Home' | 'BrokenAlley' | 'CC';
    to: 'Home' | 'BrokenAlley' | 'CC';
    quantity: number;
}
