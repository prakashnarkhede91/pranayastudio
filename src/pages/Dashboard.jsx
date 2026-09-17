import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData, ORDER_STAGES } from '../data/store.jsx';
import StatusPill from '../components/StatusPill.jsx';
import EmptyState from '../components/EmptyState.jsx';

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = (new Date(dateStr) - new Date().setHours(0, 0, 0, 0)) / 86400000;
  return Math.round(diff);
}

export default function Dashboard() {
  const { customers, orders } = useData();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const active = orders.filter((o) => o.status !== 'Delivered');
    const ready = orders.filter((o) => o.status === 'Ready');
    const dueSoon = active.filter((o) => {
      const d = daysUntil(o.dueDate);
      return d !== null && d <= 3;
    });

    const totalValue = orders.reduce((sum, o) => sum + (Number(o.price) || 0), 0);
    const advancePaid = orders.reduce((sum, o) => sum + (Number(o.advance) || 0), 0);
    const pendingBalance = totalValue - advancePaid;

    const stageCounts = ORDER_STAGES.reduce((acc, stage) => {
      acc[stage] = orders.filter((o) => o.status === stage).length;
      return acc;
    }, {});

    return {
      customers: customers.length,
      active: active.length,
      ready: ready.length,
      dueSoon: dueSoon.length,
      totalValue,
      pendingBalance,
      stageCounts,
    };
  }, [customers, orders]);

  const upcoming = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'Delivered')
      .sort((a, b) => new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31'))
      .slice(0, 5);
  }, [orders]);

  const customerName = (id) => customers.find((c) => c.id === id)?.name || 'Unknown client';

  return (
    <div className="space-y-4">
      {/* Hero Financial Banner with Graphic Accent */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-5 text-white shadow-lg border border-slate-800">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />
        <div className="flex justify-between items-start relative z-10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
              Pending Collection Balance
            </span>
            <div className="text-3xl font-extrabold font-display my-1 text-white">
              ₹{stats.pendingBalance.toLocaleString('en-IN')}
            </div>
            <span className="text-xs text-slate-400">From active custom orders</span>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Order Value
            </span>
            <div className="text-lg font-bold text-emerald-400 mt-1">
              ₹{stats.totalValue.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
            {stats.active}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
            Active Orders
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <div className={`text-2xl font-bold font-display ${stats.dueSoon > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
            {stats.dueSoon}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
            Due Soon / Urgent
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <div className="text-2xl font-bold font-display text-teal-600 dark:text-teal-400">
            {stats.ready}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
            Ready For Pickup
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <div className="text-2xl font-bold font-display text-indigo-600 dark:text-indigo-400">
            {stats.customers}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
            Total Clients
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/orders/new"
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md hover:opacity-95 transition-opacity"
        >
          <span>✨</span> Take New Order
        </Link>
        <Link
          to="/customers/new"
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
        >
          <span>👤</span> Add New Client
        </Link>
      </div>

      {/* Order Stage Pipeline */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-2.5">
        <div className="flex justify-between items-center">
          <h2 className="font-bold font-display text-sm text-slate-900 dark:text-slate-100">
            Order Production Pipeline
          </h2>
          <span className="text-xs text-slate-400">Tap stage to filter</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {ORDER_STAGES.map((s) => (
            <button
              key={s}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-medium hover:border-teal-500 transition-colors"
              onClick={() => navigate(`/orders?stage=${s}`)}
            >
              <span>{s}</span>
              <span className="bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-[10px] px-1.5 py-0.5 rounded-md">
                {stats.stageCounts[s] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Deliveries */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <h2 className="font-bold font-display text-base text-slate-900 dark:text-slate-100">
            Active Rail & Deliveries
          </h2>
          <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full font-semibold">
            {upcoming.length} orders
          </span>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState
            title="No active orders"
            body="Orders you take in will line up here automatically by due date."
            actionLabel="Take a new order"
            onAction={() => navigate('/orders/new')}
          />
        ) : (
          upcoming.map((o) => {
            const d = daysUntil(o.dueDate);
            let when = 'No due date';
            let isOverdue = false;
            if (d !== null) {
              if (d < 0) {
                when = `${Math.abs(d)}d overdue`;
                isOverdue = true;
              } else if (d === 0) {
                when = '⚠️ Due today';
              } else {
                when = `Due in ${d} days`;
              }
            }
            return (
              <Link
                to={`/orders/${o.id}`}
                key={o.id}
                className="block bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-500" />
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold font-display text-base text-slate-900 dark:text-slate-100 group-hover:text-teal-600 transition-colors">
                      {o.garment}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <strong>{customerName(o.customerId)}</strong> ·{' '}
                      <span className={isOverdue ? 'font-bold text-rose-600 dark:text-rose-400' : ''}>
                        {when}
                      </span>
                    </p>
                  </div>
                  <StatusPill status={o.status} />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
