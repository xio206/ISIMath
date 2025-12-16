const button_darkmode = document.querySelector('.header__dark');

// Define theme names for consistency and to avoid typos
const THEME_LIGHT = 'light'; // Corrected spelling
const THEME_DARK = 'dark';

// Function to apply the light theme
const applyLightTheme = () => {
    document.body.classList.remove(THEME_DARK);
    localStorage.setItem('theme', THEME_LIGHT);
};

// Function to apply the dark theme
const applyDarkMode = () => {
    document.body.classList.add(THEME_DARK);
    localStorage.setItem('theme', THEME_DARK);
};

// Function to toggle between themes
const toggleTheme = () => {
    if (document.body.classList.contains(THEME_DARK)) {
        applyLightTheme();
        console.log('apply')
    } else {
        applyDarkMode();
        console.log('no xd apply')

    }
};

document.addEventListener('DOMContentLoaded', () => {
    // On load, check the stored theme and apply it
    const storedTheme = localStorage.getItem('theme');

    if (storedTheme === THEME_DARK) {
        applyDarkMode();
    } else {
        // Default to light mode if no theme is stored or if it's explicitly 'light'
        applyLightTheme();
    }

    // Add event listener to the dark mode button
    button_darkmode.addEventListener('click', toggleTheme);
});