import React, { useState, useEffect } from 'react';
import { useData } from '../data/store.jsx';

export default function Settings() {
  const {
    settings,
    updateSettings,
    theme,
    toggleTheme,
    exportDataJSON,
    importDataJSON,
    customers,
    orders,
    connectGoogleDrive,
    disconnectGoogleDrive,
    pushToGoogleDriveNow,
  } = useData();

  const [studioName, setStudioName] = useState(settings.studioName || '');
  const [phone, setPhone] = useState(settings.phone || '');
  const [address, setAddress] = useState(settings.address || '');
  const [upiId, setUpiId] = useState(settings.upiId || '');
  const [googleClientId, setGoogleClientId] = useState(settings.googleClientId || '');
  const [saved, setSaved] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [shareStatus, setShareStatus] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const gd = settings.googleDrive || {};

  // Check URL hash for OAuth redirect token if returning from Google OAuth Sign-In
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token=')) {
      const match = hash.match(/access_token=([^&]+)/);
      if (match && match[1]) {
        const token = match[1];
        connectGoogleDrive(token, 'Google Drive Account');
        setShareStatus('🟢 Google Drive Auto-Sync connected successfully via Google Login! Pushing backup...');
        // Clean hash without reload
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [connectGoogleDrive]);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings({ studioName, phone, address, upiId, googleClientId });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExport = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pranaya_design_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handle1ClickGoogleSignIn = () => {
    const cid = googleClientId.trim();
    if (!cid) {
      setShowGuide(true);
      setShareStatus('ℹ️ Enter your Google Cloud Client ID below or use the 30-sec Playground helper to complete 1-click connect.');
      return;
    }

    const scope = encodeURIComponent('https://www.googleapis.com/auth/drive.file');
    const redirect_uri = encodeURIComponent(window.location.origin + window.location.pathname);
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=token&client_id=${encodeURIComponent(cid)}&redirect_uri=${redirect_uri}&scope=${scope}&prompt=consent`;

    window.location.href = oauthUrl;
  };

  const handleConnectToken = (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    connectGoogleDrive(tokenInput.trim(), 'Connected Google Drive');
    setTokenInput('');
    setShowGuide(false);
    setShareStatus('🟢 Google Drive Auto-Sync connected!');
  };

  const handlePushNow = async () => {
    setIsSyncing(true);
    const success = await pushToGoogleDriveNow();
    setIsSyncing(false);
    if (success) {
      setShareStatus('✓ Successfully pushed latest backup to Google Drive!');
    } else {
      setShareStatus('⚠️ Push failed. Token may have expired — reconnect to update session.');
    }
  };

  const handleGoogleDriveBackup = async () => {
    const jsonStr = exportDataJSON();
    const fileName = `pranaya_design_backup_${new Date().toISOString().slice(0, 10)}.json`;
    const file = new File([jsonStr], fileName, { type: 'application/json' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'Pranaya Design Google Drive Backup',
          text: 'Backup file containing client measurements and order history for Pranaya Design Studio.',
          files: [file],
        });
        setShareStatus('✓ Saved / Shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleExport();
          setShareStatus('📥 Downloaded backup file. Upload it to Google Drive!');
        }
      }
    } else {
      handleExport();
      setShareStatus('📥 Downloaded backup file. Open Google Drive to upload this file!');
    }
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = importDataJSON(event.target.result);
      if (res.success) {
        setImportStatus(`✓ Restored ${res.count} records successfully!`);
      } else {
        setImportStatus(`❌ Import failed: ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">
          Studio Settings
        </h2>
      </div>

      {/* Theme Preference Card */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-bold font-display text-sm text-slate-900 dark:text-slate-100">
            App Color Theme
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Current: <strong>{theme === 'dark' ? 'Midnight Luxury (Dark)' : 'Fresh Mint (Light)'}</strong>
          </p>
        </div>
        <button
          className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      {/* Google Drive Automatic Cloud Sync Section */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">☁️</span>
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-slate-100">
              Automatic Google Drive Sync
            </h3>
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
              gd.enabled
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
            }`}
          >
            {gd.enabled ? '🟢 AUTO-SYNC ACTIVE' : '⚪ MANUAL'}
          </span>
        </div>

        {gd.enabled ? (
          <div className="space-y-3 bg-emerald-50 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                Auto-Push Status:
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-mono">
                {gd.lastSynced ? `Last push at ${gd.lastSynced}` : 'Syncing...'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every customer profile and order modification is silently pushed to your Google Drive in real time!
            </p>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handlePushNow}
                disabled={isSyncing}
                className="flex-1 py-2 px-3 rounded-lg bg-teal-600 text-white font-bold text-xs shadow-sm hover:bg-teal-700 disabled:opacity-50"
              >
                {isSyncing ? '⏳ Syncing...' : '🔄 Push Latest Data Now'}
              </button>
              <button
                onClick={disconnectGoogleDrive}
                className="py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Sign in with your Google Account to automatically push every client measurement and order edit to your Google Drive silently.
            </p>

            {/* 1-Click Google Sign In Button */}
            <button
              onClick={handle1ClickGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 text-white font-bold text-xs shadow-md hover:opacity-95"
            >
              <span>🔑</span> Sign in & Connect Google Drive
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleGoogleDriveBackup}
                className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-[11px] hover:bg-slate-100"
              >
                📤 1-Tap Save File
              </button>
              <button
                onClick={() => setShowGuide(!showGuide)}
                className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-[11px] hover:bg-slate-100"
              >
                ⚙️ OAuth Token Guide
              </button>
            </div>

            {showGuide && (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-xs border-b border-slate-200 dark:border-slate-800 pb-1.5">
                  Google Drive Connection Options:
                </div>

                {/* Option A: Client ID setup */}
                <div className="space-y-2">
                  <div className="font-bold text-teal-600 dark:text-teal-400">
                    Option A: Direct 1-Click Google OAuth Sign-In
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Enter your Google Cloud Web Client ID below to enable 1-click Sign in with Google directly from the app:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={googleClientId}
                      onChange={(e) => setGoogleClientId(e.target.value)}
                      placeholder="e.g. 12345-abcde.apps.googleusercontent.com"
                      className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      className="px-3 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-xs font-bold"
                    >
                      Save ID
                    </button>
                  </div>
                </div>

                <hr className="border-slate-200 dark:border-slate-800" />

                {/* Option B: 30-Sec OAuth Token */}
                <div className="space-y-2">
                  <div className="font-bold text-teal-600 dark:text-teal-400">
                    Option B: Quick Token Paste (30 seconds)
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <li>
                      Open{' '}
                      <a
                        href="https://developers.google.com/oauthplayground/"
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-teal-600 dark:text-teal-400 underline"
                      >
                        Google OAuth Playground ↗
                      </a>
                    </li>
                    <li>Select Drive API v3 &gt; <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">drive.file</code> scope</li>
                    <li>Click Authorize APIs & sign in to Google</li>
                    <li>Copy Access token (starts with <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">ya29...</code>) and paste below:</li>
                  </ol>

                  <form onSubmit={handleConnectToken} className="space-y-2 pt-1">
                    <input
                      type="text"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="Paste Access Token (ya29...)"
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-slate-100"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 rounded-lg bg-teal-600 text-white font-bold text-xs shadow-sm hover:bg-teal-700"
                    >
                      ✓ Connect & Enable Real-Time Auto Push
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {shareStatus && (
          <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 pt-1">
            {shareStatus}
          </p>
        )}
      </div>

      {/* Studio Details Form Card */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-sm font-bold font-display text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700/60 pb-2">
          🏪 Studio Profile Info
        </h3>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Studio / Business Name
            </label>
            <input
              type="text"
              value={studioName}
              onChange={(e) => setStudioName(e.target.value)}
              placeholder="e.g. Pranaya Design Studio"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Studio Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 9876543210"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                UPI Payment ID (Optional)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. pranaya@upi"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Studio Address / Location
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address shown on digital receipts"
              rows={2}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm text-slate-900 dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            className="w-full btn btn-primary py-3 rounded-xl font-bold text-white text-xs shadow-md"
          >
            {saved ? '✓ Profile Details Saved' : 'Save Studio Details'}
          </button>
        </form>
      </div>

      {/* Local Data Export & Restore Card */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2">
          <h3 className="text-sm font-bold font-display text-slate-900 dark:text-slate-100">
            💾 Local Data Export & Restore
          </h3>
          <span className="text-[11px] font-semibold text-slate-400">
            {customers.length} Cust · {orders.length} Ord
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Export Backup</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Download a JSON copy of all customer records and measurements.
            </p>
            <button
              className="w-full py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 shadow-sm hover:bg-slate-100"
              onClick={handleExport}
            >
              📥 Download Backup JSON
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Restore Backup</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Upload a previously saved Pranaya Design backup JSON file.
            </p>
            <input
              type="file"
              accept=".json"
              id="import-input"
              style={{ display: 'none' }}
              onChange={handleImport}
            />
            <label
              htmlFor="import-input"
              className="block text-center w-full py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 shadow-sm cursor-pointer hover:bg-slate-100"
            >
              📤 Import Backup JSON
            </label>
          </div>
        </div>

        {importStatus && (
          <p className="text-xs font-bold text-teal-600 dark:text-teal-400 pt-1">
            {importStatus}
          </p>
        )}
      </div>
    </div>
  );
}
