import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const PrintContext = createContext(null);

// Mirrors PrintView.js resolveSnapshotRequest — maps route type → backend endpoint + printType
function resolveJob(routeType, id, { itemId, itemIndex, layout } = {}) {
    const itemQ = itemId ? `?itemId=${encodeURIComponent(itemId)}` : '';

    const map = {
        'gold-test':          { ep: itemId ? `/print/test/gold/${id}/item${itemQ}`        : itemIndex != null ? `/print/test/gold/${id}/item/${itemIndex}`        : `/print/test/gold/${id}`,        pt: 'gold-test'  },
        'silver-test':        { ep: itemId ? `/print/test/silver/${id}/item${itemQ}`      : itemIndex != null ? `/print/test/silver/${id}/item/${itemIndex}`      : `/print/test/silver/${id}`,      pt: 'silver-test'},
        'gold-certificate':   { ep: itemId ? `/print/certificate/gold/${id}/item${itemQ}` : itemIndex != null ? `/print/certificate/gold/${id}/item/${itemIndex}` : `/print/certificate/gold/${id}`, pt: 'certificate'},
        'silver-certificate': { ep: itemId ? `/print/certificate/silver/${id}/item${itemQ}`: itemIndex != null ? `/print/certificate/silver/${id}/item/${itemIndex}`: `/print/certificate/silver/${id}`,pt: 'silver'     },
        'photo-certificate':  { ep: itemId ? `/print/certificate/photo/${id}/item${itemQ}` : itemIndex != null ? `/print/certificate/photo/${id}/item/${itemIndex}` : `/print/certificate/photo/${id}`, pt: 'photo'      },
    };

    const resolved = map[routeType];
    if (!resolved) return null;

    return { endpoint: resolved.ep, printType: layout === 'receipt' ? 'receipt' : resolved.pt, layout };
}

function buildReceiptSnapshot(payload) {
    return {
        lab: { name: 'SWASTIK GOLD LAB', tagline: 'Testing & Certification', address: '' },
        receipt: {
            number: payload?.header?.auto_number || payload?.bill_number || '-',
            createdAt: payload?.header?.created_at || payload?.created_at || payload?.createdon,
            type: payload?.header?.entity_type || 'document',
            status: payload?.status || 'DONE',
        },
        customer: {
            name: payload?.customer?.name || payload?.customer_name || '-',
            phone: payload?.customer?.phone || payload?.customer_phone || '',
        },
        items: (payload?.items || []).map(i => ({
            id: i.id || i.item_number,
            name: i.item_type || i.item_name || i.name || 'Item',
            label: i.item_number || i.certificate_number || '',
            weight: i.net_weight || i.gross_weight || 0,
            amount: Number(i.item_total || i.total || 0),
            purity: i.purity,
        })),
        totals: {
            subtotal: Number(payload?.totals?.base || payload?.base || 0),
            tax: Number(payload?.totals?.tax || payload?.tax || 0),
            total: Number(payload?.totals?.total || payload?.total || payload?.grand_total || 0),
            paid: Number(payload?.totals?.total || payload?.total || payload?.grand_total || 0),
            balance: 0,
        },
        footer: { message: 'Snapshot receipt copy' },
    };
}

export function PrintProvider({ children }) {
    const [job, setJob] = useState(null);
    const [isPrinting, setIsPrinting] = useState(false);

    const triggerPrint = useCallback(async (routeType, id, opts = {}) => {
        if (isPrinting) return;
        
        const resolved = resolveJob(routeType, id, opts);
        if (!resolved) { 
            const err = new Error(`unrecognised print type: ${routeType}`);
            console.warn('usePrint:', err); 
            throw err; 
        }

        setIsPrinting(true);
        try {
            const res  = await api.get(resolved.endpoint);
            const raw  = res.data?.success ? res.data.data : res.data;
            
            // Deep freeze/clone data to prevent mid-print mutations from socket updates
            const data = JSON.parse(JSON.stringify(raw?.data || raw));

            let item = null;
            if (opts.itemId  && raw?.data?.items)          item = raw.data.items[0];
            else if (opts.itemId && data?.items)            item = data.items[0];
            else if (opts.itemIndex != null && data?.items) item = data.items[parseInt(opts.itemIndex, 10)];

            const photos = JSON.parse(JSON.stringify(raw?.photos || data?.photos || []));

            setJob({
                printType: resolved.printType,
                data,
                item,
                photos,
                itemLevel: opts.itemLevel || false,
                receiptData: resolved.printType === 'receipt' ? buildReceiptSnapshot(data) : null,
            });
        } catch (err) {
            console.error('Print fetch failed:', err);
            throw err; // Allow caller to handle (e.g. show toast)
        } finally {
            setIsPrinting(false);
        }
    }, [isPrinting]);

    const clearJob = useCallback(() => setJob(null), []);

    // Auto-trigger window.print() after portal renders
    useEffect(() => {
        if (!job) return;

        // Give the DOM a chance to paint the portal content
        // requestAnimationFrame ensures we wait for a frame, 
        // and setTimeout(0) pushes it to the end of the task queue.
        const frameId = requestAnimationFrame(() => {
            setTimeout(() => {
                const finalize = () => {
                    setJob(null);
                    window.onafterprint = null;
                };

                window.onafterprint = finalize;
                
                // Fallback for browsers with buggy onafterprint
                if (window.matchMedia) {
                    const mql = window.matchMedia('print');
                    const listener = (e) => { if (!e.matches) finalize(); };
                    mql.addEventListener('change', listener, { once: true });
                }

                window.print();
            }, 50); // Small buffer for image/font loading
        });

        return () => cancelAnimationFrame(frameId);
    }, [job]);

    return (
        <PrintContext.Provider value={{ triggerPrint, clearJob, job, isPrinting }}>
            {children}
        </PrintContext.Provider>
    );
}

export const usePrint = () => {
    const ctx = useContext(PrintContext);
    if (!ctx) throw new Error('usePrint must be used inside <PrintProvider>');
    return ctx;
};
