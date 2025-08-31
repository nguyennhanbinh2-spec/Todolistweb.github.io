# 📅 Weekly To-do (7 days)

An interactive weekly to-do list application, perfect for managing your tasks day by day. This project is a demo of a web app running inside a GitHub Codespace, featuring a clean, responsive design and a simple client-side JavaScript implementation.

## 🚀 Features

* **Weekly View**: See your to-do lists for all seven days of the week at a glance.
* **Dynamic Dates**: Easily change the displayed week by selecting a new reference date.
* **Track Progress**: Add and check off tasks for each day. A progress counter shows how many tasks you've completed.
* **Save Daily Totals**: The "Save" button for each day persists the count of completed tasks to a backend, allowing you to track your productivity over time.
* **Interactive Line Chart**: Visualize your daily progress with a line chart powered by Chart.js, showing your saved "done" counts.
* **Responsive Design**: The layout adjusts seamlessly for different screen sizes, from desktops to mobile devices.

## 🛠️ Technology Stack

* **Frontend**:
    * **HTML**: Structure of the web page.
    * **CSS**: Styling, including a modern, minimal aesthetic.
    * **JavaScript (Client-side)**: Handles all interactivity, including adding tasks, updating counters, and fetching/saving data via API calls.
    * **Chart.js**: A powerful charting library used to display the line graph.

* **Backend**:
    * This is a client-side heavy application. Data persistence (saving daily totals) is handled by API calls to a hypothetical backend.
    * The provided `index.html` file includes the full client-side logic. The backend API (`/api/stats`) is assumed to be in place to handle `POST` and `DELETE` requests for saving and clearing data.

## 📁 File Structure

The entire application is self-contained within a single `index.html` file.
