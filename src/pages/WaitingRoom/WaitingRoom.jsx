import { auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut, sendEmailVerification } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './WaitingRoom.css';

const WaitingRoom = () => {
    const [user, loading] = useAuthState(auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.emailVerified) {
            navigate('/');
        }
        if (!loading && !user) {
            navigate('/account');
        }
    }, [user, loading, navigate]);

    const handleResendEmail = async () => {
        try {
            await sendEmailVerification(user);
            alert("Email sent!");
        } catch (error) {
            alert("Error sending email: " + error.message);
        }
    };

    if (loading) return null;

    return (
        <div className="verify-container">
            <div className="verify-box">
                <i className="fa-solid fa-envelope-open-text verify-icon"></i>
                <h1>Verify your Email</h1>
                <p>We sent a verification link to:</p>
                <span className="user-email-display">{user?.email}</span>
                <p>Please check your inbox (and spam folder) to proceed.</p>
                
                <div className="verify-actions">
                    <button className="refresh-btn" onClick={() => window.location.reload()}>
                        <i className="fa-solid fa-rotate-right"></i> I have verified it
                    </button>
                    
                    <button className="resend-btn" onClick={handleResendEmail}>
                        Resend Email
                    </button>
                </div>

                <div className="verify-footer">
                    <p>Entered the wrong email?</p>
                    <button className="logout-link" onClick={() => signOut(auth)}>
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WaitingRoom;