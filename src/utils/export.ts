import { Sale, Expense } from '../types';

export const exportSalesToCSV = (sales: Sale[]) => {
    const headers = ['Date', 'Invoice ID', 'Customer Name', 'Type', 'Product', 'Size', 'Qty', 'Total (INR)', 'Channel', 'Status'];
    const rows = sales.map(s => [
        new Date(s.date).toLocaleDateString(),
        s.id,
        s.customerName || 'N/A',
        s.customerType || 'Customer',
        s.productName,
        s.size,
        s.quantity,
        s.totalAmount,
        s.channel || 'Website',
        s.status || 'completed'
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
    const headers = ['Date', 'Category', 'Description', 'Amount (INR)'];
    const rows = expenses.map(e => [
        new Date(e.date).toLocaleDateString(),
        e.category,
        e.description,
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
