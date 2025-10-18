// public/js/global-sockets.js (NAYI FILE)

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (typeof io === 'undefined') {
        console.error('Socket.io library not loaded!');
        return;
    }
    // Agar user logged in nahi hai, to kuch mat karo
    if (!user || !user.id) {
        // login check hi redirect kar dega
        return;
    }

    const socket = io();

    // 1. Server ko batao ki main online hoon (Har page par)
    // NOTE: Apne user model ke hisaab se 'user.id' ya 'user._id' use karein
    socket.emit('join', user.id || user._id);


    // 2. "Partner Connected" notification ko suno
    socket.on('partnerConnected', (data) => {
        console.log('Partner connected me!', data);
        
        const updatedUser = data.partner;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Notification dikhao
        showToast(data.message, 'info');
        
        // Sound bajao
        playNotificationSound();

        setTimeout(() => {
            if (window.location.pathname !== '/letters') {
                window.location.href = '/letters';
            } else {
                window.location.reload();
            }
        }, 3000);
    });


    // 3. === YEH HAI AAPKA MAIN FEATURE ===
    // "Letter Opened" notification ko suno
    socket.on('notifyLetterOpened', (data) => {
        // 'data' object hai: { username: "...", category: "..." }
        const message = `${data.username} ne ek letter khola: "${getCategoryName(data.category)}"`;
        
        // Popup Dikhao
        showToast(message, 'info');

        // Sound Bajao
        playNotificationSound();
    });
    // =====================================
    
    // Disconnect on page close
    window.addEventListener('beforeunload', () => {
        socket.disconnect();
    });
});


// === Helper Functions ===

// ** NEW: Sound bajane ka function **
function playNotificationSound() {
    const audio = new Audio('/sounds/notification.mp3');
    
    // Browser kabhi-kabhi audio block kar dete hain, isliye .play() promise deta hai
    const playPromise = audio.play();

    if (playPromise !== undefined) {
        playPromise.then(_ => {
            // Audio baj gaya
        }).catch(error => {
            // Audio block ho gaya. 
            // Isko fix karne ke liye user ko screen par pehli baar click karna zaroori hai.
            console.warn("Audio play block ho gaya:", error);
        });
    }
}


// Toast notification dikhane ka function
function showToast(message, type = 'info') {
    let toast = document.getElementById('toast-notification');
    
    // Agar toast pehle se nahi bana hai, to banao
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        // Tailwind classes (neeche CSS mein bhi hain)
        toast.className = 'fixed z-50 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg text-white font-semibold';
        document.body.appendChild(toast);
    }
    
    // Type ke hisaab se color set karo
    if (type === 'info') {
        toast.classList.add('bg-blue-500');
    } else {
        toast.classList.add('bg-red-500');
    }
    
    toast.innerText = message;
    
    // Show animation
    toast.classList.add('show-toast');
    
    // 3.5 second baad hata do
    setTimeout(() => {
        toast.classList.remove('show-toast');
    }, 3500);
}

// Category code ko readable naam dena
function getCategoryName(category) {
    switch (category) {
        case 'miss-me': return 'When you miss me 💕';
        case 'need-motivation': return 'When you need motivation ✨';
        case 'angry-at-me': return 'When you are angry at me 🌹';
        case 'feel-lonely': return 'When you feel lonely 🤗';
        case 'just-because': return 'Just because... 💖';
        default: return 'ek letter';
    }
}