import { useState, useEffect } from 'react';
import './Header.css'

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');

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
                    <img src="logo.png" alt="Logo" className="logo-img"/>
                    <span className='listy'>Listy</span>
                </div>
                <div className='search-bar'>
                    <input type='text' placeholder='Search' value={query} onChange={(e) => setQuery(e.target.value)}/>
                    {query && (
                        <i className="fa-solid fa-xmark" onClick={() => setQuery('')} aria-label="Clear search" role="button"></i>
                    )}
                    <i className="fa-solid fa-magnifying-glass"></i>
                </div>
            </div>
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
                        <button className="setting-btn" onClick={toggleDropdown}  aria-label="Settings" data-tooltip-text='Settings'>
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
                    <h1>Profile</h1>
                </div>
            </div>
        </div>
    )
}

export default Header;