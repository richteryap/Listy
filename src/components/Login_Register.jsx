import { useState } from 'react';
import './Login_Register.css';

const Login_Register = () => {
    const [isSignUp, setIsSignUp] = useState(false);

    return (
        <div className='l-r-body'>
            <div className={`l-r-container ${isSignUp ? 'right-panel-active' : ''}`}>
                <div className='form-container sign-up'>
                    <form action='#'>
                        <h1>Create Account</h1>
                        <input type='text' className='user-text' placeholder='Username' required></input>
                        <input type='email' className='user-email' placeholder='Email' required></input>
                        <input type='password' className='user-password' placeholder='Password' required></input>
                        <button className='sign-up-btn'>Sign Up</button>
                    </form>
                </div>
                <div className='form-container sign-in'>
                    <form action='#'>
                        <h1>Sign In</h1>
                        <input type='email' className='user-email' placeholder='Email' required></input>
                        <input type='password' className='user-password' placeholder='Password' required></input>
                        <a href='#'>Forgot Password</a>
                        <button className='sign-up-btn'>Sign In</button>
                    </form>
                </div>
                <div className='overlay-container'>
                    <div className='overlay'>
                        <div className='overlay-panel overlay-left'>
                            <h1>Already have an Account?</h1>
                            <p>Hello!</p>
                            <button className='ghost-btn' onClick={() => setIsSignUp(false)}>Sign In</button>
                        </div>
                        <div className='overlay-panel overlay-right'>
                            <h1>Don't have an Account?</h1>
                            <p>Hi!</p>
                            <button className='ghost-btn' onClick={() => setIsSignUp(true)}>Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login_Register;