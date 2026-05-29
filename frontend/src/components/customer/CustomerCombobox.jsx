import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { FaTimes, FaSearch, FaSpinner } from 'react-icons/fa';
import api from '../../services/api';
import './CustomerCombobox.css';

const DEBOUNCE_MS = 250;
const PAGE_SIZE = 10;

const fmtINR = (n) =>
    Number(n || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export default function CustomerCombobox({
    value,
    onChange,
    placeholder = 'Search customer by name or phone…',
    autoFocus = false,
    disabled = false,
}) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [highlighted, setHighlighted] = useState(0);
    const [selected, setSelected] = useState(null);

    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const seqRef = useRef(0);
    const listboxId = useId();

    // External value reset (e.g., parent cleared the form) → clear selection.
    useEffect(() => {
        if (!value && selected) setSelected(null);
    }, [value, selected]);

    // Hydrate selected display when an external value is set without going
    // through the combobox (rare; covers parent-driven preselection).
    useEffect(() => {
        if (value && (!selected || selected.id !== value)) {
            api.get(`/customers/${value}`)
                .then((r) => {
                    const c = r.data?.data ?? r.data;
                    if (c) setSelected({ id: c.id, name: c.name, phone: c.phone, balance: c.balance });
                })
                .catch(() => {});
        }
    }, [value, selected]);

    const runSearch = useCallback(async (q) => {
        const seq = ++seqRef.current;
        if (!q || q.trim().length < 2) {
            if (seq === seqRef.current) {
                setResults([]);
                setLoading(false);
            }
            return;
        }
        setLoading(true);
        try {
            const qs = new URLSearchParams({
                search: q.trim(),
                pageSize: String(PAGE_SIZE),
                sortBy: 'name',
            });
            const res = await api.get(`/customers?${qs.toString()}`);
            if (seq !== seqRef.current) return;
            // Paged shape: { data: [...], pagination: {...} }
            const rows = Array.isArray(res.data?.data) ? res.data.data : [];
            setResults(rows);
            setHighlighted(0);
        } catch {
            if (seq === seqRef.current) setResults([]);
        } finally {
            if (seq === seqRef.current) setLoading(false);
        }
    }, []);

    // Debounced search on query change.
    useEffect(() => {
        if (selected) return;
        const id = setTimeout(() => runSearch(query), DEBOUNCE_MS);
        return () => clearTimeout(id);
    }, [query, runSearch, selected]);

    // Click outside closes dropdown.
    useEffect(() => {
        const onDocClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    const choose = (c) => {
        setSelected(c);
        setQuery('');
        setResults([]);
        setOpen(false);
        onChange?.(c.id, c);
    };

    const clear = () => {
        setSelected(null);
        setQuery('');
        setResults([]);
        onChange?.('', null);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const onKeyDown = (e) => {
        if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
            setOpen(true);
            return;
        }
        if (!open) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlighted((i) => Math.min(i + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlighted((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const pick = results[highlighted];
            if (pick) choose(pick);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    if (selected) {
        return (
            <div className="customer-combobox customer-combobox--selected" ref={containerRef}>
                <div className="customer-combobox__chip">
                    <div className="customer-combobox__chip-main">
                        <span className="customer-combobox__chip-name">{selected.name}</span>
                        {selected.phone && (
                            <span className="customer-combobox__chip-phone">+91 {selected.phone}</span>
                        )}
                    </div>
                    <span className="customer-combobox__chip-balance">{fmtINR(selected.balance)}</span>
                    <button
                        type="button"
                        className="customer-combobox__clear"
                        onClick={clear}
                        disabled={disabled}
                        aria-label="Clear selection"
                        title="Clear selection"
                    >
                        <FaTimes aria-hidden="true" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="customer-combobox" ref={containerRef}>
            <div className="customer-combobox__input-wrap">
                <FaSearch className="customer-combobox__icon" aria-hidden="true" />
                <input
                    ref={inputRef}
                    type="text"
                    className="customer-combobox__input"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={onKeyDown}
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={listboxId}
                    aria-autocomplete="list"
                    autoFocus={autoFocus}
                    disabled={disabled}
                />
                {loading && <FaSpinner className="customer-combobox__spinner" aria-hidden="true" />}
            </div>
            {open && query.trim().length >= 2 && (
                <ul
                    id={listboxId}
                    className="customer-combobox__list"
                    role="listbox"
                    aria-label="Customer search results"
                >
                    {results.length === 0 && !loading && (
                        <li className="customer-combobox__empty">No matches.</li>
                    )}
                    {results.map((c, i) => (
                        <li
                            key={c.id}
                            role="option"
                            aria-selected={i === highlighted}
                            className={`customer-combobox__option${i === highlighted ? ' is-highlighted' : ''}`}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                choose(c);
                            }}
                            onMouseEnter={() => setHighlighted(i)}
                        >
                            <span className="customer-combobox__opt-name">{c.name}</span>
                            {c.phone && (
                                <span className="customer-combobox__opt-phone">+91 {c.phone}</span>
                            )}
                            <span className="customer-combobox__opt-balance">{fmtINR(c.balance)}</span>
                        </li>
                    ))}
                </ul>
            )}
            {open && query.trim().length > 0 && query.trim().length < 2 && (
                <ul id={listboxId} className="customer-combobox__list" role="listbox">
                    <li className="customer-combobox__hint">Type at least 2 characters to search.</li>
                </ul>
            )}
        </div>
    );
}
