import { useState } from 'react';
import { auth } from '../firebase.js';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail, sendEmailVerification } from "firebase/auth";
import { getFriendlyErrorMessage } from '../utils/authErrors.js';
import useAuthRedirect from '../hooks/useAuthRedirect.js';
import './Login_Register.css';

const Login_Register = () => {
    useAuthRedirect('/');

    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const [siShowPassword, setsiShowPassword] = useState(false);
    const [suShowPassword, setsuShowPassword] = useState(false);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: username });

            await sendEmailVerification(user);

            alert("Account created! We sent you a verification email. Please check your inbox.");
            
            console.log("Success!");
            navigate('/');
        } catch (error) {
            console.log("Full Error:", error.code);
            setError(getFriendlyErrorMessage(error.code));
        }
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Login Successful!");
            navigate('/');

        } catch (error) {
            console.log("Full Error:", error.code);
            setError(getFriendlyErrorMessage(error.code));
        }
    };

    const handleResetPassword = async () => {
        if (!email) {
            alert("Please enter your email address first!");
            return;
        }
        
        try {
            await sendPasswordResetEmail(auth, email);
            alert("Password reset email sent! Check your inbox.");
        } catch (error) {
            console.error("Reset Error:", error.code);
            alert(error.message); 
        }
    };

    return (
        <div className='l-r-body'>
            <div className={`l-r-container ${isSignUp ? 'right-panel-active' : ''}`}>
                <div className='form-container sign-up'>
                    <form onSubmit={handleSignUp}>
                        <h1>Create Account</h1>
                        <input type='text' className='user-text' placeholder='Username' value={username} onChange={(e) => setUsername(e.target.value)} required></input>
                        <input type='email' className='user-email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} required></input>
                        <div className='password-container'>
                            <input type={suShowPassword ? 'text' : 'password'} className='user-password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} required></input>
                            <button type='button' className='see-unsee' onClick={() => setsuShowPassword(!suShowPassword)} aria-label='su-see-unsee'>
                                <i className={suShowPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'}></i>
                            </button>
                        </div>
                        {error && (
                            <div className="error-message">
                                <i className="fa-solid fa-circle-exclamation"></i> {error}
                            </div>
                        )}
                        <button type='submit' className='sign-up-btn'>Sign Up</button>
                    </form>
                </div>
                <div className='form-container sign-in'>
                    <form onSubmit={handleSignIn}>
                        <h1>Sign In</h1>
                        <input type='email' className='user-email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} required></input>
                        <div className='password-container'>
                            <input type={siShowPassword ? 'text' : 'password'} className='user-password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} required></input>
                            <button type='button' className='see-unsee' onClick={() => setsiShowPassword(!siShowPassword)} aria-label='si-see-unsee'>
                                <i className={siShowPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'}></i>
                            </button>
                        </div>
                        {error && (
                            <div className="error-message">
                                <i className="fa-solid fa-circle-exclamation"></i> {error}
                            </div>
                        )}
                        <button type="button" className="forgot-pass-btn" onClick={handleResetPassword}>Forgot Password?</button>
                        <button className='sign-in-btn'>Sign In</button>
                    </form>
                </div>
                <div className='overlay-container'>
                    <div className='overlay'>
                        <div className='overlay-panel overlay-left'>
                            <h1>Already have an Account?</h1>
                            <p>Hello!</p>
                            <button type='button' className='ghost-btn' onClick={() => setIsSignUp(false)}>Sign In</button>
                        </div>
                        <div className='overlay-panel overlay-right'>
                            <h1>Don't have an Account?</h1>
                            <p>Hi!</p>
                            <button type='button' className='ghost-btn' onClick={() => setIsSignUp(true)}>Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login_Register;