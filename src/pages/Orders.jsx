import React, { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useData, ORDER_STAGES } from '../data/store.jsx';
import StatusPill from '../components/StatusPill.jsx';
import EmptyState from '../components/EmptyState.jsx';

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = (new Date(dateStr) - new Date().setHours(0, 0, 0, 0)) / 86400000;
  return Math.round(diff);
}

export default function Orders() {
  const { orders, customers } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const stageQuery = searchParams.get('stage') || 'All';

  const [filter, setFilter] = useState(stageQuery);
  const [q, setQ] = useState('');

  useEffect(() => {
    if (stageQuery !== filter) {
      setFilter(stageQuery);
    }
  }, [stageQuery]);

  const customerName = (cid) => customers.find((c) => c.id === cid)?.name || 'Unknown client';

  const filtered = useMemo(() => {
    let list = filter === 'All' ? orders : orders.filter((o) => o.status === filter);

    if (q.trim()) {
      const term = q.trim().toLowerCase();
      list = list.filter((o) => {
        const cName = customerName(o.customerId).toLowerCase();
        const gName = o.garment.toLowerCase();
        return cName.includes(term) || gName.includes(term);
      });
    }

    return [...list].sort(
      (a, b) => new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31')
    );
  }, [orders, filter, q, customers]);

  const handleStageSelect = (stage) => {
    setFilter(stage);
    if (stage === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ stage });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">
            Order Book
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {orders.length} custom order{orders.length === 1 ? '' : 's'} recorded
          </p>
        </div>
        <Link
          to="/orders/new"
          className="btn btn-primary px-4 py-2 rounded-xl text-xs font-bold shadow-md"
        >
          + Take Order
        </Link>
      </div>

      {orders.length > 0 && (
        <div className="space-y-3">
          <div className="relative">
            <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
            <input
              placeholder="Search by client or garment..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['All', ...ORDER_STAGES].map((s) => (
              <span
                key={s}
                className={`cursor-pointer text-xs font-medium px-3 py-1.5 rounded-xl transition-all ${
                  filter === s
                    ? 'bg-teal-600 text-white font-bold shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
                onClick={() => handleStageSelect(s)}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <EmptyState
          title="No orders recorded yet"
          body="Start taking custom orders — choose a client, garment, price, and due date."
          actionLabel="Take First Order"
          onAction={() => (window.location.hash = '#/orders/new')}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={`No ${filter === 'All' ? '' : filter} orders match`}
          body="Try adjusting your filter or search query."
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((o) => {
            const price = Number(o.price || 0);
            const advance = Number(o.advance || 0);
            const balance = price - advance;
            const d = daysUntil(o.dueDate);
            const isOverdue = d !== null && d < 0 && o.status !== 'Delivered';

            return (
              <Link
                to={`/orders/${o.id}`}
                key={o.id}
                className="block bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold font-display text-base text-slate-900 dark:text-slate-100">
                        {o.garment}
                      </h3>
                      {isOverdue && (
                        <span className="text-[10px] font-bold text-white bg-rose-600 px-1.5 py-0.5 rounded">
                          OVERDUE
                        </span>
                      )}
                      {o.measurementsMode === 'custom' && (
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-100 dark:bg-teal-950 dark:text-teal-300 px-1.5 py-0.5 rounded">
                          CUSTOM FIT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      👤 <strong>{customerName(o.customerId)}</strong>
                      {o.dueDate
                        ? ` · Due ${new Date(o.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                        : ''}
                    </p>
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 font-medium">
                      Price: ₹{price.toLocaleString('en-IN')}{' '}
                      {balance > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">
                          (Bal: ₹{balance.toLocaleString('en-IN')})
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          (Paid)
                        </span>
                      )}
                    </div>
                  </div>
                  <StatusPill status={o.status} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
