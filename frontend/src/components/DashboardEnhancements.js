import React, { useState, useEffect } from 'react';
import { FaCrown, FaCoins, FaRupeeSign, FaCertificate, FaClock, FaUsers, FaPlus, FaUserPlus, FaChartBar } from 'react-icons/fa';

// Real-time Stats with Auto-refresh
export const LiveStats = () => {
    const [stats, setStats] = useState({ // eslint-disable-line no-unused-vars
        goldTests: 0,
        silverTests: 0,
        revenue: 0,
        certificates: 0,
        pendingTests: 0,
        activeCustomers: 0
    });

    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        // Simulate real-time updates
        const interval = setInterval(() => {
            setLastUpdated(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="live-stats-container">
            <div className="stats-grid">
                {[
                    { key: 'goldTests', icon: <FaCrown />, label: 'Gold Tests', color: 'gold' },
                    { key: 'silverTests', icon: <FaCoins />, label: 'Silver Tests', color: 'silver' },
                    { key: 'revenue', icon: <FaRupeeSign />, label: 'Revenue Today', color: 'revenue', prefix: '₹ ' },
                    { key: 'certificates', icon: <FaCertificate />, label: 'Certificates', color: 'certificate' },
                    { key: 'pendingTests', icon: <FaClock />, label: 'Pending Tests', color: 'warning' },
                    { key: 'activeCustomers', icon: <FaUsers />, label: 'Active Customers', color: 'primary' }
                ].map(stat => (
                    <div key={stat.key} className="stat-card">
                        <div className={`stat-icon ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            <h3>{stat.prefix || ''}{stats[stat.key].toLocaleString()}</h3>
                            <p>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="last-updated">
                Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
        </div>
    );
};

// Quick Actions Panel
export const QuickActions = ({ navigate }) => {
    const actions = [
        { icon: <FaPlus />, label: 'New Gold Test', onClick: () => navigate('/workflow?tab=gold') },
        { icon: <FaCoins />, label: 'New Silver Test', onClick: () => navigate('/workflow?tab=silver') },
        { icon: <FaUserPlus />, label: 'Add Customer', onClick: () => navigate('/customers') },
        { icon: <FaCertificate />, label: 'Certificates', onClick: () => navigate('/certificates') },

        { icon: <FaChartBar />, label: 'Workflow Board', onClick: () => navigate('/workflow') }
    ];

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">Quick Actions</h2>
            </div>
            <div className="card-body">
                <div className="quick-actions-grid">
                    {actions.map((action, index) => (
                        <div
                            key={index}
                            className="quick-action-btn"
                            onClick={action.onClick}
                        >
                            {action.icon}
                            <span>{action.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Recent Activity Timeline
export const ActivityTimeline = () => {
    const [activities, setActivities] = useState([]); // eslint-disable-line no-unused-vars

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">Recent Activity</h2>
            </div>
            <div className="card-body">
                <div className="activity-timeline">
                    {activities.length > 0 ? (
                        activities.map((activity, index) => (
                            <div key={index} className="activity-item">
                                <div className="activity-time">{activity.time}</div>
                                <div className="activity-content">
                                    <strong>{activity.user}</strong> {activity.action}
                                    <div className="activity-reference">{activity.reference}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-muted py-4">No recent activity</div>
                    )}
                </div>
            </div>
        </div>
    );
};
