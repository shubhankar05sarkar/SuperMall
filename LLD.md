# Super Mall - Low Level Design Document

## 1. System Architecture

### 1.1 Technology Stack
- **Frontend**
  - HTML5
  - CSS3 (Bootstrap 5.3.0)
  - JavaScript (ES6+)
  - Firebase SDK 8.10.1

- **Backend**
  - Firebase Authentication
  - Firebase Firestore
  - Firebase Storage

### 1.2 System Components
```
Super Mall
├── Frontend
│   ├── index.html (Main UI)
│   ├── css/
│   │   └── style.css (Custom styles)
│   └── js/
│       ├── config.js (Firebase configuration)
│       ├── auth.js (Authentication module)
│       ├── app.js (Main application logic)
│       └── logger.js (Error logging)
└── Backend (Firebase)
    ├── Authentication
    ├── Firestore Database
    └── Storage
```

## 2. Component Design

### 2.1 Authentication Module (auth.js)
```javascript
class Auth {
    // Core functionality
    - constructor()
    - setupAuthStateListener()
    - checkAuthState()
    - login(email, password)
    - register(name, email, password)
    - logout()
    - setupEventListeners()
}
```

#### Key Features:
- User registration with name, email, and password
- User login with email and password
- Session management
- Real-time auth state monitoring
- UI state management based on auth status

### 2.2 Application Module (app.js)
```javascript
class App {
    // Core functionality
    - constructor()
    - setupEventListeners()
    - loadHome()
    - loadShops()
    - loadOffers()
    - handleAddShop()
    - filterShops()
}
```

#### Key Features:
- Shop management (CRUD operations)
- Offer management
- Category and floor filtering
- Featured shops display
- Shop details view
- Offer details view

### 2.3 Logger Module (logger.js)
```javascript
class Logger {
    // Core functionality
    - logInfo(message, data)
    - logError(message, error)
    - logWarning(message, data)
}
```

#### Key Features:
- Error tracking
- User activity logging
- System event logging
- Firestore integration for logs

## 3. Database Design

### 3.1 Collections Structure

#### Users Collection
```javascript
{
    uid: string,
    name: string,
    email: string,
    role: string,
    createdAt: timestamp
}
```

#### Shops Collection
```javascript
{
    name: string,
    description: string,
    category: string,
    floor: string,
    contact: string,
    ownerId: string,
    featured: boolean,
    createdAt: timestamp
}
```

#### Offers Collection
```javascript
{
    title: string,
    description: string,
    shopId: string,
    startDate: timestamp,
    endDate: timestamp,
    discount: number,
    createdAt: timestamp
}
```

#### Categories Collection
```javascript
{
    name: string,
    description: string
}
```

#### Floors Collection
```javascript
{
    name: string,
    description: string
}
```

### 3.2 Relationships
- Users -> Shops (One-to-Many)
- Shops -> Offers (One-to-Many)
- Categories -> Shops (One-to-Many)
- Floors -> Shops (One-to-Many)

## 4. Security Design

### 4.1 Authentication Flow
1. User Registration
   - Email/password validation
   - User data storage in Firestore
   - Session initialization

2. User Login
   - Credential verification
   - Session management
   - UI state update

3. User Logout
   - Session termination
   - UI state reset

### 4.2 Authorization Rules
```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read all shops and offers
    match /shops/{shopId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /offers/{offerId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Only authenticated users can access user data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## 5. User Flows

### 5.1 Shop Management
1. Add Shop
   - Open modal
   - Fill shop details
   - Submit form
   - Update UI

2. View Shops
   - Load shops list
   - Apply filters
   - View details

3. Filter Shops
   - Select category
   - Select floor
   - Update view

### 5.2 Offer Management
1. View Offers
   - Load current offers
   - Filter by shop
   - View details

2. Add Offer
   - Select shop
   - Enter offer details
   - Set validity period
   - Submit

## 6. Error Handling

### 6.1 Client-Side Errors
- Form validation
- Network errors
- Authentication errors
- Data loading errors

### 6.2 Server-Side Errors
- Database errors
- Authentication failures
- Permission errors
- Storage errors

### 6.3 Error Logging
- Error details capture
- User context
- Timestamp
- Stack trace

## 7. Performance Considerations

### 7.1 Frontend Optimization
- Lazy loading of images
- Efficient DOM updates
- Event delegation
- Debounced search/filter

### 7.2 Database Optimization
- Indexed queries
- Pagination
- Efficient data structure
- Caching strategies

## 8. Future Enhancements

### 8.1 Planned Features
- User reviews and ratings
- Shopping cart functionality
- Payment integration
- Admin dashboard
- Analytics integration

### 8.2 Scalability Considerations
- Database sharding
- Load balancing
- CDN integration
- Caching strategies 