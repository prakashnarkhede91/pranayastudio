import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useData, GARMENT_TYPES, MEASURE_FIELDS } from '../data/store.jsx';

export default function OrderForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { customers, orders, addOrder, updateOrder, updateCustomer } = useData();
  const existing = id ? orders.find((o) => o.id === id) : null;

  const preselected = searchParams.get('customer') || '';

  const [customerId, setCustomerId] = useState(existing?.customerId || preselected);
  const [garment, setGarment] = useState(existing?.garment || GARMENT_TYPES[0].name);
  const [dueDate, setDueDate] = useState(existing?.dueDate || '');
  const [price, setPrice] = useState(existing?.price ?? '');
  const [advance, setAdvance] = useState(existing?.advance ?? '');
  const [notes, setNotes] = useState(existing?.notes || '');
  
  // Measurements Mode state
  const [measurementsMode, setMeasurementsMode] = useState(existing?.measurementsMode || 'existing');
  const [orderMeasurements, setOrderMeasurements] = useState(existing?.orderMeasurements || {});
  const [syncToMaster, setSyncToMaster] = useState(false);
  const [error, setError] = useState('');

  const selectedCustomer = customers.find((c) => c.id === customerId);

  // When customer changes or mode switches to existing, sync default preview
  useEffect(() => {
    if (selectedCustomer && measurementsMode === 'existing') {
      setOrderMeasurements(selectedCustomer.measurements || {});
    }
  }, [customerId, measurementsMode, selectedCustomer]);

  const setM = (key, val) => {
    setOrderMeasurements((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerId) {
      setError('Please select a client for this order.');
      return;
    }

    const payload = {
      customerId,
      garment,
      dueDate,
      price: price === '' ? 0 : Number(price),
      advance: advance === '' ? 0 : Number(advance),
      notes: notes.trim(),
      measurementsMode,
      orderMeasurements: measurementsMode === 'custom' ? orderMeasurements : (selectedCustomer?.measurements || {}),
    };

    if (syncToMaster && selectedCustomer && measurementsMode === 'custom') {
      updateCustomer(selectedCustomer.id, {
        measurements: { ...selectedCustomer.measurements, ...orderMeasurements },
      });
    }

    if (existing) {
      updateOrder(existing.id, payload);
      navigate(`/orders/${existing.id}`);
    } else {
      const newId = addOrder(payload);
      navigate(`/orders/${newId}`);
    }
  };

  const activeMeasurementsCount = Object.keys(
    measurementsMode === 'custom' ? orderMeasurements : (selectedCustomer?.measurements || {})
  ).filter((k) => (measurementsMode === 'custom' ? orderMeasurements[k] : selectedCustomer?.measurements?.[k])).length;

  return (
    <div className="space-y-4">
      <Link to={existing ? `/orders/${existing.id}` : '/orders'} className="back-link font-semibold text-teal-600 dark:text-teal-400">
        ← {existing ? 'Back to order' : 'Back to order book'}
      </Link>

      <div className="detail-header">
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
          {existing ? 'Edit Order Details' : 'New Custom Order'}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Select client, garment design, order measurements, pricing, and due date.
        </p>
      </div>

      {customers.length === 0 ? (
        <div className="empty-state p-8 rounded-2xl text-center bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700">
          <div className="em-icon w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto text-2xl mb-3">
            👤
          </div>
          <p className="em-title font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">Add a client profile first</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Orders must belong to a client profile — create one before recording their order.</p>
          <Link to="/customers/new" className="btn btn-primary px-5 py-2.5 rounded-xl text-white font-medium shadow-md">
            + Add First Client
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Client Selection */}
          <div className="field">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Select Client *
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
            >
              <option value="">-- Choose a client --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Garment Selection Grid */}
          <div className="field">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Garment Type
            </label>
            <div className="garment-grid grid grid-cols-3 sm:grid-cols-4 gap-2">
              {GARMENT_TYPES.map((g) => (
                <div
                  key={g.name}
                  className={`garment-card p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                    garment === g.name
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                  onClick={() => setGarment(g.name)}
                >
                  <span className="text-xl block mb-1">{g.icon}</span>
                  <span className="text-xs">{g.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Measurements Options Section */}
          {selectedCustomer && (
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📏</span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Order Measurements
                  </h3>
                </div>
                <span className="text-xs bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full font-semibold">
                  {activeMeasurementsCount} recorded
                </span>
              </div>

              {/* Mode Toggle Pills */}
              <div className="grid grid-cols-2 gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  className={`py-2 px-3 rounded-lg text-center transition-all ${
                    measurementsMode === 'existing'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                  onClick={() => setMeasurementsMode('existing')}
                >
                  📐 Use Profile Saved
                </button>
                <button
                  type="button"
                  className={`py-2 px-3 rounded-lg text-center transition-all ${
                    measurementsMode === 'custom'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                  onClick={() => setMeasurementsMode('custom')}
                >
                  ✏️ Custom For This Order
                </button>
              </div>

              {measurementsMode === 'existing' ? (
                <div className="bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    Using saved measurements from <strong>{selectedCustomer.name}</strong>'s profile:
                  </p>
                  {Object.keys(selectedCustomer.measurements || {}).length === 0 ? (
                    <p className="text-xs italic text-amber-600 dark:text-amber-400">
                      No measurements found in client's profile. Switch to "Custom For This Order" to enter measurements.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {MEASURE_FIELDS.filter((f) => selectedCustomer.measurements?.[f.key]).map((f) => (
                        <span
                          key={f.key}
                          className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          <strong>{f.label}:</strong> {selectedCustomer.measurements[f.key]} {f.unit}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-medium text-teal-700 dark:text-teal-300">
                    Enter specific measurements customized for this {garment} order:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {MEASURE_FIELDS.map((f) => (
                      <div className="relative" key={f.key}>
                        <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">
                          {f.label}
                        </label>
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.25"
                          value={orderMeasurements[f.key] || ''}
                          onChange={(e) => setM(f.key, e.target.value)}
                          placeholder={selectedCustomer.measurements?.[f.key] || '—'}
                          className="w-full text-xs rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-900 dark:text-slate-100 pr-7"
                        />
                        <span className="absolute right-2 top-[22px] text-[10px] text-slate-400 font-semibold pointer-events-none">
                          {f.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syncToMaster}
                      onChange={(e) => setSyncToMaster(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>Also update {selectedCustomer.name}'s main profile with these values</span>
                  </label>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}

          {/* Pricing & Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="field">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Estimated Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="field relative">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Total Price (₹)
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-slate-100 pr-8"
              />
              <span className="absolute right-3 top-[34px] text-sm font-bold text-slate-400">₹</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="field relative">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Advance Paid (₹)
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={advance}
                onChange={(e) => setAdvance(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-slate-100 pr-8"
              />
              <span className="absolute right-3 top-[34px] text-sm font-bold text-slate-400">₹</span>
            </div>

            <div className="field">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Remaining Balance
              </label>
              <input
                type="text"
                disabled
                value={`₹${(Number(price || 0) - Number(advance || 0)).toLocaleString('en-IN')}`}
                className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 p-3 text-sm font-bold text-slate-700 dark:text-slate-300"
              />
            </div>
          </div>

          <div className="field">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              Fabric, Lining & Customization Details
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Silk fabric provided by client, heavy zardozi embroidery on neckline, padded blouse, trial scheduled on 20th."
              className="w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-slate-100 min-h-[90px]"
            />
          </div>

          <button
            type="submit"
            className="w-full btn btn-primary py-3.5 rounded-xl font-bold text-white shadow-lg text-sm transition-transform active:scale-[0.99]"
          >
            {existing ? 'Save Order Changes' : '✨ Save Custom Order'}
          </button>
        </form>
      )}
    </div>
  );
}
