import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useClickOutside } from '../hooks/useClickOutside';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './Header.css'

const Header = () => {
    const location = useLocation();
    const isAccountPage = location.pathname.startsWith('/account');
    const [query, setQuery] = useState('');

    const [user, setUser] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const settingsRef = useClickOutside(() => {
        setIsSettingsOpen(false);
    });

    const profileRef = useClickOutside(() => {
        setIsProfileOpen(false);
    });

    const [isGridView, setIsGridView] = useState(() => {
        return localStorage.getItem('viewMode') === 'grid';
    });

    const [isDarkMode, setIsDarkMode] = useState(() => {
        return document.documentElement.classList.contains('dark-mode');
    })

    useEffect(() => {
        localStorage.setItem('viewMode', isGridView ? 'grid' : 'list');
    }, [isGridView]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setIsProfileOpen(false);
            window.location.reload();
        } catch (error) {
            console.error("Error logging out: ", error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        })
        return () => unsubscribe();
    }, [])

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    return (
        <div className='header-body'>
            <div className='header-left-content'>
                <div className='web-title' data-tooltip-text='Listy'>
                    <Link to='/' className='title-link'>
                        <img src="logo.png" alt="Logo" className="logo-img"/>
                        <span className='listy'>Listy</span>
                    </Link>
                </div>
                {!isAccountPage && (
                    <div className='search-bar'>
                        <input type='text' placeholder='Search' value={query} onChange={(e) => setQuery(e.target.value)}/>
                        {query && (
                            <i className="fa-solid fa-xmark" onClick={() => setQuery('')} aria-label="Clear search" role="button" data-tooltip-text='Clear search'></i>
                        )}
                        <i className="fa-solid fa-magnifying-glass" data-tooltip-text='Search'></i>
                    </div>
                )}
            </div>
            {!isAccountPage && (
                <div className='header-right-content'>
                    <div className='add-item'>
                        <button className="add-btn" aria-label="Add Item" data-tooltip-text='Add Item'>
                            <span><i className="fa-solid fa-plus"></i>Add Item</span>
                        </button>
                    </div>
                    <div className='h-r-center-content'>
                        <div className='view'>
                            <button className="view-btn" onClick={() => setIsGridView(!isGridView)} aria-label="View" data-tooltip-text='View'>
                                <i className={`fa-solid ${isGridView ? 'fa-list' : 'fa-th-large'}`}></i> 
                            </button>
                        </div>
                        <div className='settings' ref={settingsRef}>
                            <button className="setting-btn" onClick={() => setIsSettingsOpen(!isSettingsOpen)}  aria-label="Settings" data-tooltip-text='Settings'>
                                <i className="fa-solid fa-gear"></i>
                            </button>
                            {isSettingsOpen && (
                                <div className='settings-content'>
                                    <ul className='setting-dropdown'>
                                        <li onClick={() => {setIsDarkMode(!isDarkMode); setIsSettingsOpen(false);}}>
                                            <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                                            {isDarkMode ? "Light Mode" : "Dark Mode"}
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className='profile' ref={profileRef}>
                        <button className='profile-button' onClick={() => setIsProfileOpen(!isProfileOpen)} aria-label='Profile' data-tooltip-text='Profile'>
                            <i className='fa-solid fa-user'></i>
                        </button>
                        {isProfileOpen && (
                            <div className='profile-content'>
                                <ul className='profile-dropdown'>
                                    {user ? (
                                        <>
                                            <li>
                                                <i className='fa-solid fa-user'></i>
                                                {user.displayName || 'User'}
                                            </li>
                                            <Link to='/account' className='account-link'>
                                                <li onClick={() => {handleLogout(); setIsProfileOpen(false);}}>
                                                    <i className='fa-solid fa-sign-out'></i>
                                                    Logout
                                                </li>
                                            </Link>
                                        </>
                                    ) : (
                                        <Link to='/account' className='account-link'>
                                            <li onClick={() => {setIsProfileOpen(false);}}>
                                                <i className='fa-solid fa-sign-in'></i>
                                                Sign In
                                            </li>
                                        </Link>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Header;