# Civic & Municipal Portal

A modern, high-performance civic engagement platform designed to bridge the gap between local government and citizens. This portal provides a streamlined interface for viewing municipal projects, news, and officials, while offering a secure, multi-step workflow for permit applications.

## 🌟 Key Features

*   **Public Information Hub:** Easy access to department details, ongoing municipal projects, and official news updates.
*   **Secure Citizen Dashboard:** Personal accounts for citizens to track their interactions and application statuses.
*   **Digital Permit Office:** Interactive, multi-step building permit applications powered by the latest React 19 features.
*   **Admin CMS:** A dedicated management interface for officials to moderate permits and manage public content.
*   **GIS Integration:** Interactive maps for visualizing municipal development projects.
*   **Real-time Notifications:** Instant status updates via WebSockets.
*   **Unified Search:** Fast, server-side full-text search across news and projects.

## 🛠️ The Tech Stack

This project is built using a modern "Go-React" stack, prioritizing performance, type safety, and a seamless user experience.

### Frontend
*   **Framework:** [React 19](https://react.dev/) (utilizing new `useActionState` and `useFormStatus` hooks for streamlined form handling).
*   **Build Tool:** [Vite](https://vitejs.dev/) for ultra-fast development.
*   **Styling:** [Tailwind CSS 4.0](https://tailwindcss.com/) for utility-first, responsive design.
*   **Mapping:** [Leaflet.js](https://leafletjs.com/) for open-source GIS visualizations.
*   **Navigation:** [React Router 7](https://reactrouter.com/) for client-side routing.

### Backend
*   **Language:** [Go 1.22+](https://go.dev/) for high-concurrency performance.
*   **Web Framework:** [Echo v4](https://echo.labstack.com/) for minimalist, high-speed routing.
*   **Authentication:** JWT-based security with HTTP-Only cookies for enhanced protection against XSS.
*   **Real-time:** Native WebSockets for live updates.
*   **Security:** Argon2/Bcrypt for secure password hashing and RBAC for permission management.

### Database & Infrastructure
*   **Primary Database:** [PostgreSQL 16](https://www.postgresql.org/) for robust relational data.
*   **Search Engine:** PostgreSQL Full-Text Search (FTS) for integrated, high-performance querying.
*   **Containerization:** [Docker](https://www.docker.com/) for consistent database environments.

## 🚀 Getting Started

### Prerequisites
*   Node.js (v20+)
*   Go (v1.22+)
*   Docker & Docker Compose

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ElormDesmond/civic-we-portal.git
    cd civic-we-portal
    ```

2.  **Setup the Database:**
    ```bash
    docker-compose up -d
    ```

3.  **Start the Backend:**
    ```bash
    cd server
    go run main.go
    ```

4.  **Start the Frontend:**
    ```bash
    cd client
    npm install
    npm run dev
    ```

## 🔐 Default Credentials

*   **Admin Email:** `admin@municipality.gov`
*   **Admin Password:** `admin123`

---
*Developed with a focus on municipal efficiency and citizen empowerment.*
