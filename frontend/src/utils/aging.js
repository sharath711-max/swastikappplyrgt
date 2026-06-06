// Workflow-card aging buckets. Pure function — no React, no I/O. Shared by
// the kanban card renderer and the sidebar workflow rows so both surfaces
// label the same row of work identically.
//
// Buckets:
//   fresh  : under 30 minutes   — no badge
//   warm   : 30 minutes to 2h   — "30m+"
//   hot    : 2h to 24h          — "2h+"
//   cold   : 24h+               — "1d+"
//
// DONE items are always fresh (aging is irrelevant once sealed).

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export const AGING_THRESHOLDS = {
    WARM_MS: 30 * MINUTE_MS,
    HOT_MS : 2 * HOUR_MS,
    COLD_MS: DAY_MS,
};

export const AGING = Object.freeze({
    FRESH: Object.freeze({ bucket: 'fresh', label: null,   severity: 0 }),
    WARM:  Object.freeze({ bucket: 'warm',  label: '30m+', severity: 1 }),
    HOT:   Object.freeze({ bucket: 'hot',   label: '2h+',  severity: 2 }),
    COLD:  Object.freeze({ bucket: 'cold',  label: '1d+',  severity: 3 }),
});

const SEVERITY_TITLE = {
    0: 'Fresh',
    1: 'In queue 30 minutes or more',
    2: 'In queue 2 hours or more',
    3: 'In queue 1 day or more',
};

// SQLite stores `created` as 'YYYY-MM-DD HH:MM:SS[.sss]' in UTC with no offset
// marker. `new Date(thatString)` parses it as LOCAL time in V8, which silently
// shifts the wall-clock age by the system TZ offset (5.5h for IST). Coerce to
// UTC explicitly so the bucket math is correct in every timezone.
function parseDbTimestampMs(s) {
    if (s instanceof Date) return s.getTime();
    if (typeof s !== 'string') return Number(s);
    const trimmed = s.trim();
    if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(trimmed)) return new Date(trimmed).getTime();
    return new Date(trimmed.replace(' ', 'T') + 'Z').getTime();
}

export function getAgingBucket(createdOn, status, nowMs = Date.now()) {
    if (!createdOn || status === 'DONE') return AGING.FRESH;
    const t = parseDbTimestampMs(createdOn);
    if (!Number.isFinite(t)) return AGING.FRESH;
    const ageMs = nowMs - t;
    if (ageMs >= AGING_THRESHOLDS.COLD_MS) return AGING.COLD;
    if (ageMs >= AGING_THRESHOLDS.HOT_MS)  return AGING.HOT;
    if (ageMs >= AGING_THRESHOLDS.WARM_MS) return AGING.WARM;
    return AGING.FRESH;
}

export function agingTitle(severity) {
    return SEVERITY_TITLE[severity] || '';
}
