// Main Application Module
class App {
    constructor() {
        this.db = firebase.firestore();
        this.auth = window.auth;
        this.logger = window.logger;
        this.imageHandler = window.imageHandler;
        this.setupEventListeners();
        this.checkAuthState();
    }

    setupEventListeners() {
        console.log('Setting up event listeners...'); // Debug log

        // Navigation links
        document.getElementById('homeLink').addEventListener('click', () => this.loadHome());
        document.getElementById('shopsLink').addEventListener('click', () => this.loadShops());
        document.getElementById('offersLink').addEventListener('click', () => this.loadOffers());
        
        // Auth buttons
        document.getElementById('loginBtn').addEventListener('click', () => this.showLoginModal());
        document.getElementById('registerBtn').addEventListener('click', () => this.showRegisterModal());
        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());
        
        // Login prompt buttons
        document.getElementById('promptLoginBtn').addEventListener('click', () => this.showLoginModal());
        document.getElementById('promptRegisterBtn').addEventListener('click', () => this.showRegisterModal());
        
        // Forms
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('addShopForm').addEventListener('submit', (e) => this.handleAddShop(e));
    }

    async checkAuthState() {
        try {
            await this.auth.checkAuthState();
            this.updateUIForAuth();
        } catch (error) {
            console.error('Error checking auth state:', error);
            this.updateUIForNoAuth();
        }
    }

    updateUIForAuth() {
        // Show main content, hide login prompt
        document.getElementById('mainContent').classList.remove('d-none');
        document.getElementById('loginPrompt').classList.add('d-none');
        
        // Show user profile, hide auth buttons
        document.getElementById('authButtons').classList.add('d-none');
        document.getElementById('userProfile').classList.remove('d-none');
        
        // Load initial content
        this.loadHome();
    }

    updateUIForNoAuth() {
        // Hide main content, show login prompt
        document.getElementById('mainContent').classList.add('d-none');
        document.getElementById('loginPrompt').classList.remove('d-none');
        
        // Show auth buttons, hide user profile
        document.getElementById('authButtons').classList.remove('d-none');
        document.getElementById('userProfile').classList.add('d-none');
    }

    async loadInitialContent() {
        try {
            await this.auth.checkAuthState();
            this.loadHome();
        } catch (error) {
            console.error('Error loading initial content:', error);
        }
    }

    async loadHome() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="row">
                <div class="col-md-12">
                    <h1 class="text-center mb-4">Welcome to Super Mall</h1>
                    <div class="row" id="featuredShops"></div>
                </div>
            </div>
        `;

        // Load featured shops
        this.loadFeaturedShops();
    }

    async loadShops() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="row mb-4">
                <div class="col">
                    <h2>Shops</h2>
                </div>
                ${this.auth.currentUser ? `
                    <div class="col text-end">
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addShopModal">
                            Add New Shop
                        </button>
                    </div>
                ` : ''}
            </div>
            <div class="row mb-4">
                <div class="col-md-4">
                    <select class="form-select" id="categoryFilter">
                        <option value="">All Categories</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <select class="form-select" id="floorFilter">
                        <option value="">All Floors</option>
                    </select>
                </div>
            </div>
            <div class="row" id="shopsList"></div>
        `;

        // Set up Add Shop button event listener
        const addShopBtn = document.querySelector('[data-bs-target="#addShopModal"]');
        console.log('Add Shop button:', addShopBtn); // Debug log
        if (addShopBtn) {
            addShopBtn.addEventListener('click', () => {
                console.log('Add Shop button clicked'); // Debug log
                this.showAddShopModal();
            });
        } else {
            console.error('Add Shop button not found'); // Debug log
        }

        // Load categories and floors for filters
        await this.loadCategories();
        await this.loadFloors();

        // Load shops
        await this.loadShopsList();

        // Add filter event listeners
        document.getElementById('categoryFilter').addEventListener('change', () => this.filterShops());
        document.getElementById('floorFilter').addEventListener('change', () => this.filterShops());
    }

    async loadOffers() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="row">
                <div class="col-md-12">
                    <h2 class="mb-4">Current Offers</h2>
                    <div class="row" id="offerList"></div>
                </div>
            </div>
        `;

        // Load current offers
        this.loadCurrentOffers();
    }

    async loadFeaturedShops() {
        try {
            const shopsSnapshot = await this.db.collection('shops')
                .where('featured', '==', true)
                .limit(6)
                .get();

            const featuredShopsContainer = document.getElementById('featuredShops');
            featuredShopsContainer.innerHTML = '';

            if (shopsSnapshot.empty) {
                featuredShopsContainer.innerHTML = '<p class="text-center">No featured shops available.</p>';
                return;
            }

            shopsSnapshot.forEach(doc => {
                const shop = doc.data();
                featuredShopsContainer.innerHTML += this.createShopCard(doc.id, shop);
            });
        } catch (error) {
            logger.error('Error loading featured shops', error);
            console.error('Error loading featured shops:', error);
        }
    }

    async loadShopsList(category = null, floor = null) {
        try {
            let query = this.db.collection('shops');

            if (category) {
                query = query.where('category', '==', category);
            }
            if (floor) {
                query = query.where('floor', '==', floor);
            }

            const shopsSnapshot = await query.get();
            const shopListContainer = document.getElementById('shopsList');
            shopListContainer.innerHTML = '';

            if (shopsSnapshot.empty) {
                shopListContainer.innerHTML = '<p class="text-center">No shops found matching your criteria.</p>';
                return;
            }

            shopsSnapshot.forEach(doc => {
                const shop = doc.data();
                shopListContainer.innerHTML += this.createShopCard(doc.id, shop);
            });
        } catch (error) {
            logger.error('Error loading shops list', error);
            console.error('Error loading shops list:', error);
        }
    }

    async loadCategories() {
        try {
            const categoriesSnapshot = await this.db.collection('categories').get();
            const categoryFilter = document.getElementById('categoryFilter');
            
            if (!categoryFilter) {
                console.error('Category filter element not found');
                return;
            }

            // Clear existing options except the first one
            while (categoryFilter.options.length > 1) {
                categoryFilter.remove(1);
            }

            if (categoriesSnapshot.empty) {
                console.log('No categories available');
                return;
            }

            categoriesSnapshot.forEach(doc => {
                const category = doc.data();
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                categoryFilter.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    async loadFloors() {
        try {
            const floorsSnapshot = await this.db.collection('floors').get();
            const floorFilter = document.getElementById('floorFilter');
            
            if (!floorFilter) {
                console.error('Floor filter element not found');
                return;
            }

            // Clear existing options except the first one
            while (floorFilter.options.length > 1) {
                floorFilter.remove(1);
            }

            if (floorsSnapshot.empty) {
                console.log('No floors available');
                return;
            }

            floorsSnapshot.forEach(doc => {
                const floor = doc.data();
                const option = document.createElement('option');
                option.value = floor.name;
                option.textContent = floor.name;
                floorFilter.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading floors:', error);
        }
    }

    async loadCurrentOffers() {
        try {
            const offersSnapshot = await this.db.collection('offers')
                .where('endDate', '>', firebase.firestore.Timestamp.now())
                .get();

            const offerListContainer = document.getElementById('offerList');
            offerListContainer.innerHTML = '';

            offersSnapshot.forEach(doc => {
                const offer = doc.data();
                offerListContainer.innerHTML += this.createOfferCard(doc.id, offer);
            });
        } catch (error) {
            logger.error('Error loading current offers', error);
        }
    }

    createShopCard(shopId, shop) {
        // Get image based on category
        const categoryImage = shop.category.toLowerCase().replace(/\s+/g, '-');
        const imagePath = `images/${categoryImage}.jpg`;

        return `
            <div class="col-md-4 mb-4">
                <div class="card shop-card">
                    <div class="card-img-top" style="height: 200px; background-color: #f8f9fa; display: flex; align-items: center; justify-content: center;">
                        <img src="${imagePath}" alt="${shop.name}" style="max-height: 100%; max-width: 100%; object-fit: cover;" onerror="this.src='images/default.jpg'">
                    </div>
                    ${shop.hasOffer ? '<div class="offer-badge">Special Offer</div>' : ''}
                    <div class="card-body">
                        <h5 class="card-title">${shop.name}</h5>
                        <p class="card-text">${shop.description}</p>
                        <p class="card-text"><small class="text-muted">Floor: ${shop.floor}</small></p>
                        <button class="btn btn-primary" onclick="app.viewShopDetails('${shopId}')">View Details</button>
                    </div>
                </div>
            </div>
        `;
    }

    createOfferCard(offerId, offer) {
        return `
            <div class="col-md-4 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${offer.title}</h5>
                        <p class="card-text">${offer.description}</p>
                        <p class="card-text">
                            <small class="text-muted">
                                Valid until: ${offer.endDate.toDate().toLocaleDateString()}
                            </small>
                        </p>
                        <button class="btn btn-primary" onclick="app.viewOfferDetails('${offerId}')">View Details</button>
                    </div>
                </div>
            </div>
        `;
    }

    async viewShopDetails(shopId) {
        try {
            const shopDoc = await this.db.collection('shops').doc(shopId).get();
            if (!shopDoc.exists) {
                throw new Error('Shop not found');
            }

            const shop = shopDoc.data();
            // Get image based on category
            const categoryImage = shop.category.toLowerCase().replace(/\s+/g, '-');
            const imagePath = `images/${categoryImage}.jpg`;

            const mainContent = document.getElementById('mainContent');
            mainContent.innerHTML = `
                <div class="row">
                    <div class="col-md-12">
                        <h2>${shop.name}</h2>
                        <div class="row">
                            <div class="col-md-6">
                                <div style="height: 300px; background-color: #f8f9fa; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
                                    <img src="${imagePath}" alt="${shop.name}" style="max-height: 100%; max-width: 100%; object-fit: cover;" onerror="this.src='images/default.jpg'">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <p>${shop.description}</p>
                                <p><strong>Floor:</strong> ${shop.floor}</p>
                                <p><strong>Category:</strong> ${shop.category}</p>
                                <p><strong>Contact:</strong> ${shop.contact}</p>
                            </div>
                        </div>
                        <div class="row mt-4">
                            <div class="col-md-12">
                                <h3>Current Offers</h3>
                                <div class="row" id="shopOffers"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Load shop's offers
            await this.loadShopOffers(shopId);
        } catch (error) {
            console.error('Error viewing shop details:', error);
            alert('Error loading shop details: ' + error.message);
        }
    }

    async loadShopOffers(shopId) {
        try {
            // Create a composite index for the query
            const offersSnapshot = await this.db.collection('offers')
                .where('shopId', '==', shopId)
                .where('endDate', '>', firebase.firestore.Timestamp.now())
                .orderBy('endDate', 'asc')
                .get();

            const shopOffersContainer = document.getElementById('shopOffers');
            if (!shopOffersContainer) {
                console.error('Shop offers container not found');
                return;
            }

            shopOffersContainer.innerHTML = '';

            if (offersSnapshot.empty) {
                shopOffersContainer.innerHTML = '<div class="col-12"><p>No current offers available.</p></div>';
                return;
            }

            offersSnapshot.forEach(doc => {
                const offer = doc.data();
                shopOffersContainer.innerHTML += this.createOfferCard(doc.id, offer);
            });
        } catch (error) {
            console.error('Error loading shop offers:', error);
            if (error.code === 'failed-precondition') {
                // If the index doesn't exist, show a message to the user
                const shopOffersContainer = document.getElementById('shopOffers');
                if (shopOffersContainer) {
                    shopOffersContainer.innerHTML = `
                        <div class="col-12">
                            <p>Please wait while we set up the offers display. This may take a few minutes.</p>
                        </div>
                    `;
                }
            }
        }
    }

    async viewOfferDetails(offerId) {
        try {
            const offerDoc = await this.db.collection('offers').doc(offerId).get();
            if (!offerDoc.exists) {
                throw new Error('Offer not found');
            }

            const offer = offerDoc.data();
            const shopDoc = await this.db.collection('shops').doc(offer.shopId).get();
            const shop = shopDoc.data();

            const mainContent = document.getElementById('mainContent');
            mainContent.innerHTML = `
                <div class="row">
                    <div class="col-md-12">
                        <h2>${offer.title}</h2>
                        <div class="row">
                            <div class="col-md-6">
                                <p>${offer.description}</p>
                                <p><strong>Valid until:</strong> ${offer.endDate.toDate().toLocaleDateString()}</p>
                                <p><strong>Shop:</strong> ${shop.name}</p>
                                <p><strong>Location:</strong> Floor ${shop.floor}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            logger.error('Error viewing offer details', error);
            alert('Error loading offer details: ' + error.message);
        }
    }

    async handleAddShop(e) {
        e.preventDefault();
        try {
            const shopData = {
                name: document.getElementById('shopName').value,
                description: document.getElementById('shopDescription').value,
                category: document.getElementById('shopCategory').value,
                floor: document.getElementById('shopFloor').value,
                contact: document.getElementById('shopContact').value,
                ownerId: this.auth.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // Add shop to Firestore
            const shopRef = await firebase.firestore().collection('shops').add(shopData);

            // Close modal and clear form
            const modal = document.getElementById('addShopModal');
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
                modalInstance.hide();
            }
            e.target.reset();

            // Refresh shops list
            await this.loadShops();

            this.logger.logInfo('Shop added successfully', { shopId: shopRef.id });
            alert('Shop added successfully!');
        } catch (error) {
            this.logger.logError('Error adding shop', error);
            alert('Error adding shop: ' + error.message);
        }
    }

    showLoginModal() {
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
    }

    showRegisterModal() {
        const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
        registerModal.show();
    }

    async handleLogin(e) {
        e.preventDefault();
        try {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            await this.auth.login(email, password);
            
            // Close modal and clear form
            const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            modal.hide();
            e.target.reset();

            // Update UI for authenticated user
            this.updateUIForAuth();
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed: ' + error.message);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        try {
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            
            await this.auth.register(name, email, password);
            
            // Close modal and clear form
            const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            modal.hide();
            e.target.reset();

            // Update UI for authenticated user
            this.updateUIForAuth();
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed: ' + error.message);
        }
    }

    async handleLogout() {
        try {
            await this.auth.logout();
            this.updateUIForNoAuth();
        } catch (error) {
            console.error('Logout error:', error);
            alert('Logout failed: ' + error.message);
        }
    }

    async filterShops() {
        const category = document.getElementById('categoryFilter').value;
        const floor = document.getElementById('floorFilter').value;
        await this.loadShopsList(category, floor);
    }

    showAddShopModal() {
        console.log('Showing Add Shop modal...'); // Debug log
        const addShopModal = new bootstrap.Modal(document.getElementById('addShopModal'));
        
        // Load categories and floors before showing the modal
        Promise.all([
            this.loadCategoriesForModal(),
            this.loadFloorsForModal()
        ]).then(() => {
            console.log('Categories and floors loaded successfully'); // Debug log
            addShopModal.show();
        }).catch(error => {
            console.error('Error loading modal data:', error);
            addShopModal.show();
        });
    }

    async loadCategoriesForModal() {
        console.log('Loading categories...'); // Debug log
        try {
            const categoriesSnapshot = await this.db.collection('categories').get();
            console.log('Categories snapshot:', categoriesSnapshot); // Debug log
            
            const categorySelect = document.getElementById('shopCategory');
            console.log('Category select element:', categorySelect); // Debug log
            
            if (!categorySelect) {
                console.error('Category select element not found');
                return;
            }

            // Clear existing options except the first one
            while (categorySelect.options.length > 1) {
                categorySelect.remove(1);
            }

            if (categoriesSnapshot.empty) {
                console.log('No categories available');
                return;
            }

            // Debug: Log all category documents
            categoriesSnapshot.forEach(doc => {
                console.log('Category document ID:', doc.id);
                console.log('Category data:', doc.data());
            });

            // Add categories to select
            categoriesSnapshot.forEach(doc => {
                const category = doc.data();
                if (category && category.name) {
                    const option = document.createElement('option');
                    option.value = category.name;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                    console.log('Added category option:', category.name); // Debug log
                } else {
                    console.warn('Category missing name field:', category); // Debug log
                }
            });
        } catch (error) {
            console.error('Error loading categories for modal:', error);
        }
    }

    async loadFloorsForModal() {
        console.log('Loading floors...'); // Debug log
        try {
            const floorsSnapshot = await this.db.collection('floors').get();
            console.log('Floors snapshot:', floorsSnapshot); // Debug log
            
            const floorSelect = document.getElementById('shopFloor');
            console.log('Floor select element:', floorSelect); // Debug log
            
            if (!floorSelect) {
                console.error('Floor select element not found');
                return;
            }

            // Clear existing options except the first one
            while (floorSelect.options.length > 1) {
                floorSelect.remove(1);
            }

            if (floorsSnapshot.empty) {
                console.log('No floors available');
                return;
            }

            // Debug: Log all floor documents
            floorsSnapshot.forEach(doc => {
                console.log('Floor document ID:', doc.id);
                console.log('Floor data:', doc.data());
            });

            // Add floors to select
            floorsSnapshot.forEach(doc => {
                const floor = doc.data();
                if (floor && floor.name) {
                    const option = document.createElement('option');
                    option.value = floor.name;
                    option.textContent = floor.name;
                    floorSelect.appendChild(option);
                    console.log('Added floor option:', floor.name); // Debug log
                } else {
                    console.warn('Floor missing name field:', floor); // Debug log
                }
            });
        } catch (error) {
            console.error('Error loading floors for modal:', error);
        }
    }
}

// Initialize App
window.app = new App(); 