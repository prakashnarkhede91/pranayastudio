import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useData, MEASURE_FIELDS } from '../data/store.jsx';

export default function CustomerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customers, addCustomer, updateCustomer } = useData();
  const existing = id ? customers.find((c) => c.id === id) : null;

  const [name, setName] = useState(existing?.name || '');
  const [phone, setPhone] = useState(existing?.phone || '');
  const [address, setAddress] = useState(existing?.address || '');
  const [notes, setNotes] = useState(existing?.notes || '');
  const [measurements, setMeasurements] = useState(existing?.measurements || {});
  const [error, setError] = useState('');

  const setM = (key, val) => setMeasurements((m) => ({ ...m, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Client full name is required.');
      return;
    }
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      notes: notes.trim(),
      measurements,
    };
    if (existing) {
      updateCustomer(existing.id, payload);
      navigate(`/customers/${existing.id}`);
    } else {
      const newId = addCustomer(payload);
      navigate(`/customers/${newId}`);
    }
  };

  const upperFields = MEASURE_FIELDS.filter((f) => f.category === 'Upper');
  const lowerFields = MEASURE_FIELDS.filter((f) => f.category === 'Lower');

  return (
    <div className="space-y-4">
      <Link to={existing ? `/customers/${existing.id}` : '/customers'} className="back-link font-semibold text-teal-600 dark:text-teal-400 inline-flex items-center gap-1 text-sm">
        ← {existing ? 'Back to profile' : 'Back to clients'}
      </Link>

      <div className="detail-header">
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">
          {existing ? 'Edit Client Profile' : 'New Client Profile'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Record client contact details & master garment measurements.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Contact Info Card */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-sm font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-2">
            <span>👤</span> Basic Details
          </h2>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Anjali Deshmukh"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                inputMode="tel"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                City / Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400 pt-1">
              ⚠️ {error}
            </p>
          )}
        </div>

        {/* Upper Body Measurements Card */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/60 pb-2">
            <h2 className="text-sm font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>👚</span> Upper Body Measurements
            </h2>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-700/80 px-2 py-0.5 rounded-full">
              inches
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {upperFields.map((f) => (
              <div className="space-y-1" key={f.key}>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 truncate">
                  {f.label}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.25"
                    value={measurements[f.key] || ''}
                    onChange={(e) => setM(f.key, e.target.value)}
                    placeholder="—"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 pr-7 text-sm text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="absolute right-2.5 top-2.5 text-xs text-slate-400 font-semibold pointer-events-none">
                    {f.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lower Body & Lengths Card */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/60 pb-2">
            <h2 className="text-sm font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>👖</span> Lower Body & Lengths
            </h2>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-700/80 px-2 py-0.5 rounded-full">
              inches
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {lowerFields.map((f) => (
              <div className="space-y-1" key={f.key}>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 truncate">
                  {f.label}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.25"
                    value={measurements[f.key] || ''}
                    onChange={(e) => setM(f.key, e.target.value)}
                    placeholder="—"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 pr-7 text-sm text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="absolute right-2.5 top-2.5 text-xs text-slate-400 font-semibold pointer-events-none">
                    {f.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preference Notes Card */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Fitting & Preference Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g. Prefers loose armholes, deep back neck with latkan, cotton lining required"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm text-slate-900 dark:text-slate-100 min-h-[80px]"
          />
        </div>

        <button
          type="submit"
          className="w-full btn btn-primary py-3.5 rounded-xl font-bold text-white shadow-lg text-sm transition-transform active:scale-[0.99]"
        >
          {existing ? 'Save Profile Changes' : '✨ Save Client Profile'}
        </button>
      </form>
    </div>
  );
}
