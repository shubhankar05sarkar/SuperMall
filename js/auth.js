// Authentication Module
class Auth {
    constructor() {
        this.auth = firebase.auth();
        this.db = firebase.firestore();
        this.currentUser = null;
        this.setupAuthStateListener();
        this.setupEventListeners();
    }

    setupAuthStateListener() {
        this.auth.onAuthStateChanged(async (user) => {
            if (user) {
                // Get user data from Firestore
                const userDoc = await this.db.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    this.currentUser = {
                        ...user,
                        name: userDoc.data().name
                    };
                    // Update UI with user's name
                    document.getElementById('userName').textContent = userDoc.data().name;
                }
            } else {
                this.currentUser = null;
                document.getElementById('userName').textContent = '';
            }
        });
    }

    updateUI() {
        const authButtons = document.getElementById('authButtons');
        const userProfile = document.getElementById('userProfile');
        const userName = document.getElementById('userName');

        if (this.currentUser) {
            authButtons.classList.add('d-none');
            userProfile.classList.remove('d-none');
            userName.textContent = this.currentUser.name || this.currentUser.email;
        } else {
            authButtons.classList.remove('d-none');
            userProfile.classList.add('d-none');
        }
    }

    async checkAuthState() {
        return new Promise((resolve, reject) => {
            const unsubscribe = this.auth.onAuthStateChanged(async (user) => {
                unsubscribe();
                if (user) {
                    try {
                        // Get user data from Firestore
                        const userDoc = await this.db.collection('users').doc(user.uid).get();
                        if (userDoc.exists) {
                            this.currentUser = {
                                ...user,
                                name: userDoc.data().name
                            };
                            // Update UI with user's name
                            document.getElementById('userName').textContent = userDoc.data().name;
                        }
                        resolve(user);
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    this.currentUser = null;
                    document.getElementById('userName').textContent = '';
                    reject(new Error('No user logged in'));
                }
            });
        });
    }

    async login(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            
            // Get user data from Firestore
            const userDoc = await this.db.collection('users').doc(userCredential.user.uid).get();
            if (userDoc.exists) {
                this.currentUser = {
                    ...userCredential.user,
                    name: userDoc.data().name
                };
                // Update UI with user's name
                document.getElementById('userName').textContent = userDoc.data().name;
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async register(name, email, password) {
        try {
            // Create user in Firebase Auth
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            
            // Add user data to Firestore
            await this.db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                role: 'user',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            this.currentUser = {
                ...userCredential.user,
                name: name
            };
            
            // Update UI with user's name
            document.getElementById('userName').textContent = name;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async logout() {
        try {
            await this.auth.signOut();
            this.currentUser = null;
            document.getElementById('userName').textContent = '';
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Login form submission
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Register form submission
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });

        // Login button click
        document.getElementById('loginBtn').addEventListener('click', () => {
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
        });

        // Register button click
        document.getElementById('registerBtn').addEventListener('click', () => {
            const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
            registerModal.show();
        });

        // Logout button click
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });
    }
}

// Initialize Auth
window.auth = new Auth(); 