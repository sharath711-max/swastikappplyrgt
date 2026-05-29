import { renderHook, act } from '@testing-library/react';
import { useItemList } from '../../../hooks/useItemList';

describe('useItemList', () => {
    test('starts empty with count=0, atCap=false', () => {
        const { result } = renderHook(() => useItemList({ max: 20 }));
        expect(result.current.items).toEqual([]);
        expect(result.current.count).toBe(0);
        expect(result.current.atCap).toBe(false);
    });

    test('addItem assigns sequential seq starting at 1', () => {
        const { result } = renderHook(() => useItemList({ max: 20 }));

        act(() => { result.current.addItem({ item: 'Ring' }); });
        act(() => { result.current.addItem({ item: 'Chain' }); });

        expect(result.current.items.map(i => ({ item: i.item, seq: i.seq })))
            .toEqual([{ item: 'Ring', seq: 1 }, { item: 'Chain', seq: 2 }]);
    });

    test('addItem returns false and fires onCapHit at the cap', () => {
        const onCapHit = jest.fn();
        const { result } = renderHook(() => useItemList({ max: 2, onCapHit }));

        let r1, r2, r3;
        act(() => { r1 = result.current.addItem({ item: 'A' }); });
        act(() => { r2 = result.current.addItem({ item: 'B' }); });
        act(() => { r3 = result.current.addItem({ item: 'C' }); });

        expect(r1).toBe(true);
        expect(r2).toBe(true);
        expect(r3).toBe(false);
        expect(result.current.count).toBe(2);
        expect(result.current.atCap).toBe(true);
        expect(onCapHit).toHaveBeenCalledWith(2, 2);
    });

    test('removeItem drops by id and renumbers seq', () => {
        const { result } = renderHook(() => useItemList({ max: 20 }));

        act(() => { result.current.addItem({ item: 'A' }); });
        act(() => { result.current.addItem({ item: 'B' }); });
        act(() => { result.current.addItem({ item: 'C' }); });

        const idB = result.current.items[1].id;
        act(() => { result.current.removeItem(idB); });

        expect(result.current.items.map(i => i.item)).toEqual(['A', 'C']);
        expect(result.current.items.map(i => i.seq)).toEqual([1, 2]);
    });

    test('resetItems clears the list and lifts atCap', () => {
        const { result } = renderHook(() => useItemList({ max: 2 }));
        act(() => { result.current.addItem({ item: 'A' }); });
        act(() => { result.current.addItem({ item: 'B' }); });
        expect(result.current.atCap).toBe(true);

        act(() => { result.current.resetItems(); });
        expect(result.current.count).toBe(0);
        expect(result.current.atCap).toBe(false);
    });

    test('addItem assigns unique ids even on rapid calls', () => {
        const { result } = renderHook(() => useItemList({ max: 100 }));
        act(() => {
            for (let i = 0; i < 10; i++) {
                result.current.addItem({ item: `Item${i}` });
            }
        });
        const ids = result.current.items.map(i => i.id);
        expect(new Set(ids).size).toBe(10);
    });
});
