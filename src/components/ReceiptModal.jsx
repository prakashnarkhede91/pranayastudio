import React, { useState } from 'react';
import { useData } from '../data/store.jsx';
import WhatsAppButton from './WhatsAppButton.jsx';

export default function ReceiptModal({ order, customer, onClose }) {
  const { settings } = useData();
  const [copied, setCopied] = useState(false);

  if (!order || !customer) return null;

  const price = Number(order.price || 0);
  const advance = Number(order.advance || 0);
  const balance = price - advance;

  const dateFormatted = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const dueDateFormatted = order.dueDate
    ? new Date(order.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Not specified';

  const receiptText = `✨ *${settings.studioName || 'Pranaya Design Studio'}* ✨
-----------------------------
*ORDER RECEIPT*
Ref: #${order.id.slice(-6).toUpperCase()}
Date: ${dateFormatted}

*Customer:* ${customer.name}
*Phone:* ${customer.phone || 'N/A'}
*Garment:* ${order.garment}
*Status:* ${order.status}
*Due Date:* ${dueDateFormatted}
${order.notes ? `*Notes:* ${order.notes}\n` : ''}
-----------------------------
*Total Amount:* ₹${price.toLocaleString('en-IN')}
*Advance Paid:* ₹${advance.toLocaleString('en-IN')}
*Balance Due:* ₹${balance.toLocaleString('en-IN')}
-----------------------------
Thank you for choosing ${settings.studioName || 'Pranaya Design'}! 💖`;

  const handleCopy = () => {
    navigator.clipboard.writeText(receiptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="section-head" style={{ marginBottom: 16 }}>
          <h2>Digital Order Receipt</h2>
          <button className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div
          style={{
            background: 'var(--canvas)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-md)',
            padding: 18,
            fontFamily: 'monospace',
            fontSize: 13,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            marginBottom: 20,
            color: 'var(--ink)',
          }}
        >
          {receiptText}
        </div>

        <div className="pill-row" style={{ margin: 0, justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn btn-outline" onClick={handleCopy}>
            {copied ? '✓ Copied' : '📋 Copy Receipt'}
          </button>
          {customer.phone && (
            <WhatsAppButton
              phone={customer.phone}
              message={receiptText}
              label="Share Receipt"
            />
          )}
        </div>
      </div>
    </div>
  );
}
