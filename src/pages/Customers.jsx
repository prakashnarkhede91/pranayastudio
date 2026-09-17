import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../data/store.jsx';
import EmptyState from '../components/EmptyState.jsx';
import WhatsAppButton from '../components/WhatsAppButton.jsx';

export default function Customers() {
  const { customers, orders } = useData();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = !term
      ? customers
      : customers.filter(
          (c) => c.name?.toLowerCase().includes(term) || c.phone?.toLowerCase().includes(term)
        );
    return [...list].sort((a, b) => b.createdAt - a.createdAt);
  }, [customers, q]);

  const orderCount = (id) => orders.filter((o) => o.customerId === id).length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">
            Client Directory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {customers.length} client{customers.length === 1 ? '' : 's'} registered
          </p>
        </div>
        <Link
          to="/customers/new"
          className="btn btn-primary px-4 py-2 rounded-xl text-xs font-bold shadow-md"
        >
          + Add Client
        </Link>
      </div>

      {customers.length > 0 && (
        <div className="relative">
          <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
          <input
            placeholder="Search by client name or phone number..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
          />
        </div>
      )}

      {customers.length === 0 ? (
        <EmptyState
          title="No clients added yet"
          body="Save your custom clients to manage their exact measurements and order history in one organized place."
          actionLabel="Add First Client"
          onAction={() => (window.location.hash = '#/customers/new')}
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="No matching clients" body="Try searching with a different name or phone number." />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-3">
                <Link to={`/customers/${c.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-500 text-white font-bold font-display text-base flex items-center justify-center shrink-0 shadow-sm">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold font-display text-base text-slate-900 dark:text-slate-100 truncate">
                      {c.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      📞 {c.phone || 'No phone'} · 📦 {orderCount(c.id)} order{orderCount(c.id) === 1 ? '' : 's'}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-1.5 shrink-0">
                  {c.phone && (
                    <WhatsAppButton
                      phone={c.phone}
                      message={`Hello ${c.name}, greetings from Pranaya Design Studio! ✨`}
                      label=""
                      className="p-2 rounded-xl"
                    />
                  )}
                  <Link
                    to={`/customers/${c.id}`}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
