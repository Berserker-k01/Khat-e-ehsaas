// public/js/write-letter.js

const letterForm = document.getElementById('letter-form');
const errorMessageDiv = document.getElementById('error-message');
const token = localStorage.getItem('token');
const textarea = document.getElementById('text');
const draftKey = 'letter-draft';

// Check authentication
if (!token) {
    window.location.href = '/login';
}

// Load draft on page load
const savedDraft = localStorage.getItem(draftKey);
if (savedDraft) {
    textarea.value = savedDraft;
    const charCountEl = document.getElementById('char-count');
    if (charCountEl) {
        charCountEl.textContent = savedDraft.length;
    }
}

// Save draft on input
textarea.addEventListener('input', () => {
    localStorage.setItem(draftKey, textarea.value);
});


// Main Form Submission Listener
letterForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Hide error message on new submission
    errorMessageDiv.innerText = '';
    errorMessageDiv.classList.add('hidden'); // Tailwind class

    const category = letterForm.category.value;
    const text = letterForm.text.value.trim();
    const submitBtn = letterForm.querySelector('button[type="submit"]');

    // Validation
    if (!text) {
        errorMessageDiv.innerText = 'S\'il te plaît, écris quelque chose avant d\'envoyer 💕';
        errorMessageDiv.classList.remove('hidden'); // Show error
        return;
    }

    if (text.length < 10) {
        errorMessageDiv.innerText = 'Ta lettre est trop courte. Écris au moins 10 caractères 💌';
        errorMessageDiv.classList.remove('hidden'); // Show error
        return;
    }

    // Disable button during submission
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Envoi en cours... <span class="animate-pulse">💕</span>';

    try {
        const response = await fetch('/api/letters/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ category, text })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to send letter');
        }

        // Clear the draft from local storage on success
        localStorage.removeItem(draftKey);

        // Show success animation
        if (typeof window.showSuccessAnimation === 'function') {
            window.showSuccessAnimation();
        } else {
            alert('Lettre envoyée avec succès ! 💌');
            window.location.href = '/letters';
        }

    } catch (error) {
        errorMessageDiv.innerText = error.message || 'Something went wrong. Please try again 💔';
        errorMessageDiv.classList.remove('hidden'); // Show error
        console.error('Error sending letter:', error);

        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Sceller et Envoyer la Lettre 🕊️';
    }
});