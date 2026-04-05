import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Modal from '../../../../components/core/Modal';

describe('core Modal lifecycle', () => {
    test('adds and removes the body lock and overlay with visibility', () => {
        const { container, rerender } = render(
            <Modal show={true} onClose={jest.fn()} title="Lifecycle test">
                <div>Modal body</div>
            </Modal>
        );

        expect(screen.getByRole('dialog', { name: 'Lifecycle test' })).toBeInTheDocument();
        expect(container.querySelector('.modal-overlay')).toBeInTheDocument();
        expect(document.body).toHaveClass('modal-open');

        rerender(
            <Modal show={false} onClose={jest.fn()} title="Lifecycle test">
                <div>Modal body</div>
            </Modal>
        );

        expect(screen.queryByRole('dialog', { name: 'Lifecycle test' })).not.toBeInTheDocument();
        expect(container.querySelector('.modal-overlay')).not.toBeInTheDocument();
        expect(document.body).not.toHaveClass('modal-open');
    });
});
