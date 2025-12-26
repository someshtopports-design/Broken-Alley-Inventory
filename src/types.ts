
export interface ProductVariant {
    size: string;
    stockBrokenAlley: number; // Main Hub
    stockStreetJunkies: number;
    stockCC: number;
    uniqueCode: string;
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
    type: 'Customer' | 'Actor' | 'Influencer'; // Added
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
    channel: 'Website' | 'BrokenAlley' | 'StreetJunkies' | 'CC';
    quantity: number;
    totalAmount: number;
    date: string;
    status: 'completed' | 'rto'; // Added
    customerType: 'Customer' | 'Actor' | 'Influencer'; // Added snapshot
    customerPhone?: string;
    customerAddress?: string;
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
    from: 'BrokenAlley' | 'StreetJunkies' | 'CC';
    to: 'BrokenAlley' | 'StreetJunkies' | 'CC';
    quantity: number;
}
