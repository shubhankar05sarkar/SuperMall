# Super Mall Web Application

A web application designed to empower merchants by providing a digital platform to showcase, advertise, and sell their products. This platform bridges the gap between rural towns and global markets by creating virtual counters where local merchants can list their shops, highlight current offers, and promote their unique products. With an intuitive interface and powerful filtering features, the application caters to both merchants and customers. Merchants gain visibility and opportunities to expand their businesses, while customers can seamlessly explore and shop for diverse products. By fostering a digital marketplace, this application aims to boost local economies, encourage entrepreneurial growth in underdeveloped regions, and create a more connected and inclusive global trade network.

### Deployed at Netlify - https://shimmering-dodol-e10b52.netlify.app/

You can register as a new user or use the following demo credentials to explore the application by directly logging in:
- Email: abc@example.com
- Password: abc123

---

## Features

### Merchant Features

* Login/Register
* Create and Manage Shop Details
* Manage Offer Details
* Manage Categories and Floors

### Customer Features

* View Category-wise Details
* Browse Shop List
* View Current Offers
* Filter by Category and Floor
* View Shop Details and Offers

---

## Technologies Used

* HTML5
* CSS3
* JavaScript
* Firebase

  * Authentication
  * Firestore Database
* Bootstrap 5

---

## Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/shubhankar05sarkar/SuperMall
   cd SuperMall
   ```

2. **Set up Firebase**

   * Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   * Enable Authentication (Email/Password)
   * Create a Firestore Database
   * Enable Storage
   * Get your Firebase configuration object

3. **Configure Firebase**

   * Open `js/config.js`
   * Replace the placeholder values with your Firebase configuration:

     ```javascript
     const firebaseConfig = {
         apiKey: "YOUR_API_KEY",
         authDomain: "YOUR_AUTH_DOMAIN",
         projectId: "YOUR_PROJECT_ID",
         storageBucket: "YOUR_STORAGE_BUCKET",
         messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
         appId: "YOUR_APP_ID"
     };
     ```

4. **Set up Firestore Collections**
   Create the following collections in your Firestore database:

   * `users`
   * `shops`
   * `offers`
   * `categories`
   * `floors`
   * `logs`

5. **Run the Application**

   * Use a local server to run the application (e.g., Live Server in VS Code)
   * Or deploy to Firebase Hosting:

     ```bash
     npm install -g firebase-tools
     firebase login
     firebase init
     firebase deploy
     ```

---

## Database Schema

### Users Collection

```javascript
{
    name: string,
    email: string,
    role: string, // 'admin' or 'user'
    createdAt: timestamp
}
```

### Shops Collection

```javascript
{
    name: string,
    description: string,
    category: string,
    floor: string,
    contact: string,
    imageUrl: string,
    hasOffer: boolean,
    featured: boolean
}
```

### Offers Collection

```javascript
{
    title: string,
    description: string,
    shopId: string,
    startDate: timestamp,
    endDate: timestamp,
    discount: number
}
```

### Categories Collection

```javascript
{
    name: string,
    description: string
}
```

### Floors Collection

```javascript
{
    name: string,
    description: string
}
```

---

## Logging

The application uses a custom logging module that logs all actions to both the console and Firestore. Logs include:

* User actions (login, register, etc.)
* Shop management actions
* Offer management actions
* Error logs

---

## UI Overview

### Basic UI

![Basic UI](https://github.com/shubhankar05sarkar/SuperMall/blob/c44d4b5a58bf9aa366fc71dd8e217a026099f29e/Basic%20UI.png)
*The application has a clean and responsive UI with a modern design*

### Shop UI

![Shop UI](https://github.com/shubhankar05sarkar/SuperMall/blob/c44d4b5a58bf9aa366fc71dd8e217a026099f29e/Shop%20UI.png)
*Displays detailed shop information, and offers in an organized layout*

---

## **Author**

Created with ❤️ by **Shubhankar Sarkar**.  
[GitHub Profile](https://github.com/shubhankar05sarkar)

