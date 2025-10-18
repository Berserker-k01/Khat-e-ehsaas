const signupForm = document.getElementById('signup-form');
const errorMessageDiv = document.getElementById('error-message');

signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = signupForm.username.value;
    const password = signupForm.password.value;
    errorMessageDiv.innerText = '';

    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        alert('Account created successfully! Please log in to continue.');
        window.location.href = '/login';
    } catch (error) {
        errorMessageDiv.innerText = error.message;
    }
});