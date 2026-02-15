// public/js/gallery.js

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!token || !user) {
        window.location.href = '/login';
        return;
    }

    const galleryGrid = document.getElementById('gallery-grid');
    const uploadModal = document.getElementById('upload-modal');
    const openUploadBtn = document.getElementById('open-upload');
    const closeUploadBtn = document.getElementById('close-upload');
    const uploadForm = document.getElementById('upload-form');
    const imageInput = document.getElementById('image-input');
    const dropZone = document.getElementById('drop-zone');
    const fileLabel = document.getElementById('file-label');
    const preview = document.getElementById('preview');

    // ============ CHARGEMENT DES IMAGES ============
    const fetchImages = async () => {
        try {
            const response = await fetch('/api/gallery', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Erreur de chargement');

            const images = await response.json();
            renderGallery(images);
        } catch (error) {
            console.error(error);
            galleryGrid.innerHTML = `
                <div class="empty-state">
                    <span class="empty-heart">❌</span>
                    <p>Impossible de charger vos souvenirs.</p>
                </div>
            `;
        }
    };

    const renderGallery = (images) => {
        if (images.length === 0) {
            galleryGrid.innerHTML = `
                <div class="empty-state">
                    <span class="empty-heart">📸</span>
                    <p class="gallery-subtitle">Votre galerie est vide pour l'instant.</p>
                    <p style="opacity: 0.6; margin-top: 1rem;">Ajoutez votre première photo pour commencer votre collection de souvenirs !</p>
                </div>
            `;
            return;
        }

        galleryGrid.innerHTML = images.map(img => `
            <article class="portfolio-item">
                <img src="${img.imageUrl}" alt="Souvenir" loading="lazy">
                <div class="portfolio-overlay">
                    <p class="portfolio-caption">${img.caption || 'Un moment précieux...'}</p>
                    <div class="portfolio-meta">
                        <span>Par ${img.uploaderId.username}</span>
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <button onclick="toggleLike('${img._id}')" style="background:none; border:none; color:${img.isLiked ? '#ff4081' : 'white'}; cursor:pointer; font-size: 1.2rem;">
                                ${img.isLiked ? '❤️' : '🤍'}
                            </button>
                            ${img.uploaderId._id === user.id ? `
                                <button onclick="deleteImage('${img._id}')" style="background:none; border:none; color:rgba(255,255,255,0.6); cursor:pointer;">
                                    🗑️
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </article>
        `).join('');
    };

    // ============ GESTION DE L'UPLOAD ============
    openUploadBtn.onclick = () => uploadModal.style.display = 'flex';
    closeUploadBtn.onclick = () => {
        uploadModal.style.display = 'none';
        resetForm();
    };

    window.onclick = (e) => {
        if (e.target === uploadModal) {
            uploadModal.style.display = 'none';
            resetForm();
        }
    };

    const resetForm = () => {
        uploadForm.reset();
        preview.style.display = 'none';
        fileLabel.style.display = 'block';
    };

    // Prévisualisation de l'image
    dropZone.onclick = () => imageInput.click();
    imageInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (re) => {
                preview.src = re.target.result;
                preview.style.display = 'block';
                fileLabel.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    };

    uploadForm.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submit-upload');
        const originalText = submitBtn.innerText;

        const formData = new FormData(uploadForm);

        if (!imageInput.files[0]) {
            alert('Veuillez choisir une image d\'abord !');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerText = 'Partage en cours... 🚀';

        try {
            const response = await fetch('/api/gallery/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            uploadModal.style.display = 'none';
            resetForm();
            fetchImages();
        } catch (error) {
            alert(error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
        }
    };

    // ============ INTERACTIONS ============
    window.toggleLike = async (imageId) => {
        try {
            const response = await fetch(`/api/gallery/${imageId}/like`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) fetchImages();
        } catch (error) {
            console.error('Erreur like:', error);
        }
    };

    window.deleteImage = async (imageId) => {
        if (!confirm('Voulez-vous vraiment supprimer ce souvenir ?')) return;

        try {
            const response = await fetch(`/api/gallery/${imageId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) fetchImages();
            else {
                const data = await response.json();
                alert(data.message);
            }
        } catch (error) {
            console.error('Erreur suppression:', error);
        }
    };

    // Initialisation
    fetchImages();
});
