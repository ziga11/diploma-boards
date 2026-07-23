# Dynamic Project Board System

General purpose board data management website, inspired by tools like monday.com.

## 🛠 Tech Stack
* **Framework:** Vite
* **Language:** TypeScript
* **Real-time Backend:** Supabase (Realtime Database & Google OAuth)
* **UI Icons:** Tabler

## 📋 Overview
The Board System allows the user to create entries of different types, for now its just the basic ones (text, status, button and date). It also allows on action URL calls. it was used as part of the system I was developing for my Diploma. It has gotten a lot of updates since.

## Features
* **Field Definitions:** User can create arbitrary fields, which can be of typ text, status, date or button
* **RealTime sync:** The project uses supabase, which handles realtime updates, allowing for multiperson syncronised workflow.
* **Event Automations:** The user can create automations, which are called when manipulating data (text change, status change, button press, row inserted, row deleted and any row change).
* **Permissions:** The creator has the ability of adding new people and defining their permissions. These can be 
    *Member (View Only)*
    *Editor (only edit)*
    *Manager (edit + automations)*
    *Admin (edit + automations + invitations)*
    *Owner (everything)*.
* **History Of Changes:** Users have access to seeing the history of changes as well as potential recovery of a deletion.
* **Pinning rows:** Pinning rows for easy access
* **API:** User can use an API key to manipulate (insert/update/delete) data from outside the website.

## TODO
* **Premade Actions:** Manipulating another board on change or sending an email, on date occoured actions etc.
* **Outside tool integrations:** Adding Zapier, n8n and other tools instant integration without any hassle.
* **File Field**: Adding a file type as well as file view right on the website (if possible)
* **Parnas Module Structure**: Shift the code from the current state where its just separated via dirs to information hiding. Described in the paper by Parnas.

## Previews
![ER Diagram](/public/assets/er.jpg)

### Demo
<div align="center">
  <video src="https://github.com/user-attachments/assets/2e9a85c7-458d-404a-942d-f286a6a92399" width="100%" controls muted>
  </video>
</div>


