# Super Mall - Test Cases Document

## 1. Authentication Test Cases

### 1.1 User Registration
```javascript
describe('User Registration', () => {
    test('should register new user with valid data', async () => {
        const userData = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        };
        const result = await register(userData);
        expect(result).toHaveProperty('uid');
    });

    test('should not register user with invalid email', async () => {
        const userData = {
            name: 'Test User',
            email: 'invalid-email',
            password: 'password123'
        };
        await expect(register(userData)).rejects.toThrow();
    });

    test('should not register user with weak password', async () => {
        const userData = {
            name: 'Test User',
            email: 'test@example.com',
            password: '123'
        };
        await expect(register(userData)).rejects.toThrow();
    });
});
```

### 1.2 User Login
```javascript
describe('User Login', () => {
    test('should login with valid credentials', async () => {
        const credentials = {
            email: 'test@example.com',
            password: 'password123'
        };
        const result = await login(credentials);
        expect(result).toHaveProperty('uid');
    });

    test('should not login with invalid credentials', async () => {
        const credentials = {
            email: 'test@example.com',
            password: 'wrongpassword'
        };
        await expect(login(credentials)).rejects.toThrow();
    });
});
```

## 2. Shop Management Test Cases

### 2.1 Add Shop
```javascript
describe('Add Shop', () => {
    test('should add shop with valid data', async () => {
        const shopData = {
            name: 'Test Shop',
            description: 'Test Description',
            category: 'Fashion',
            floor: 'Ground Floor',
            contact: 'test@shop.com'
        };
        const result = await addShop(shopData);
        expect(result).toHaveProperty('id');
    });

    test('should not add shop with missing required fields', async () => {
        const shopData = {
            name: 'Test Shop',
            // Missing required fields
        };
        await expect(addShop(shopData)).rejects.toThrow();
    });
});
```

### 2.2 View Shops
```javascript
describe('View Shops', () => {
    test('should load all shops', async () => {
        const shops = await loadShops();
        expect(Array.isArray(shops)).toBe(true);
    });

    test('should filter shops by category', async () => {
        const category = 'Fashion';
        const shops = await loadShops({ category });
        expect(shops.every(shop => shop.category === category)).toBe(true);
    });

    test('should filter shops by floor', async () => {
        const floor = 'Ground Floor';
        const shops = await loadShops({ floor });
        expect(shops.every(shop => shop.floor === floor)).toBe(true);
    });
});
```

## 3. Offer Management Test Cases

### 3.1 Add Offer
```javascript
describe('Add Offer', () => {
    test('should add offer with valid data', async () => {
        const offerData = {
            title: 'Test Offer',
            description: 'Test Description',
            shopId: 'shop123',
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000),
            discount: 20
        };
        const result = await addOffer(offerData);
        expect(result).toHaveProperty('id');
    });

    test('should not add offer with invalid dates', async () => {
        const offerData = {
            title: 'Test Offer',
            description: 'Test Description',
            shopId: 'shop123',
            startDate: new Date(),
            endDate: new Date(Date.now() - 86400000), // Past date
            discount: 20
        };
        await expect(addOffer(offerData)).rejects.toThrow();
    });
});
```

### 3.2 View Offers
```javascript
describe('View Offers', () => {
    test('should load current offers', async () => {
        const offers = await loadCurrentOffers();
        expect(Array.isArray(offers)).toBe(true);
        expect(offers.every(offer => offer.endDate > new Date())).toBe(true);
    });

    test('should load shop offers', async () => {
        const shopId = 'shop123';
        const offers = await loadShopOffers(shopId);
        expect(offers.every(offer => offer.shopId === shopId)).toBe(true);
    });
});
```

## 4. UI Test Cases

### 4.1 Navigation
```javascript
describe('Navigation', () => {
    test('should show login form for unauthenticated users', () => {
        render(<App />);
        expect(screen.getByText('Login')).toBeInTheDocument();
    });

    test('should show user profile for authenticated users', async () => {
        await login(credentials);
        render(<App />);
        expect(screen.getByText(userName)).toBeInTheDocument();
    });
});
```

### 4.2 Responsive Design
```javascript
describe('Responsive Design', () => {
    test('should render correctly on mobile', () => {
        window.innerWidth = 375;
        render(<App />);
        expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    });

    test('should render correctly on desktop', () => {
        window.innerWidth = 1024;
        render(<App />);
        expect(screen.getByTestId('desktop-menu')).toBeInTheDocument();
    });
});
```

## 5. Integration Test Cases

### 5.1 Complete User Flow
```javascript
describe('Complete User Flow', () => {
    test('should complete shop management flow', async () => {
        // Register
        const user = await register(userData);
        
        // Login
        await login(credentials);
        
        // Add Shop
        const shop = await addShop(shopData);
        
        // Add Offer
        const offer = await addOffer({
            ...offerData,
            shopId: shop.id
        });
        
        // View Shop with Offer
        const shopOffers = await loadShopOffers(shop.id);
        expect(shopOffers).toContainEqual(expect.objectContaining({
            id: offer.id
        }));
    });
});
```

### 5.2 Error Handling Flow
```javascript
describe('Error Handling Flow', () => {
    test('should handle network errors gracefully', async () => {
        // Simulate network error
        mockNetworkError();
        
        // Attempt to load shops
        const shops = await loadShops();
        expect(shops).toEqual([]);
        expect(screen.getByText('Network Error')).toBeInTheDocument();
    });

    test('should handle authentication errors gracefully', async () => {
        // Simulate auth error
        mockAuthError();
        
        // Attempt to login
        await expect(login(credentials)).rejects.toThrow();
        expect(screen.getByText('Authentication Error')).toBeInTheDocument();
    });
});
``` 