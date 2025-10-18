(function() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (user) {
            // Agar user logged in hai aur connected hai
            if (user.partnerId) {
                // To usko seedha /letters page par bhej do
                if (window.location.pathname !== '/letters' && window.location.pathname !== '/write-letter') {
                    window.location.href = '/letters';
                }
            } 
            // Agar sirf logged in hai, par connected nahi
            else {
                if (window.location.pathname !== '/dashboard') {
                    window.location.href = '/dashboard';
                }
            }
        }
    } catch (e) {
        // Agar localStorage mein kuch galat data hai to usko saaf kardo
        localStorage.clear();
    }
})();