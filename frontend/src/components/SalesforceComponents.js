import React, { useState, useEffect } from 'react';

// 1. Salesforce Toast Notification
export const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={`slds-toast slds-toast_${type}`}>
            <div className="slds-toast__content">
                <strong>{type.toUpperCase()}:</strong> {message}
            </div>
            <button className="modal-close" onClick={onClose} style={{ marginLeft: '12px' }}>
                ×
            </button>
        </div>
    );
};

// 2. Salesforce Modal Component
export const Modal = ({ isOpen, show, onClose, onHide, title, children, size = 'medium', dark = false }) => {
    const isModalOpen = typeof isOpen === 'boolean' ? isOpen : !!show;
    const handleClose = onClose || onHide || (() => { });

    if (!isModalOpen) return null;

    const sizeClasses = {
        small: 'max-w-md',
        medium: 'max-w-2xl',
        large: 'max-w-4xl',
        xlarge: 'max-w-6xl'
    };

    return (
        <div className={`modal-overlay ${dark ? 'modal-dark' : ''}`}>
            <div className={`modal-content ${sizeClasses[size] || ''}`}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="modal-close" onClick={handleClose}>×</button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

// 3. Salesforce DataTable with Advanced Features
export const DataTable = ({
    columns,
    data,
    selectable = false,
    sortable = false,
    onRowClick,
    loading = false
}) => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    const handleSort = (column) => {
        if (column.sortable) {
            if (sortColumn === column.field) {
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
            } else {
                setSortColumn(column.field);
                setSortDirection('asc');
            }
        }
    };

    const sortedData = React.useMemo(() => {
        if (!sortColumn) return data;

        return [...data].sort((a, b) => {
            if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
            if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortColumn, sortDirection]);

    if (loading) {
        return (
            <div className="slds-spinner_container">
                <div className="slds-spinner" role="status">
                    <span className="slds-assistive-text">Loading</span>
                </div>
            </div>
        );
    }

    return (
        <table className="data-table slds-table slds-table_cell-buffer slds-table_bordered">
            <thead>
                <tr>
                    {selectable && (
                        <th style={{ width: '50px' }}>
                            <input
                                type="checkbox"
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedRows(data.map((_, index) => index));
                                    } else {
                                        setSelectedRows([]);
                                    }
                                }}
                            />
                        </th>
                    )}
                    {columns.map((column, index) => (
                        <th
                            key={index}
                            onClick={() => handleSort(column)}
                            style={{ cursor: column.sortable ? 'pointer' : 'default' }}
                        >
                            {column.header}
                            {sortColumn === column.field && (
                                <span style={{ marginLeft: '4px' }}>
                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                </span>
                            )}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {sortedData.map((row, rowIndex) => (
                    <tr
                        key={rowIndex}
                        onClick={() => onRowClick && onRowClick(row)}
                        style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                        className={selectedRows.includes(rowIndex) ? 'row-selected' : ''}
                    >
                        {selectable && (
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedRows.includes(rowIndex)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedRows([...selectedRows, rowIndex]);
                                        } else {
                                            setSelectedRows(selectedRows.filter(i => i !== rowIndex));
                                        }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </td>
                        )}
                        {columns.map((column, colIndex) => (
                            <td key={colIndex}>
                                {column.render ? column.render(row) : row[column.field]}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

// 4. Salesforce Kanban Board for Test Status
export const KanbanBoard = ({ lanes, onCardMove }) => {
    const [draggedCard, setDraggedCard] = useState(null);

    const handleDragStart = (card, laneId) => {
        setDraggedCard({ ...card, sourceLane: laneId });
    };

    const handleDragOver = (e, laneId) => {
        e.preventDefault();
    };

    const handleDrop = (laneId) => {
        if (draggedCard && draggedCard.sourceLane !== laneId) {
            onCardMove(draggedCard.id, laneId);
        }
        setDraggedCard(null);
    };

    return (
        <div className="slds-kanban">
            {lanes.map(lane => (
                <div
                    key={lane.id}
                    className="slds-kanban__lane"
                    onDragOver={(e) => handleDragOver(e, lane.id)}
                    onDrop={() => handleDrop(lane.id)}
                >
                    <div className="slds-kanban__lane-header">
                        {lane.title} ({lane.cards.length})
                    </div>
                    {lane.cards.map(card => (
                        <div
                            key={card.id}
                            className="slds-kanban__card"
                            draggable
                            onDragStart={() => handleDragStart(card, lane.id)}
                        >
                            <div className="slds-text-title" style={{ fontWeight: 'bold' }}>{card.title}</div>
                            <div className="slds-text-body_small" style={{ fontSize: '12px', marginTop: '4px' }}>{card.description}</div>
                            <div className="slds-text-body_small slds-m-top_x-small" style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
                                <strong>Customer:</strong> {card.customer}
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

// 5. Salesforce Path/Progress Component
export const ProgressPath = ({ steps, currentStep }) => {
    return (
        <div className="slds-path">
            {steps.map((step, index) => (
                <div
                    key={index}
                    className={`slds-path__item ${index < currentStep ? 'complete' :
                            index === currentStep ? 'current' : ''
                        }`}
                >
                    {step}
                </div>
            ))}
        </div>
    );
};
