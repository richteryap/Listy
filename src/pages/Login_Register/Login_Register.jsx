import { useState } from 'react';
import { supabase } from '../../supabase.js';
import { getFriendlyErrorMessage } from '../../utils/authErrors.js';
import useAuthRedirect from '../../hooks/useAuthRedirect.js';
import './Login_Register.css';

const Login_Register = () => {
    useAuthRedirect();

    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const [siShowPassword, setsiShowPassword] = useState(false);
    const [suShowPassword, setsuShowPassword] = useState(false);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        display_name: username,
                    },
                },
            });

            if (error) throw error;
            alert("Account created! Check your inbox for a verification email.");
            setIsSignUp(false);
            setPassword('');
        } catch (error) {
            setError(getFriendlyErrorMessage(error.message || error.code));
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
        } catch (error) {
            setError(getFriendlyErrorMessage(error.message || error.code));
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!email) {
            alert("Please enter your email address first!");
            return;
        }
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) alert(error.message);
        else alert("Password reset email sent!");
    };

    return (
        <div className='l-r-body'>
            <div className={`l-r-container ${isSignUp ? 'right-panel-active' : ''}`}>
                {/* SIGN UP FORM */}
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
                        <button type='submit' className='sign-up-btn' disabled={loading}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>
                </div>

                {/* SIGN IN FORM */}
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
                        <button className='sign-in-btn' disabled={loading}>
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                </div>

                {/* OVERLAY PANEL */}
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