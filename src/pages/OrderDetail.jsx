import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useData, MEASURE_FIELDS } from '../data/store.jsx';
import StatusTape from '../components/StatusTape.jsx';
import EmptyState from '../components/EmptyState.jsx';
import WhatsAppButton from '../components/WhatsAppButton.jsx';
import ReceiptModal from '../components/ReceiptModal.jsx';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, customers, updateOrder, markOrderPaid, deleteOrder, settings } = useData();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <EmptyState
        title="Order not found"
        body="This order record may have been removed."
        actionLabel="Back to orders"
        onAction={() => navigate('/orders')}
      />
    );
  }

  const customer = customers.find((c) => c.id === order.customerId);
  const price = Number(order.price || 0);
  const advance = Number(order.advance || 0);
  const balance = price - advance;

  const measurementsSource = order.measurementsMode === 'custom' ? order.orderMeasurements : (customer?.measurements || {});
  const activeMeasurements = MEASURE_FIELDS.filter((f) => measurementsSource?.[f.key]);

  const statusMsg = `Hi ${customer?.name || 'Customer'}, greetings from *${settings.studioName || 'Pranaya Design Studio'}*! ✨\n\nYour order for *${order.garment}* (Ref: #${order.id.slice(-6).toUpperCase()}) status is now updated to: *${order.status.toUpperCase()}*.\n\nTotal Price: ₹${price.toLocaleString('en-IN')}\nBalance Due: ₹${balance.toLocaleString('en-IN')}\n${order.dueDate ? `Estimated Due Date: ${new Date(order.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}\n` : ''}\nThank you! 💖`;

  return (
    <div className="space-y-4">
      <Link to="/orders" className="back-link font-semibold text-teal-600 dark:text-teal-400">
        ← Back to orders
      </Link>

      <div className="detail-header bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
              {order.garment}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Client:{' '}
              {customer ? (
                <Link to={`/customers/${customer.id}`} className="font-bold text-teal-600 dark:text-teal-400 hover:underline">
                  {customer.name}
                </Link>
              ) : (
                'Unknown client'
              )}
              {order.dueDate
                ? ` · Due ${new Date(order.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                : ' · No due date'}
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg">
            #{order.id.slice(-6).toUpperCase()}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Link to={`/orders/${order.id}/edit`} className="btn btn-outline px-3.5 py-1.5 rounded-xl text-xs font-semibold border-slate-300 dark:border-slate-700">
            ✏️ Edit Order
          </Link>
          <button className="btn btn-outline px-3.5 py-1.5 rounded-xl text-xs font-semibold border-slate-300 dark:border-slate-700" onClick={() => setShowReceipt(true)}>
            📄 Digital Receipt
          </button>
          {customer?.phone && (
            <WhatsAppButton
              phone={customer.phone}
              message={statusMsg}
              label="Send WhatsApp"
              className="py-1.5 px-3 rounded-xl text-xs"
            />
          )}
        </div>
      </div>

      {/* Production Stage */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold font-display text-sm text-slate-900 dark:text-slate-100">
            Production Stage Progress
          </h2>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">Tap stage node to advance</span>
        </div>
        <StatusTape status={order.status} onSelect={(stage) => updateOrder(order.id, { status: stage })} />
      </div>

      {/* Order Specific Measurements */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📐</span>
            <h2 className="font-bold font-display text-sm text-slate-900 dark:text-slate-100">
              Garment Fitting Measurements
            </h2>
          </div>
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
              order.measurementsMode === 'custom'
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                : 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
            }`}
          >
            {order.measurementsMode === 'custom' ? '✏️ Custom Order Fit' : '📐 Profile Default'}
          </span>
        </div>

        {activeMeasurements.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            No specific measurements specified for this garment.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {activeMeasurements.map((f) => (
              <div key={f.key} className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <div className="text-sm font-bold font-display text-slate-900 dark:text-slate-100">
                  {measurementsSource[f.key]}
                  <span className="text-[10px] text-slate-400 font-normal"> {f.unit}</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                  {f.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Billing & Payment Status */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <h2 className="font-bold font-display text-sm text-slate-900 dark:text-slate-100">
          Payment & Billing Breakdown
        </h2>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="text-base font-bold font-display text-slate-900 dark:text-slate-100">
              ₹{price.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Total Price</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="text-base font-bold font-display text-slate-900 dark:text-slate-100">
              ₹{advance.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Advance Paid</div>
          </div>
          <div
            className={`p-3 rounded-xl border text-center ${
              balance > 0
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
            }`}
          >
            <div
              className={`text-base font-bold font-display ${
                balance > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              ₹{balance.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              {balance > 0 ? 'Balance Due' : '✓ Fully Paid'}
            </div>
          </div>
        </div>

        {balance > 0 && (
          <button
            className="w-full py-2.5 px-4 rounded-xl border border-teal-600 text-teal-700 dark:text-teal-300 font-semibold text-xs hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors"
            onClick={() => markOrderPaid(order.id)}
          >
            💳 Mark Full Payment Received (₹{balance.toLocaleString('en-IN')})
          </button>
        )}
      </div>

      {order.notes && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <h2 className="font-bold font-display text-sm text-slate-900 dark:text-slate-100">
            Fabric & Customization Notes
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            {order.notes}
          </p>
        </div>
      )}

      {!confirmDelete ? (
        <button
          className="text-xs text-rose-600 dark:text-rose-400 font-medium hover:underline pt-2"
          onClick={() => setConfirmDelete(true)}
        >
          🗑️ Remove this order
        </button>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-800 rounded-2xl p-4 space-y-3">
          <p className="text-xs text-slate-800 dark:text-slate-200">
            Are you sure you want to remove this <strong>{order.garment}</strong> order?
          </p>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white shadow-sm"
              onClick={() => {
                deleteOrder(order.id);
                navigate('/orders');
              }}
            >
              Yes, Remove Order
            </button>
          </div>
        </div>
      )}

      {showReceipt && (
        <ReceiptModal
          order={order}
          customer={customer}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}
