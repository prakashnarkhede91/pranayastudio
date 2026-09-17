import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useData, MEASURE_FIELDS } from '../data/store.jsx';
import StatusPill from '../components/StatusPill.jsx';
import EmptyState from '../components/EmptyState.jsx';
import WhatsAppButton from '../components/WhatsAppButton.jsx';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customers, orders, deleteCustomer, settings } = useData();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const customer = customers.find((c) => c.id === id);
  const customerOrders = orders
    .filter((o) => o.customerId === id)
    .sort((a, b) => b.createdAt - a.createdAt);

  if (!customer) {
    return (
      <EmptyState
        title="Client profile not found"
        body="This profile may have been deleted."
        actionLabel="Back to directory"
        onAction={() => navigate('/customers')}
      />
    );
  }

  const takenMeasurements = MEASURE_FIELDS.filter((f) => customer.measurements?.[f.key]);

  let measurementSummaryText = `✨ *${settings.studioName || 'Pranaya Design Studio'}* ✨\n`;
  measurementSummaryText += `*Measurement Profile for ${customer.name}*\n-----------------------------\n`;
  if (takenMeasurements.length === 0) {
    measurementSummaryText += `No measurements recorded yet.\n`;
  } else {
    takenMeasurements.forEach((f) => {
      measurementSummaryText += `• ${f.label}: ${customer.measurements[f.key]} ${f.unit}\n`;
    });
  }
  if (customer.notes) {
    measurementSummaryText += `\n*Fit Notes:* ${customer.notes}\n`;
  }
  measurementSummaryText += `-----------------------------\nThank you! 💖`;

  return (
    <div className="space-y-4">
      <Link to="/customers" className="back-link font-semibold text-teal-600 dark:text-teal-400">
        ← Back to clients
      </Link>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-500 text-white font-bold font-display text-xl flex items-center justify-center shrink-0 shadow-md">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
              {customer.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              📞 {customer.phone || 'No phone'}
              {customer.address ? ` · 📍 ${customer.address}` : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            to={`/customers/${customer.id}/edit`}
            className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
          >
            ✏️ Edit Profile
          </Link>
          <Link
            to={`/orders/new?customer=${customer.id}`}
            className="btn btn-primary px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm"
          >
            + New Order
          </Link>
          {customer.phone && (
            <WhatsAppButton
              phone={customer.phone}
              message={measurementSummaryText}
              label="Share Measurements"
              className="py-1.5 px-3 rounded-xl text-xs"
            />
          )}
        </div>
      </div>

      {/* Saved Master Measurements */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-bold font-display text-sm text-slate-900 dark:text-slate-100">
            Master Saved Measurements
          </h2>
          <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-semibold">
            {takenMeasurements.length} fields
          </span>
        </div>

        {takenMeasurements.length === 0 ? (
          <EmptyState
            title="No measurements recorded"
            body="Click 'Edit Profile' to record bust, waist, shoulder, sleeve, or outfit lengths."
            actionLabel="Record Measurements"
            onAction={() => navigate(`/customers/${customer.id}/edit`)}
          />
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {takenMeasurements.map((f) => (
              <div key={f.key} className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <div className="text-base font-bold font-display text-slate-900 dark:text-slate-100">
                  {customer.measurements[f.key]}
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

      {customer.notes && (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <h2 className="font-bold font-display text-sm text-slate-900 dark:text-slate-100">
            Fitting & Style Preferences
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            {customer.notes}
          </p>
        </div>
      )}

      {/* Client Order History */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <h2 className="font-bold font-display text-base text-slate-900 dark:text-slate-100">
            Order History
          </h2>
          <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full font-semibold">
            {customerOrders.length}
          </span>
        </div>

        {customerOrders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            body="Take their first custom order to track design progress and payments."
            actionLabel="Take an Order"
            onAction={() => navigate(`/orders/new?customer=${customer.id}`)}
          />
        ) : (
          customerOrders.map((o) => (
            <Link
              to={`/orders/${o.id}`}
              key={o.id}
              className="block bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold font-display text-base text-slate-900 dark:text-slate-100">
                    {o.garment}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {o.dueDate
                      ? `Due ${new Date(o.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                      : 'No due date'}{' '}
                    · ₹{Number(o.price || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <StatusPill status={o.status} />
              </div>
            </Link>
          ))
        )}
      </div>

      {!confirmDelete ? (
        <button
          className="text-xs text-rose-600 dark:text-rose-400 font-medium hover:underline pt-2"
          onClick={() => setConfirmDelete(true)}
        >
          🗑️ Remove this client profile
        </button>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-800 rounded-2xl p-4 space-y-3">
          <p className="text-xs text-slate-800 dark:text-slate-200">
            Are you sure you want to remove <strong>{customer.name}</strong>? This will also remove their {customerOrders.length} order records.
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
                deleteCustomer(customer.id);
                navigate('/customers');
              }}
            >
              Yes, Remove Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
