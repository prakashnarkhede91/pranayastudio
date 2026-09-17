import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Customers from './pages/Customers.jsx';
import CustomerForm from './pages/CustomerForm.jsx';
import CustomerDetail from './pages/CustomerDetail.jsx';
import Orders from './pages/Orders.jsx';
import OrderForm from './pages/OrderForm.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import Settings from './pages/Settings.jsx';
import { useData } from './data/store.jsx';

const PAGE_LABELS = {
  '/': 'Studio Dashboard',
  '/customers': 'Client Directory',
  '/customers/new': 'New Client Profile',
  '/orders': 'Order Book',
  '/orders/new': 'New Order',
  '/settings': 'Settings & Backup',
};

function pageLabel(pathname) {
  if (PAGE_LABELS[pathname]) return PAGE_LABELS[pathname];
  if (pathname.startsWith('/customers/')) return 'Client Profile';
  if (pathname.startsWith('/orders/')) return 'Order Details';
  return '';
}

export default function App() {
  const location = useLocation();
  const { theme, toggleTheme, settings } = useData();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 max-w-[580px] mx-auto flex flex-col relative shadow-2xl">
      {/* Sticky Topbar Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-indigo-600 text-white font-bold font-display text-lg flex items-center justify-center shrink-0 shadow-md">
            P
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 font-bold font-display text-slate-900 dark:text-slate-100 text-base leading-tight truncate">
              <span className="truncate">{settings.studioName || 'Pranaya Design'}</span>
              <span className="text-teal-600 dark:text-teal-400">.</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 px-1.5 py-0.5 rounded shrink-0">
                COUTURE
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
              {pageLabel(location.pathname)}
            </div>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          title="Toggle Light/Dark Theme"
          className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0 ml-2"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>

      {/* Main Page Body */}
      <main className="flex-1 p-4 pb-24 w-full">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/new" element={<CustomerForm />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/customers/:id/edit" element={<CustomerForm />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/new" element={<OrderForm />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/orders/:id/edit" element={<OrderForm />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      {/* Glassmorphism Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
