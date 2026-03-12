# Swastik Gold & Silver Testing Lab

A comprehensive full-stack application for managing Gold & Silver testing lab operations, certification, and financial ledgers.

## Features

- **Dashboard**: Live statistics, workflow board, and activity timeline.
- **Customer Management**: CRM for managing customer profiles and history.
- **Lab Testing**:
  - **Gold Testing**: Track items, purity, and issue certificates.
  - **Silver Testing**: Manage silver batch testing and reporting.
- **Certificates**: Generate and print Gold/Silver/Photo certificates.
- **Financials**:
  - **Ledger & Bills**: Track customer credits, debits, and invoices.
  - **Weight Loss Ledger**: Track metal loss during processing.
  - **Cash In Hand**: Daily cash register management (Incoming/Outgoing).
- **Security**: Role-based authentication and secure data handling.

## Tech Stack

- **Frontend**: React.js, Salesforce Design System (SLDS), React Icons
- **Backend**: Node.js, Express.js
- **Database**: SQLite (via `better-sqlite3`)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   node dev.js
   ```
   (This script automatically installs dependencies for both backend and frontend)

### Running the Application

Start the development environment (Backend + Frontend):

```bash
node dev.js
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Database

The application uses SQLite. The schema is defined in `backend/db/init.sql`.
To reset the database, delete `backend/db/lab.db` and restart the server.

### New Modules
- **Weight Loss**: Located at `/weight-loss`
- **Cash Register**: Located at `/cash-in-hand`