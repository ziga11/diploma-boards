# Project Board System (Sistem Projektnih Tabel)

A dynamic web-based dashboard designed for HR teams to visualize recruitment pipelines and manage organizational data in real-time.

## 📋 Overview
The Project Board System serves as a central hub for HR operations. It allows staff to track new candidates, manage internal organizational structures, and monitor employee absences (e.g., maternity leave). The system is built to be highly flexible, allowing users to define their own data structures without backend modifications.

## 🛠 Tech Stack
* **Framework:** Vite
* **Language:** TypeScript
* **Backend-as-a-Service:** Supabase (Realtime DB & Auth)
* **Authentication:** Google OAuth 2.0
* **UI Components:** Bootstrap (Modals and Layout)

## ✨ Key Features
* **Dynamic Table Creation:** Define custom columns (status, text, dates, buttons) for any business process.
* **Real-time Synchronization:** Powered by Supabase, ensuring all team members see updates instantly without page refreshes.
* **Event-Driven Webhooks:** Trigger external actions or automated workflows based on status changes or entry updates.
* **Batch Operations:** Efficiently duplicate or delete multiple entries simultaneously.

## 🚀 Getting Started
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Configure your Supabase URL and Anon Key in a `.env` file.
4. Launch the development server with `npm run dev`.
