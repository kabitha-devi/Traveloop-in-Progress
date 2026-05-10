import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, CheckCircle, Clock, Printer } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { invoices } from '../data/invoices';
import { trips } from '../data/trips';
import useToast from '../hooks/useToast';

export default function InvoicePage() {
  const toast = useToast();
  const [localInvoices, setLocalInvoices] = useState(invoices);
  const [selectedInvoice, setSelectedInvoice] = useState(localInvoices[0]);
  const trip = trips.find(t => t.id === selectedInvoice.tripId);

  const handleMarkAsPaid = () => {
    setSelectedInvoice(prev => ({...prev, status: 'paid'}));
    setLocalInvoices(prev => prev.map(inv => inv.id === selectedInvoice.id ? { ...inv, status: 'paid' } : inv));
    toast.success('Marked as paid!');
  };

  const categoryTotals = {};
  selectedInvoice.items.forEach(item => {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
  });
  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name, value, color: { Hotel: '#6B2D6E', Travel: '#C084FC', Activity: '#4ADE80', Food: '#FACC15' }[name] || '#A89BB8'
  }));

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="section-title text-3xl mb-2">Invoice</h1>
        <p className="section-subtitle">Expense breakdown and billing</p>
      </motion.div>

      {/* Invoice Selector */}
      <div className="flex gap-2 mb-6 print:hidden">
        {localInvoices.map(inv => (
          <button key={inv.id} onClick={() => setSelectedInvoice(inv)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedInvoice.id === inv.id ? 'bg-primary text-white' : 'bg-white/5 text-text-secondary'}`}>
            {inv.id}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Invoice */}
        <div className="flex-1">
          {/* Header */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 mb-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-xl">{trip?.name || 'Trip'}</h2>
                <p className="text-text-secondary text-sm mt-1">Invoice ID: <span className="font-mono text-accent">{selectedInvoice.id}</span></p>
                <p className="text-text-secondary text-sm">Generated: <span className="font-mono">{selectedInvoice.generatedDate}</span></p>
              </div>
              <span className={`badge ${selectedInvoice.status === 'paid' ? 'badge-success' : 'badge-warning'} flex items-center gap-1`}>
                {selectedInvoice.status === 'paid' ? <CheckCircle size={12} /> : <Clock size={12} />}
                {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">Travelers</p>
              <div className="flex gap-2">{selectedInvoice.travelers.map(t => <span key={t} className="badge bg-white/5 text-text-primary text-xs">{t}</span>)}</div>
            </div>
          </motion.div>

          {/* Invoice Table */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Qty/Details</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase">Unit Cost</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item, i) => (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-text-secondary font-mono">{i + 1}</td>
                      <td className="px-4 py-3"><span className="badge bg-white/5 text-text-primary text-xs">{item.category}</span></td>
                      <td className="px-4 py-3 text-text-primary">{item.description}</td>
                      <td className="px-4 py-3 text-text-secondary font-mono">{item.qty}</td>
                      <td className="px-4 py-3 text-right font-mono">${item.unitCost.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-text-primary">${item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/10"><td colSpan={5} className="px-4 py-2 text-right text-text-secondary">Subtotal</td><td className="px-4 py-2 text-right font-mono">${selectedInvoice.subtotal.toLocaleString()}</td></tr>
                  <tr><td colSpan={5} className="px-4 py-2 text-right text-text-secondary">Tax (5%)</td><td className="px-4 py-2 text-right font-mono">${selectedInvoice.tax.toLocaleString()}</td></tr>
                  <tr><td colSpan={5} className="px-4 py-2 text-right text-text-secondary">Discount</td><td className="px-4 py-2 text-right font-mono text-success">-${selectedInvoice.discount.toLocaleString()}</td></tr>
                  <tr className="border-t border-white/10 bg-white/5"><td colSpan={5} className="px-4 py-3 text-right font-display font-bold text-lg">Grand Total</td><td className="px-4 py-3 text-right font-mono font-bold text-xl text-accent">${selectedInvoice.grandTotal.toLocaleString()}</td></tr>
                </tfoot>
              </table>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 print:hidden">
            <button onClick={() => toast.success('Invoice downloaded!')} className="btn-primary flex items-center gap-2 text-sm"><Download size={14} /> Download Invoice</button>
            <button onClick={() => { window.print(); toast.success('Exporting as PDF!'); }} className="btn-secondary flex items-center gap-2 text-sm"><FileText size={14} /> Export as PDF</button>
            <button onClick={handleMarkAsPaid}
              className="btn-secondary flex items-center gap-2 text-sm"><CheckCircle size={14} /> Mark as Paid</button>
          </div>
        </div>

        {/* Budget Mini Card */}
        <div className="lg:w-72">
          <div className="glass-card p-5 sticky top-20">
            <h3 className="font-display font-semibold mb-4">Budget Insights</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between"><span className="text-text-secondary text-sm">Total Budget</span><span className="font-mono font-bold">${(trip?.totalBudget || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary text-sm">Total Spent</span><span className="font-mono font-bold text-warning">${selectedInvoice.grandTotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary text-sm">Remaining</span><span className="font-mono font-bold text-success">${((trip?.totalBudget || 0) - selectedInvoice.grandTotal).toLocaleString()}</span></div>
            </div>
            {chartData.length > 0 && (
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={chartData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={3}>
                    {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie><Tooltip contentStyle={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#F5F0FF' }} /></PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="space-y-2 mt-3">
              {chartData.map(c => (
                <div key={c.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }}></div>
                  <span className="text-xs text-text-secondary flex-1">{c.name}</span>
                  <span className="text-xs font-mono">${c.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
