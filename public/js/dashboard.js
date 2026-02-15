// public/js/dashboard.js
// ============ DASHBOARD.JS - COMPLETE UPDATED ============
// NOTE: Automatic connection ka logic ab 'global-sockets.js' mein hai

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    // Redirect if not authenticated
    if (!token || !user) {
        window.location.href = '/login';
        return;
    }

    // ============ DOM ELEMENTS ============
    const usernameSpan = document.getElementById('username');
    const connectionCodeP = document.getElementById('connection-code');
    const connectForm = document.getElementById('connect-form');
    const partnerCodeInput = document.getElementById('partnerCode');
    const errorMessageDiv = document.getElementById('error-message');
    const logoutBtn = document.getElementById('logout-btn');

    const connectedStateDiv = document.getElementById('connected-state');
    const unconnectedStateDiv = document.getElementById('unconnected-state');
    const partnerNameP = document.getElementById('partner-name');

    // ============ UPDATE UI FUNCTION ============
    const updateUI = (currentUser) => {
        // Display username
        usernameSpan.innerText = currentUser.username;

        // Display connection code (always visible)
        connectionCodeP.innerText = currentUser.connectionCode || 'GÉNÉRATION...';

        // Check if connected with partner
        if (currentUser.partnerId || (currentUser.partner && currentUser.partner.username)) {
            // User is connected
            unconnectedStateDiv.classList.add('hidden');
            connectedStateDiv.classList.remove('hidden');

            // Display partner name
            if (currentUser.partner && currentUser.partner.username) {
                partnerNameP.innerText = currentUser.partner.username;
            } else if (currentUser.partnerId) {
                // Fetch partner details if only partnerId exists
                fetchPartnerDetails(currentUser.partnerId);
            } else {
                partnerNameP.innerText = 'Votre moitié';
            }
        } else {
            // User is not connected
            unconnectedStateDiv.classList.remove('hidden');
            connectedStateDiv.classList.add('hidden');
        }
    };

    // ============ FETCH PARTNER DETAILS (if needed) ============
    const fetchPartnerDetails = async (partnerId) => {
        try {
            const response = await fetch(`/api/auth/partner/${partnerId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                partnerNameP.innerText = data.partner.username;

                // Update local storage with partner info
                const updatedUser = { ...user, partner: data.partner, partnerId: data.partner._id || partnerId };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                updateUI(updatedUser); // Refresh UI with new info
            } else {
                partnerNameP.innerText = 'Votre moitié';
            }
        } catch (error) {
            console.error('Error fetching partner details:', error);
            partnerNameP.innerText = 'Votre moitié';
        }
    };

    // ============ INITIAL UI UPDATE ============
    updateUI(user);

    // ============ HANDLE CONNECT FORM SUBMISSION (For User A) ============
    connectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const partnerCode = partnerCodeInput.value.trim().toUpperCase();
        errorMessageDiv.innerText = '';

        // Validation
        if (!partnerCode) {
            errorMessageDiv.innerText = 'Veuillez entrer un code de connexion';
            return;
        }
        if (partnerCode.length !== 8) {
            errorMessageDiv.innerText = 'Le code doit faire 8 caractères';
            return;
        }
        if (partnerCode === user.connectionCode) {
            errorMessageDiv.innerText = 'Vous ne pouvez pas vous connecter à vous-même !';
            return;
        }

        // Disable button during request
        const submitBtn = connectForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Connexion en cours... 💕';

        try {
            const response = await fetch('/api/auth/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ partnerCode })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'La connexion a échoué');
            }

            // ✨ CONNECTION SUCCESS! (For User A) ✨

            // Update local storage with new user data
            localStorage.setItem('user', JSON.stringify(data.user));

            // 🎆 TRIGGER CELEBRATION ANIMATION OR REDIRECT 🎆
            if (typeof window.celebrateConnection === 'function') {
                window.celebrateConnection(); // Yeh function /letters par redirect karega
            } else {
                // Fallback
                window.location.href = '/dashboard';
            }

        } catch (error) {
            errorMessageDiv.innerText = error.message || 'La connexion a échoué. Veuillez réessayer.';
            console.error('Connection error:', error);

            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });

    // ============ AUTO-UPPERCASE INPUT ============
    partnerCodeInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
    });

    // ============ HANDLE LOGOUT ============
    logoutBtn.addEventListener('click', () => {
        // Confirm logout
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    });

    // ============ SOCKET.IO LISTENER (REMOVED) ============
    // Logic for 'socket.on('partnerConnected')' ab 'global-sockets.js' mein hai
    // taaki yeh har page par kaam kare.

    // ============ COPY CONNECTION CODE ============
    if (connectionCodeP) {
        connectionCodeP.style.cursor = 'pointer';
        connectionCodeP.title = 'Click to copy';
        connectionCodeP.addEventListener('click', ReadcodeElement());
    }
});


function copyConnectionCode() {
    const codeElement = document.getElementById('connection-code');
    const code = codeElement.innerText;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
            // Show success message
            const originalText = codeElement.innerText;
            codeElement.innerText = 'COPIED! ✓';
            setTimeout(() => {
                codeElement.innerText = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        const originalText = codeElement.innerText;
        codeElement.innerText = 'COPIED! ✓';
        setTimeout(() => {
            codeElement.innerText = originalText;
        }, 2000);
    }
}