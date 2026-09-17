import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

const STORAGE_KEY = 'pranaya_design.v1';
const LEGACY_STORAGE_KEY = 'telior.v1';
const THEME_KEY = 'pranaya_theme';

const DataContext = createContext(null);

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        customers: parsed.customers || [],
        orders: parsed.orders || [],
        settings: parsed.settings || {
          studioName: 'Pranaya Design Studio',
          phone: '',
          address: '',
          upiId: '',
          googleDrive: {
            enabled: false,
            accessToken: '',
            userEmail: '',
            fileId: '',
            lastSynced: null,
            syncStatus: 'idle',
          },
        },
      };
    }
  } catch (e) {
    console.warn('Could not read saved data', e);
  }
  return {
    customers: [],
    orders: [],
    settings: {
      studioName: 'Pranaya Design Studio',
      phone: '',
      address: '',
      upiId: '',
      googleDrive: {
        enabled: false,
        accessToken: '',
        userEmail: '',
        fileId: '',
        lastSynced: null,
        syncStatus: 'idle',
      },
    },
  };
}

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export const GARMENT_TYPES = [
  { name: 'Blouse', icon: '👚', category: 'Womenswear' },
  { name: 'Lehenga', icon: '👗', category: 'Womenswear' },
  { name: 'Anarkali / Suit', icon: '👘', category: 'Womenswear' },
  { name: 'Kurta / Pajama', icon: '🥻', category: 'Ethnic' },
  { name: 'Sherwani', icon: '🧥', category: 'Ethnic' },
  { name: 'Shirt', icon: '👔', category: 'Menswear' },
  { name: 'Trouser / Pant', icon: '👖', category: 'Bottomwear' },
  { name: 'Gown / Indo-Western', icon: '💃', category: 'Partywear' },
  { name: 'Other', icon: '🧵', category: 'Custom' },
];

export const ORDER_STAGES = ['Pending', 'Cutting', 'Stitching', 'Ready', 'Delivered'];

export const MEASURE_FIELDS = [
  // Upper Body
  { key: 'bust', label: 'Bust / Chest', unit: 'in', category: 'Upper' },
  { key: 'waist', label: 'Waist', unit: 'in', category: 'Upper' },
  { key: 'hip', label: 'Hip', unit: 'in', category: 'Upper' },
  { key: 'shoulder', label: 'Shoulder', unit: 'in', category: 'Upper' },
  { key: 'neckDepthFront', label: 'Front Neck', unit: 'in', category: 'Upper' },
  { key: 'neckDepthBack', label: 'Back Neck', unit: 'in', category: 'Upper' },
  { key: 'armhole', label: 'Armhole', unit: 'in', category: 'Upper' },
  { key: 'sleeveLength', label: 'Sleeve Length', unit: 'in', category: 'Upper' },
  { key: 'sleeveRound', label: 'Sleeve Round', unit: 'in', category: 'Upper' },
  { key: 'topLength', label: 'Top Length', unit: 'in', category: 'Upper' },
  
  // Lower Body & Full
  { key: 'trouserLength', label: 'Pant / Lehenga Len', unit: 'in', category: 'Lower' },
  { key: 'bottomWaist', label: 'Bottom Waist', unit: 'in', category: 'Lower' },
  { key: 'thigh', label: 'Thigh Round', unit: 'in', category: 'Lower' },
  { key: 'bottomRound', label: 'Ankle / Hem', unit: 'in', category: 'Lower' },
  { key: 'fullLength', label: 'Full Outfit Length', unit: 'in', category: 'Lower' },
];

