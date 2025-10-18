// public/js/letters.js
// ============ LETTERS.JS - COMPLETE UPDATED ============

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token) { window.location.href = '/login'; return; }
    if (!user || !user.partnerId) {
        alert('You need to connect with a partner first!');
        window.location.href = '/dashboard';
        return;
    }

    // ============ FETCH LETTERS ============
    try {
        const response = await fetch('/api/letters', {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) { throw new Error('Could not fetch letters'); }

        const letters = await response.json();
        
        // ============ CATEGORIZE LETTERS ============
        const categorizedLetters = {
            'miss-me': [], 'need-motivation': [], 'angry-at-me': [],
            'feel-lonely': [], 'just-because': []
        };

        letters.forEach(letter => {
            let category = letter.category || letter.occasion || letter.type || 'just-because';
            category = category.toLowerCase().replace(/\s+/g, '-');
            const categoryMap = {
                'miss-you': 'miss-me', 'motivation': 'need-motivation', 'angry': 'angry-at-me',
                'lonely': 'feel-lonely', 'general': 'just-because', 'other': 'just-because'
            };
            category = categoryMap[category] || category;
            
            const letterData = {
                id: letter._id,
                from: letter.sender?.username || letter.from || 'Anonymous',
                message: letter.content?.text || letter.message || letter.text || '',
                createdAt: letter.createdAt || new Date(),
                category: category
            };

            if (categorizedLetters[category]) {
                categorizedLetters[category].push(letterData);
            } else {
                categorizedLetters['just-because'].push(letterData);
            }
        });

        Object.keys(categorizedLetters).forEach(category => {
            categorizedLetters[category].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });

        window.lettersData = categorizedLetters;
        updateEnvelopeCounts(categorizedLetters);
        
        // ** YEH HAI SABSE ZAROORI STEP **
        // Ab hum letter kholne ke liye click listeners setup karenge
        setupLetterOpening();
        
    } catch (error) {
        console.error('Error fetching letters:', error);
        // ...aapka error handling...
    }

    // ============ REAL-TIME NEW LETTER LISTENER ============
    // 'join' logic yahaan se hata diya gaya hai (woh global-sockets.js mein hai)
    if (typeof io !== 'undefined') {
        const socket = io();
        
        socket.on('newLetter', (letter) => {
            console.log('New letter received:', letter);
            // ...aapka new letter add karne ka logic...
            // ... (code omitted for brevity) ...
            updateEnvelopeCounts(window.lettersData);
            
            // Global function se popup dikhao (sound bhi bajega)
            if (typeof playNotificationSound === 'function') {
                showToast('New letter received! 💌', 'info');
                playNotificationSound();
            }
        });
    }
}); // END of DOMContentLoaded

// ============ UPDATE ENVELOPE COUNTS (Aapka original function) ============
function updateEnvelopeCounts(categorizedLetters) {
    Object.keys(categorizedLetters).forEach(category => {
        const count = categorizedLetters[category].length;
        const countElement = document.getElementById(`${category}-count`);
        if (countElement) {
            countElement.textContent = `${count} ${count === 1 ? 'letter' : 'letters'}`;
            // ...aapka GSAP animation...
        }
    });
}

// ============ ** NEW ** LETTER OPENING FUNCTIONS ============

function setupLetterOpening() {
    // Yeh maan raha hoon ki aapke har envelope par 'envelope-wrapper' class hai
    // aur 'data-category' attribute hai.
    const envelopes = document.querySelectorAll('.envelope-wrapper'); 

    envelopes.forEach(envelope => {
        const category = envelope.dataset.category; 
        
        envelope.addEventListener('click', () => {
            // Yahaan aap letter ko modal/popup mein dikhane ka logic likhenge
            // (Jaise: showLetterModal(category);)
            console.log(`User ne ${category} letter khola.`);
            
            // !!*** IMPORTANT: Jaise hi user ne click kiya, yeh event bhej do ***!!
            emitLetterOpenedNotification(category);
        });
    });
}

function emitLetterOpenedNotification(category) {
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Check karo ki socket library hai aur hum connected hain
    if (typeof io !== 'undefined' && user && user.partnerId) {
        const socket = io(); 
        socket.emit('letterOpened', {
            partnerId: user.partnerId,
            openerUsername: user.username,
            letterCategory: category
        });
    }
}

// ... Aapke baaki helper functions (formatDate, etc.) ...

// ============ HELPER FUNCTIONS ============

// Format date nicely
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Format message with line breaks
function formatMessage(message) {
    return escapeHtml(message).replace(/\n/g, '<br>');
}

// ============ EXPORT FUNCTIONS FOR DEBUGGING ============
window.lettersDebug = {
    getData: () => window.lettersData,
    getCounts: () => {
        const counts = {};
        Object.keys(window.lettersData || {}).forEach(category => {
            counts[category] = window.lettersData[category].length;
        });
        return counts;
    },
    reload: () => location.reload()
};

// Log available debug functions
console.log('Letters page loaded! Debug functions available via window.lettersDebug');
console.log('Try: window.lettersDebug.getData() or window.lettersDebug.getCounts()');
