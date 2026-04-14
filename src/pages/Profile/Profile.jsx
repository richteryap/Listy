import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabase';
import './Profile.css';

const Profile = () => {
    const { user, profile } = useAuth();
    
    // UI States
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Form States
    const [editUsername, setEditUsername] = useState('');
    const [editBirthday, setEditBirthday] = useState('');

    // Pre-fill the form when the profile loads
    useEffect(() => {
        if (profile) {
            setEditUsername(profile.username || '');
            setEditBirthday(profile.birthday || ''); // Requires adding 'birthday' to DB
        }
    }, [profile]);

    const handleSaveProfile = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    username: editUsername,
                    birthday: editBirthday,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;
            
            setIsEditing(false);
            // Refresh the page to allow AuthContext to fetch the new profile data
            window.location.reload(); 
        } catch (error) {
            console.error("Error updating profile:", error.message);
            alert("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleRequestPasswordReset = async () => {
        if (!user?.email) return;
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                redirectTo: `${window.location.origin}/account`,
            });
            if (error) throw error;
            alert("A password reset link has been sent to your email!");
        } catch (error) {
            console.error("Error resetting password:", error.message);
        }
    };

    return (
        <div className="profile-body">
            <div className="profile-content">
                <div className="profile-image">
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile Avatar" />
                    ) : (
                        <i className='fa-solid fa-user'></i>
                    )}
                </div>
                
                <div className="profile-personal-details">
                    {isEditing ? (
                        <div className="profile-edit-form">
                            <label>Username</label>
                            <input 
                                type="text" 
                                value={editUsername} 
                                onChange={(e) => setEditUsername(e.target.value)} 
                            />
                            <label>Birthday</label>
                            <input 
                                type="date" 
                                value={editBirthday} 
                                onChange={(e) => setEditBirthday(e.target.value)} 
                            />
                            <div className="profile-action-buttons">
                                <button className="profile-save-info" onClick={handleSaveProfile} disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button className="profile-cancel-info" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="profile-username">
                                {profile?.username || 'Guest User'}
                            </h2>
                            <p className="profile-email">
                                <strong>Email:</strong> {user?.email}
                            </p>
                            {profile?.birthday ? (
                                <p className="profile-birthday">
                                    <strong>Birthday:</strong> {new Date(profile.birthday).toLocaleDateString()}
                                </p>
                            ) : (
                                <p className="profile-birthday">
                                    <strong>Birthday:</strong> Input Your Birthday
                                </p>
                            )}
                            <button className="profile-edit-info" onClick={() => setIsEditing(true)}> 
                                Edit Profile
                            </button>
                            <button className="profile-reset-pass-btn" onClick={handleRequestPasswordReset}>
                                Change Password
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;