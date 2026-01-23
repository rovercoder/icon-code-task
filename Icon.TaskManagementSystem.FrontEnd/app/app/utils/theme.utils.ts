/**
 * Utility functions to handle theme detection and updates
 */

// Function to initialize and watch for system theme changes
export function initializeThemeWatcher(): () => void {
    // Check current system preference
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Apply the appropriate class to the document element
    updateDocumentTheme(isDarkMode);

    // Watch for changes to the system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
        updateDocumentTheme(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    // Return cleanup function
    return () => {
        mediaQuery.removeEventListener('change', handleChange);
    };
}

// Function to update the document's theme class
function updateDocumentTheme(isDark: boolean) {
    if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
    } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'normal';
    }
}
