# Khat-e-ehsaas 💌✨

**_A digital space where feelings find words._**

Khat-e-ehsaas is a private web application designed for couples to write and share digital letters for various occasions and moods. Built with Node.js, Express, MongoDB, and Socket.IO, this project focuses on real-time connection and notifications.

---

## Features 🚀

* **Secure User Signup & Login:** Create and manage your private accounts.
* **Partner Connection:** Connect securely with your partner using a unique code.
* **Categorized Letters:** Write letters based on different emotions or reasons (e.g., "When you miss me", "When you're angry", "For motivation").
* **Real-time Experience:** Utilizes Socket.IO for instant updates:
    * Automatic connection status update for the other partner.
    * Real-time popup notifications (with sound) when a partner opens a letter.
* **Letter Dashboard:** View all received and sent letters, neatly organized by category.
* **Responsive Design:** Looks great on both mobile and desktop, styled with TailwindCSS.

---

## Tech Stack 🛠️

* **Backend:** Node.js, Express.js
* **Database:** MongoDB (with Mongoose)
* **Frontend:** EJS (templating), TailwindCSS
* **Real-time Communication:** Socket.IO
* **Authentication:** JWT (JSON Web Tokens)
* **Environment Variables:** dotenv

---

## Getting Started ⚙️

Follow these steps to set up and run the project locally:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/khat-e-ehsaas.git](https://github.com/your-username/khat-e-ehsaas.git)
    cd khat-e-ehsaas
    ```

2.  **Install dependencies:**
    Make sure you have Node.js and npm installed.
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory and add the necessary variables (like `MONGO_URI`, `JWT_SECRET`, `PORT`). Example:
    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_key_for_jwt
    PORT=3000
    ```

4.  **Run the development server:**
    This command will start the application (assuming you have a `dev` script in your `package.json`, e.g., `nodemon app.js`).
    ```bash
    npm run dev
    ```
    If you don't have a `dev` script, you can use:
    ```bash
    node app.js
    ```

5.  **Open your browser:**
    Navigate to `http://localhost:3000` (or the port you specified).

---

This project aims to blend love and technology, offering a modern way for couples to stay connected digitally. ❤️