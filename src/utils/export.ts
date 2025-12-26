import { Sale, Expense } from '../types';

export const exportSalesToCSV = (sales: Sale[]) => {
    // Format: Customer Type, Customer Name, Number, Address, Product name, Size, Number of item, Price
    const headers = ['Customer Type', 'Customer Name', 'Number', 'Address', 'Product Name', 'Size', 'Qty', 'Price (INR)'];
    const rows = sales.map(s => [
        s.customerType || 'Customer',
        s.customerName || 'Walk-in',
        s.customerPhone === 'N/A' || !s.customerPhone ? 'null' : s.customerPhone,
        s.customerAddress === 'N/A' || !s.customerAddress ? 'null' : s.customerAddress,
        s.productName,
        s.size,
        s.quantity,
        s.totalAmount
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
        + headers.join(",") + "\n"
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_ba_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportExpensesToCSV = (expenses: Expense[]) => {
    // Improved Format: Date first for timeline view, then Category for grouping
    const headers = ['Date', 'Category', 'Description', 'Amount (INR)'];

    // Sort logic: Date descending
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const rows = sortedExpenses.map(e => [
        new Date(e.date).toLocaleDateString(),
        e.category,
        `"${e.description}"`, // Quote description to handle commas
        e.amount
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
        + headers.join(",") + "\n"
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `expenses_ba_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
