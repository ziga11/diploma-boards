# Project Board System (Sistem Projektnih Tabel)

[cite_start]This repository contains the source code for the **Project Board System**, a web-based platform designed to simplify and automate recruitment processes[cite: 33, 38].

## 📋 Overview
[cite_start]The Project Board System allows HR personnel to manage candidate data and visualize recruitment workflows[cite: 38]. [cite_start]It serves as a dashboard for viewing new candidates and initiating user account provisioning[cite: 38]. [cite_start]The system also supports the creation of dynamic tables for other purposes, such as tracking absences (e.g., maternity leave) or the organizational structure of the HR agency[cite: 68].

## 🛠 Tech Stack
* [cite_start]**Framework:** Vite [cite: 92]
* [cite_start]**Language:** TypeScript [cite: 92]
* [cite_start]**Database & Auth:** Supabase (infrastructure and authentication via Google Account) [cite: 99]
* [cite_start]**UI Components:** Bootstrap (used for modal windows) [cite: 238]

## ✨ Key Features
* [cite_start]**Dynamic Schema Definition:** Users can create custom table structures with various column types (text, status, buttons, dates)[cite: 111, 242].
* [cite_start]**Real-time Synchronization:** Changes in the interface are immediately reflected in the database without refreshing the page, thanks to Supabase integration[cite: 116, 137].
* [cite_start]**Event-Driven Automation:** Configurable webhooks allow the system to trigger external actions based on specific events within the table, such as a status change[cite: 114, 115].
* [cite_start]**Access Control:** Secure authentication is managed via OAuth 2.0 (Google)[cite: 113].
