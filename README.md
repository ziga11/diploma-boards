# Dynamic Project Board System

A highly flexible, general-purpose platform for data management and workflow visualization, inspired by tools like monday.com.

## 📋 Overview
The Project Board System is a dynamic environment where users can define their own data structures without writing code. While it was utilized in the diploma for HR recruitment and tracking employee absences, the core engine is designed to handle any type of tabular data through user-defined schemas.

## 🛠 Tech Stack
* **Framework:** Vite
* **Language:** TypeScript
* **Real-time Backend:** Supabase (Realtime Database & Google OAuth)
* **UI Components:** Bootstrap

## ✨ Key Features
* **Custom Schema Definition:** Create arbitrary tables with specialized column types including text, status labels, dates, and action buttons.
* **Real-time Collaboration:** All changes are synchronized across all connected clients instantly via Supabase.
* **Event-Driven Automation:** Configurable webhooks that trigger external actions based on data changes (e.g., sending a notification when a status column is updated).
* **Mass Data Operations:** Built-in support for bulk selection, duplication, and deletion of records.
* **Flexible UI:** Dynamic rendering of components based on the user-defined table structure.
