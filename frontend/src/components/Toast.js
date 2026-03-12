import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import '../styles/Toast.css';

const Toast = ({ id, message, type = 'info', onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation
        const timer1 = setTimeout(() => setIsVisible(true), 10);

        // Auto closing is handled by the context, but we can also handle local visual dismissal

        return () => clearTimeout(timer1);
    }, []); // onClose is handled by parent mainly

    const getIcon = () => {
        switch (type) {
            case 'success': return <FaCheckCircle />;
            case 'error': return <FaExclamationCircle />;
            case 'warning': return <FaExclamationTriangle />;
            case 'info':
            default: return <FaInfoCircle />;
        }
    };

    return (
        <div className={`toast ${type} ${isVisible ? 'visible' : ''}`}>
            <div className="toast-icon">
                {getIcon()}
            </div>
            <div className="toast-content">
                <div className="toast-message">{message}</div>
            </div>
            <button className="toast-close" onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
            }}>
                <FaTimes />
            </button>
        </div>
    );
};

export default Toast;
