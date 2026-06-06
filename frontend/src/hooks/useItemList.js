import { useCallback, useState } from 'react';

/**
 * Shared item-list state for the New<Type>Modal modals (GT, ST, GC, SC, PC).
 *
 * Encapsulates the three operations every modal duplicated:
 *   1. Append a new item with a unique id and 1-based seq.
 *   2. Remove an item by id, then renumber seqs.
 *   3. Reset to an empty list.
 *
 * Why a hook (not a Context):
 *   Each modal owns its own list. There is no cross-modal sharing.
 *   The hook removes ~30 LOC of identical state plumbing per modal
 *   without forcing them to share a single React tree.
 *
 * Cap enforcement is left to the caller (the message wording differs
 * per flow). The hook only enforces basic invariants.
 *
 * @param {object}   [opts]
 * @param {number}   [opts.max]       — soft cap; addItem returns false if exceeded
 * @param {function} [opts.onCapHit]  — fired when a cap-exceeded add is attempted
 *
 * @returns {{
 *   items: Array,
 *   addItem: (data) => boolean,
 *   removeItem: (id) => void,
 *   resetItems: () => void,
 *   setItems: (next) => void,
 *   count: number,
 *   atCap: boolean,
 * }}
 */
export function useItemList({ max = Infinity, onCapHit } = {}) {
    const [items, setItems] = useState([]);

    const addItem = useCallback((data) => {
        if (items.length >= max) {
            if (onCapHit) onCapHit(items.length, max);
            return false;
        }
        const id = `${Date.now()}-${Math.random()}`;
        const seq = items.length + 1;
        setItems((prev) => [...prev, { ...data, id, seq }]);
        return true;
    }, [items, max, onCapHit]);

    const removeItem = useCallback((id) => {
        setItems((prev) =>
            prev.filter((it) => it.id !== id).map((it, idx) => ({ ...it, seq: idx + 1 }))
        );
    }, []);

    const resetItems = useCallback(() => setItems([]), []);

    return {
        items,
        addItem,
        removeItem,
        resetItems,
        setItems,
        count: items.length,
        atCap: items.length >= max,
    };
}
