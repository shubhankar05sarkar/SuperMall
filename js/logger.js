// Logger Module
class Logger {
    constructor() {
        this.db = window.db;
    }

    async log(action, details = {}) {
        const logEntry = {
            action,
            details,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            user: window.auth.currentUser ? window.auth.currentUser.uid : 'anonymous'
        };

        try {
            // Log to console
            console.log(`[${new Date().toISOString()}] ${action}:`, details);

            // Log to Firestore
            await this.db.collection('logs').add(logEntry);
        } catch (error) {
            console.error('Error logging to Firestore:', error);
        }
    }

    async error(action, error) {
        const errorDetails = {
            message: error.message,
            stack: error.stack,
            code: error.code
        };

        try {
            // Log to console
            console.error(`[${new Date().toISOString()}] ${action}:`, errorDetails);

            // Log to Firestore
            await this.db.collection('logs').add({
                action,
                type: 'error',
                details: errorDetails,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                user: window.auth.currentUser ? window.auth.currentUser.uid : 'anonymous'
            });
        } catch (err) {
            console.error('Error logging error to Firestore:', err);
        }
    }
}

// Initialize Logger
const logger = new Logger(); 