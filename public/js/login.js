const loginForm = document.getElementById('login-form');
const errorMessageDiv = document.getElementById('error-message');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const username = loginForm.username.value.trim();
    const password = loginForm.password.value.trim();
    
    // Clear previous errors
    errorMessageDiv.innerText = '';

    // Basic validation
    if (!username || !password) {
        errorMessageDiv.innerText = 'Please fill in all fields';
        return;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        // ✨ TRIGGER HEARTS CONNECTION ANIMATION ✨
        if (typeof window.celebrateLogin === 'function') {
            window.celebrateLogin();
        }
        
        // Redirect after animation completes (6.5 seconds)
        setTimeout(() => {
            const redirectUrl = data.user.partnerId ? '/letters' : '/dashboard';
            window.location.href = redirectUrl;
        }, 6500);
        
    } catch (error) {
        errorMessageDiv.innerText = error.message || 'Something went wrong. Please try again.';
        console.error('Login error:', error);
    }
});

// Optional: Add Enter key support for better UX
loginForm.querySelectorAll('input').forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
});
