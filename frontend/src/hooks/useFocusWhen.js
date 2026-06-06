import { useEffect } from 'react';

// Focus (and optionally select) a ref'd element when `active` becomes true.
// Used to restore keyboard rhythm at the point a field first becomes the
// operator's next action — e.g. the first item field once a customer is
// picked, or the purity/amount field when a workflow modal opens. Runs on
// the next frame so the target is mounted before we focus it.
export default function useFocusWhen(ref, active, { select = true } = {}) {
    useEffect(() => {
        if (!active) return undefined;
        const id = requestAnimationFrame(() => {
            const el = ref.current;
            if (!el) return;
            try {
                el.focus({ preventScroll: false });
                if (select && el.select) el.select();
            } catch (_e) { /* never throw from a focus effect */ }
        });
        return () => cancelAnimationFrame(id);
    }, [ref, active, select]);
}
