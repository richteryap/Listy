export const getFriendlyErrorMessage = (errorCode) => {
    switch (errorCode) {
        // Sign Up specific
        case 'auth/email-already-in-use':
            return "This email is already registered. Try signing in.";
        case 'auth/weak-password':
            return "Password should be at least 6 characters.";
        
        // Sign In specific
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return "Incorrect email or password.";
            
        // General errors
        case 'auth/invalid-email':
            return "Please enter a valid email address.";
        case 'auth/too-many-requests':
            return "Too many failed attempts. Please wait a moment.";
        case 'auth/network-request-failed':
            return "Network error. Check your internet connection.";
        default:
            return "An unexpected error occurred. Please try again.";
    }
};