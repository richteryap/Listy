# 📝 Listy

**Listy** is a modern, responsive note-taking application inspired by Google Keep. It allows users to capture ideas, create checklists, and manage tasks efficiently with a clean and intuitive interface. Built with **React** and **Supabase**.

## 🚀 Live Demo 

Check out the live application here: **[https://listy-delta.vercel.app/]**

## ✨ Features

* **Create & Edit Notes:** Seamlessly create text notes or switch to **checklist mode** for tasks.
* **Rich Media:** Upload and attach images to your notes using secure **Supabase Storage Buckets**.
* **Organization:**
    * 📌 **Pin** important notes to the top.
    * 📦 **Archive** notes you're done with but want to keep.
    * 🗑️ **Trash** notes (with restore and permanent delete).
* **Search:** Real-time search filtering by title, content, or checklist items.
* **View Options:** Toggle between **Grid View** (Masonry layout) and **List View**.
* **Dark/Light Mode:** Full theming support that adapts to your preference.
* **User Profiles::** A dedicated account dashboard to update your username, birthday, and manage your credentials.
* **Authentication:** Secure Email/Password login, registration with a smooth sliding animation, and automated **Password Reset** email flows powered by Supabase Auth.
* **Responsive Design:** Fully optimized layout that adapts perfectly from Desktop to Mobile.

## 🛠️ Tech Stack

* **Frontend:** React (Vite)
* **Styling:** CSS3
* **Backend / BaaS:** Supabase (PostgreSQL Database, Authentication, Cloud Storage)
* **Local Data / Sync:** Dexie.js (IndexedDB)
* **Routing:** React Router DOM
* **State Management:** React Context API & Custom Hooks
* **Deployment:** Vercel