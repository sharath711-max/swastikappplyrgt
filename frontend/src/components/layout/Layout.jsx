import React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/workflow', label: 'Workflow' },
  { to: '/customers', label: 'Customers' },
  { to: '/bills', label: 'Bills' },
  { to: '/print', label: 'Print' },
];

export default function Layout() {
  return (
    <div className="d-flex">
      <aside className="sidebar no-print" style={{ width: '260px' }}>
        <div className="px-3 pb-3">
          <h4 className="mb-1">Swastik Lab</h4>
          <small className="text-white-50">Operations Panel</small>
        </div>
        <Nav className="flex-column">
          {navItems.map((item) => (
            <Nav.Link
              as={NavLink}
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
            >
              {item.label}
            </Nav.Link>
          ))}
        </Nav>
      </aside>

      <div className="flex-grow-1 main-content">
        <Navbar bg="white" expand="lg" className="border-bottom shadow-sm no-print">
          <Container fluid>
            <Navbar.Brand className="fw-semibold">Laboratory Management</Navbar.Brand>
          </Container>
        </Navbar>

        <Container fluid className="py-4">
          <Outlet />
        </Container>
      </div>
    </div>
  );
}
