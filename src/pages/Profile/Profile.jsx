import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios.js';
import './Profile.css';

const Profile = () => {
    const { user, profile } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [editUsername, setEditUsername] = useState('');
    const [editBirthday, setEditBirthday] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    // Pre-fill the form when the profile loads
    useEffect(() => {
        if (profile) {
            setEditUsername(profile.username || '');
            setEditBirthday(profile.birthday || '');
        }
    }, [profile]);

    const handleSaveProfile = async () => {
        if (!user) return;
        setLoading(true);

        try {
            await api.put('/auth/profile/', {
                username: editUsername,
                birthday: editBirthday ? editBirthday : null,
            });

            setIsEditing(false);
            window.location.reload();
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    const saveNewPassword = async () => {
        if (newPassword.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        setPasswordLoading(true);
        try {
            await api.post('/auth/change-password/', {
                new_password: newPassword
            });

            alert("Password updated successfully!");
            setIsChangingPassword(false);
            window.location.reload();
            setNewPassword('');
        } catch (error) {
            console.error("Error updating password:", error.response?.data || error);
            alert("Failed to update password");
        } finally {
            setPasswordLoading(false);
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
                            {isChangingPassword ? (
                                <div className="profile-edit-password">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <div className="profile-action-buttons">
                                        <button className="profile-save-info" onClick={saveNewPassword} disabled={loading}>
                                            {passwordLoading ? 'Saving...' : 'Save Password'}
                                        </button>
                                        <button className="profile-cancel-info" onClick={() => {
                                            setIsChangingPassword(false);
                                            setNewPassword('');
                                        }}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button className="profile-reset-pass-btn" onClick={() => setIsChangingPassword(true)}>
                                    Change Password
                                </button>
                            )}
                            <div className="profile-action-buttons">
                                <button className="profile-save-info" onClick={handleSaveProfile} disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button className="profile-cancel-info" onClick={() => { setIsEditing(false); setIsChangingPassword(false); }}>
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
                                    <strong>Birthday:</strong> No Birthday
                                </p>
                            )}
                            <button className="profile-edit-info" onClick={() => setIsEditing(true)}>
                                Edit Profile
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;