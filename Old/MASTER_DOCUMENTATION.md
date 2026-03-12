    # Master Project Documentation: Swastik Gold & Silver Testing

    ## 1. Executive Summary
    The **Swastik Gold & Silver Testing and Certificate Center** application is a professional-grade, localized business management system. It is designed for jewelry testing labs to manage customer accounts, record purity/weight test results, generate official certificates, and maintain a rigorous financial ledger.

    ---

    ## 2. Technical Stack
    *   **Backend:** Python 3.x with **Flask**.
    *   **Real-time Engine:** **Flask-SocketIO** (WebSockets) for instant multi-terminal updates.
    *   **Database:** **SQLite3** for lightweight, serverless local storage.
    *   **ORM:** **SQLAlchemy** with **Flask-Migrate** (Alembic) for schema management.
    *   **Frontend:** Server-side rendered (SSR) with **Jinja2** templates.
    *   **CSS/UI:** Premium custom CSS with a focus on business-centric data grids and dashboard aesthetics.
    *   **Security:** **JWT** for API authentication, **Flask-WTF** for CSRF protection.
    *   **Windows Integration:** `pywin32` for running the application as a background/service-like process on Windows.

    ---

    ## 3. Core Business Logic & Pricing
    The system categorizes services into four primary types:

    | Service | Base Price | Mode | Certificate |
    | :--- | :--- | :--- | :--- |
    | **Gold Test (GT)** | ₹30 | Casual | No |
    | **Gold Certificate (GC)** | ₹50 | Formal | Yes (Incremental Alphanumeric) |
    | **Silver Certificate (SC)** | ₹100 | Formal | Yes |
    | **Photo Certificate (PC)** | ₹50 | Formal | Yes + Media Upload |

    ### Financial Rules:
    *   **GST Calculation:** If GST (18%) is enabled, the taxable amount is derived as `Price / 1.18`. The total remains the same, but the tax component is split for billing.
    *   **Payment Modes:** `CASH`, `UPI`, and `BALANCE`.
    *   **Ledger System:** Uses a `CreditHistory` table to track every debit (service rendered) and credit (payment received).

    ---

    ## 4. Database Schema Overview
    The project uses a hybrid relational + document model by leveraging JSON columns.

    ### Key Models:
    *   **User/Role:** Role-based access control (Admin/User).
    *   **Customer:** Name, phone, and a running `balance`.
    *   **GoldTest / GoldCertificate / SilverCertificate / PhotoCertificate:**
        *   Include a `data` column (JSON) to store multiple samples (Item, Weight, Purity).
        *   `PhotoCertificate` uses a `MediaMixin` for image tracking.
    *   **WeightLossHistory:** Tracks gold/silver weight loss over time for specific customers.
    *   **CreditHistory:** The source of truth for the customer ledger.
    *   **Globals:** Stores global sequences like the last `certificate_number`.

    ---

    ## 5. System Workflows

    ### A. Testing Life Cycle
    1.  **Entry:** Reception enters customer details and item names.
    2.  **Lab Work:** Samples are tested; purity and weights are entered.
    3.  **Completion:** Admin reviews, selects payment mode, and finishes the bill.
    4.  **Conversion:** A simple `GoldTest` can be converted into a `GoldCertificate` if requested after testing.

    ### B. Certificate Numbering Logic
    Numbers are generated in a sequence like `A01`, `A02`... `A999`, then `B01`. This ensures unique tracking across years of operation.

    ### C. Real-time Dashboard
    The application uses SocketIO to broadcast events:
    *   `added`: New test entry.
    *   `pending`: Test moved to lab.
    *   `completed`: Bill generated.
    *   `deleted`: Record removed.
    This ensures all terminals in the shop reflect the same queue status.

    ---

    ## 6. Project Structure
    ```text
    /swastik
    ├── app.py              # Entry point (Windows runner)
    ├── config.py           # Environment & App settings
    ├── requirements.txt    # Python dependencies
    ├── /app
    │   ├── models.py       # SQLAlchemy Models & Business logic
    │   ├── services.py     # Global helpers (IST Time, Cert Logic)
    │   ├── /api            # REST & SocketIO Endpoints
    │   ├── /dashboard      # Jinja2 Routes & Controllers
    │   └── /static         # CSS, JS, and Media Uploads
    └── site.db             # SQLite Database
    ```

    ---

    ## 7. Master Input Prompt (for SERN Migrations)
    This prompt can be used to recreate or migrate this system to a Node/React (SERN) stack:

    > **Prompt:** "Build a SERN (SQLite, Express, React, Node) application for a Jewelry Testing Center. Requirements: 18-character alphanumeric IDs (CUS-, GTE-, GCE- prefixes). SQLite with JSON columns for multi-sample data. Socket.io for real-time Kanban (TODO, IN_PROGRESS, DONE). Pricing: GT(30), GC(50), SC(100), PC(50). Ledger system tracking 'balance' through a CreditHistory table. Auto-incrementing Alphanumeric Certificate numbers (A01-A999, B01...). IST Timezone. Premium Salesforce-style UI."

    ---

    ## 8. Deployment & Running
    *   The application is typically started via `runner.bat`.
    *   Logs are maintained in the `/logs` directory for debugging.
    *   DB backups are handled by copying the `site.db` file.
