import React from 'react';
import { FaCalendarDay, FaChartLine, FaWallet } from 'react-icons/fa';

const fmtINR = (v) =>
    Number(v || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

/**
 * Three separately-scoped financial cards — fixes the previous mapping
 * mismatch where Cash In Hand opened the all-time breakdown.
 *   Today Revenue   → onOpenToday
 *   Total Revenue   → onOpenAllTime
 *   Cash In Hand    → onOpenCashInHand
 *
 * Big-number readout, Python-style — operator glanceability over
 * dense table layout. Click anywhere on the card opens its scoped modal.
 */
export default function RevenueCards({
    todayRevenue,
    totalRevenue,
    cashInHand,
    onOpenToday,
    onOpenAllTime,
    onOpenCashInHand,
}) {
    return (
        <div className="dash-revenue-row">
            <button
                type="button"
                className="dash-rev-card dash-rev-card--today"
                onClick={onOpenToday}
                aria-label="Open today's revenue breakdown"
            >
                <div className="dash-rev-card__head">
                    <FaCalendarDay className="dash-rev-card__icon" aria-hidden="true" />
                    <span className="dash-rev-card__label">Revenue Today</span>
                </div>
                <div className="dash-rev-card__value">{fmtINR(todayRevenue)}</div>
                <div className="dash-rev-card__hint">Tap for cash / UPI / balance split</div>
            </button>

            <button
                type="button"
                className="dash-rev-card dash-rev-card--total"
                onClick={onOpenAllTime}
                aria-label="Open all-time revenue breakdown"
            >
                <div className="dash-rev-card__head">
                    <FaChartLine className="dash-rev-card__icon" aria-hidden="true" />
                    <span className="dash-rev-card__label">Total Revenue</span>
                </div>
                <div className="dash-rev-card__value">{fmtINR(totalRevenue)}</div>
                <div className="dash-rev-card__hint">Tap for cumulative split + P&amp;L</div>
            </button>

            <button
                type="button"
                className="dash-rev-card dash-rev-card--cash"
                onClick={onOpenCashInHand}
                aria-label="Open cash in hand details"
            >
                <div className="dash-rev-card__head">
                    <FaWallet className="dash-rev-card__icon" aria-hidden="true" />
                    <span className="dash-rev-card__label">Cash In Hand</span>
                </div>
                <div className="dash-rev-card__value">{fmtINR(cashInHand)}</div>
                <div className="dash-rev-card__hint">Tap for current liquidity</div>
            </button>
        </div>
    );
}
