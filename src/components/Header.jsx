import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useClickOutside } from '../hooks/useClickOutside';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import AddNote from './AddNote/AddNote.jsx';
import './Header.css'

const Header = () => {
    const location = useLocation();
    const isAccountPage = location.pathname.startsWith('/account');

    const [user] = useAuthState(auth);

    const [query, setQuery] = useState('');
    const [isAddItemOpen, setIsAddItemOpen] = useState(false);
    const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const addItemRef = useClickOutside(() => { setIsAddItemOpen(false); });
    const moreRef = useClickOutside(() => { setIsMoreOpen(false); });
    const settingsRef = useClickOutside(() => { setIsSettingsOpen(false); });
    const profileRef = useClickOutside(() => { setIsProfileOpen(false); });

    const [isGridView, setIsGridView] = useState(() => {
        return localStorage.getItem('viewMode') === 'grid';
    });

    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    })

    useEffect(() => {
        localStorage.setItem('viewMode', isGridView ? 'grid' : 'list');
    }, [isGridView]);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setIsProfileOpen(false);
        } catch (error) {
            console.error("Error logging out: ", error);
        }
    };

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
                    <div className='add-item' ref={addItemRef}>
                        <button className="add-btn" onClick={() => setIsAddItemOpen(!isAddItemOpen)} aria-label="Add Item" data-tooltip-text='Add Item'>
                            <span><i className="fa-solid fa-plus"></i>Add Item</span>
                        </button>
                        {isAddItemOpen && (
                            <div className='add-item-content'>
                                <ul className='add-item-dropdown'>
                                    <li onClick={() => {setIsAddItemOpen(false); setIsAddNoteOpen(true);}}>
                                        <i className="fa-solid fa-sticky-note"></i>
                                        Add Note
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className='h-r-center-content'>
                        <div className='more' ref={moreRef}>
                            <button className="more-btn" onClick={() => setIsMoreOpen(!isMoreOpen)} aria-label="More" data-tooltip-text='More'>
                                <i className="fa-solid fa-ellipsis"></i>
                            </button>
                            {isMoreOpen && (
                                <div className='more-content'>
                                    <ul className='more-dropdown'>
                                        <li onClick={()=> {setIsMoreOpen(false);}}>
                                            <i className="fa-solid fa-box-archive"></i>
                                            Archive
                                        </li>
                                        <li onClick={()=> {setIsMoreOpen(false);}}>
                                            <i className="fa-solid fa-trash"></i>
                                            Trash
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
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
                            {user?.photoURL ? <img src={user.photoURL} alt="Profile" /> : <i className='fa-solid fa-user'></i>}
                        </button>
                        {isProfileOpen && user && (
                            <div className='profile-content'>
                                <ul className='profile-dropdown'>
                                    <li>
                                        <i className='fa-solid fa-user'></i>
                                        {user.displayName || 'User'}
                                    </li>
                                    <li onClick={handleLogout}>
                                        <i className='fa-solid fa-right-from-bracket'></i>
                                        Logout
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isAddNoteOpen && (
                <AddNote onClose={() => setIsAddNoteOpen(false)} />
            )}
        </div>
    )
}

export default Header;