export function DataProvider({ children }) {
  const [data, setData] = useState(loadInitial);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_KEY) || 'light';
  });

  const isInitialMount = useRef(true);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Push automatically to Google Drive when data changes if connected
  const pushToGoogleDriveNow = useCallback(async (overrideData) => {
    const targetData = overrideData || data;
    const gd = targetData.settings?.googleDrive;
    if (!gd?.enabled || !gd?.accessToken) return false;

    try {
      const payload = JSON.stringify(targetData, null, 2);
      let fileId = gd.fileId;

      // 1. Search for existing file if fileId is not saved
      if (!fileId) {
        const searchRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=name='pranaya_design_auto_backup.json'&fields=files(id)`,
          {
            headers: { Authorization: `Bearer ${gd.accessToken}` },
          }
        );
        if (searchRes.ok) {
          const searchJson = await searchRes.json();
          if (searchJson.files && searchJson.files.length > 0) {
            fileId = searchJson.files[0].id;
          }
        }
      }

      // 2. Update existing file or create new file
      if (fileId) {
        const uploadRes = await fetch(
          `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${gd.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: payload,
          }
        );

        if (uploadRes.ok) {
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setData((prev) => ({
            ...prev,
            settings: {
              ...prev.settings,
              googleDrive: {
                ...prev.settings.googleDrive,
                fileId,
                lastSynced: nowStr,
                syncStatus: 'synced',
              },
            },
          }));
          return true;
        }
      } else {
        // Create new file
        const metadata = {
          name: 'pranaya_design_auto_backup.json',
          mimeType: 'application/json',
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([payload], { type: 'application/json' }));

        const createRes = await fetch(
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${gd.accessToken}` },
            body: form,
          }
        );

        if (createRes.ok) {
          const createJson = await createRes.json();
          const newFileId = createJson.id;
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setData((prev) => ({
            ...prev,
            settings: {
              ...prev.settings,
              googleDrive: {
                ...prev.settings.googleDrive,
                fileId: newFileId,
                lastSynced: nowStr,
                syncStatus: 'synced',
              },
            },
          }));
          return true;
        }
      }
    } catch (e) {
      console.warn('Google Drive Auto-Push Failed:', e);
    }
    return false;
  }, [data]);

  // Auto-trigger push on data mutation
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (data.settings?.googleDrive?.enabled && data.settings?.googleDrive?.accessToken) {
      const timer = setTimeout(() => {
        pushToGoogleDriveNow(data);
      }, 1500); // 1.5s debounce
      return () => clearTimeout(timer);
    }
  }, [data.customers, data.orders, pushToGoogleDriveNow]);

  const connectGoogleDrive = useCallback((accessToken, userEmail = '') => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updatedData = {
      ...data,
      settings: {
        ...data.settings,
        googleDrive: {
          enabled: true,
          accessToken,
          userEmail,
          fileId: data.settings?.googleDrive?.fileId || '',
          lastSynced: nowStr,
          syncStatus: 'synced',
        },
      },
    };
    setData(updatedData);
    pushToGoogleDriveNow(updatedData);
  }, [data, pushToGoogleDriveNow]);

  const disconnectGoogleDrive = useCallback(() => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        googleDrive: {
          enabled: false,
          accessToken: '',
          userEmail: '',
          fileId: '',
          lastSynced: null,
          syncStatus: 'idle',
        },
      },
    }));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const updateSettings = useCallback((newSettings) => {
    setData((d) => ({
      ...d,
      settings: { ...d.settings, ...newSettings },
    }));
  }, []);

  const addCustomer = useCallback((customer) => {
    const record = {
      id: uid('cust'),
      createdAt: Date.now(),
      measurements: {},
      notes: '',
      ...customer,
    };
    setData((d) => ({ ...d, customers: [record, ...d.customers] }));
    return record.id;
  }, []);

  const updateCustomer = useCallback((id, patch) => {
    setData((d) => ({
      ...d,
      customers: d.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const deleteCustomer = useCallback((id) => {
    setData((d) => ({
      ...d,
      customers: d.customers.filter((c) => c.id !== id),
      orders: d.orders.filter((o) => o.customerId !== id),
    }));
  }, []);

  const addOrder = useCallback((order) => {
    const record = {
      id: uid('ord'),
      createdAt: Date.now(),
      status: 'Pending',
      price: 0,
      advance: 0,
      measurementsMode: 'existing',
      orderMeasurements: {},
      ...order,
    };
    setData((d) => ({ ...d, orders: [record, ...d.orders] }));
    return record.id;
  }, []);

  const updateOrder = useCallback((id, patch) => {
    setData((d) => ({
      ...d,
      orders: d.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    }));
  }, []);

  const markOrderPaid = useCallback((id) => {
    setData((d) => ({
      ...d,
      orders: d.orders.map((o) => (o.id === id ? { ...o, advance: o.price } : o)),
    }));
  }, []);

  const deleteOrder = useCallback((id) => {
    setData((d) => ({ ...d, orders: d.orders.filter((o) => o.id !== id) }));
  }, []);

  const exportDataJSON = useCallback(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  const importDataJSON = useCallback((jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.customers) && Array.isArray(parsed.orders)) {
        setData({
          customers: parsed.customers,
          orders: parsed.orders,
          settings: parsed.settings || data.settings,
        });
        return { success: true, count: parsed.customers.length + parsed.orders.length };
      }
      return { success: false, error: 'Invalid file structure. Must contain customers and orders.' };
    } catch (err) {
      return { success: false, error: 'Invalid JSON format.' };
    }
  }, [data.settings]);

  const value = {
    customers: data.customers,
    orders: data.orders,
    settings: data.settings,
    theme,
    toggleTheme,
    updateSettings,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addOrder,
    updateOrder,
    markOrderPaid,
    deleteOrder,
    exportDataJSON,
    importDataJSON,
    connectGoogleDrive,
    disconnectGoogleDrive,
    pushToGoogleDriveNow,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
