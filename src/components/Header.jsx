import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useClickOutside } from '../hooks/useClickOutside';
import './Header.css'

const Header = () => {
    const location = useLocation();
    const isAccountPage = location.pathname.startsWith('/account');

    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');

    const menuRef = useClickOutside(() => {
        setIsOpen(false);
    });

    const toggleDropdown = () => { setIsOpen(!isOpen); };

    const [isGridView, setIsGridView] = useState(() => {
        return localStorage.getItem('viewMode') === 'grid';
    });

    useEffect(() => {
        localStorage.setItem('viewMode', isGridView ? 'grid' : 'list');
    }, [isGridView]);

    const [isDarkMode, setIsDarkMode] = useState(() => {
        return document.documentElement.classList.contains('dark-mode');
    })

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
                        <div className='settings'>
                            <button className="setting-btn" onClick={toggleDropdown}  aria-label="Settings" data-tooltip-text='Settings' ref={menuRef}>
                                <i className="fa-solid fa-gear"></i>
                            </button>
                            {isOpen && (
                                <div className='settings-content'>
                                    <ul className='dropdown-menu'>
                                        <li onClick={() => {setIsDarkMode(!isDarkMode); setIsOpen(false);}}>
                                            <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                                            {isDarkMode ? "Light Mode" : "Dark Mode"}
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className='profile'>
                        <button className='profile-button' aria-label='Profile' data-tooltip-text='Profile'>
                            <i className='fa-solid fa-user'></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Header;