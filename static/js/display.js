// Logging mechanism
const loggingEnabled = false; // Set to true to enable logging

function log(...args) {
    if (loggingEnabled) {
        console.log(...args);
    }
}

// Connect to the specified namespace
const socket = io('/', { path: '/socket.io' });

let photoQueue = [];
let newPhotos = [];
let currentFeaturedIndex = 0;
const displayDuration = 15000; // 15 seconds in milliseconds
let photoQueueLength = 0;

const featuredImg = document.getElementById('featured-img');
const bubblesContainer = document.getElementById('bubbles-container');

/**
 * Preloads an image and updates the featured image upon successful loading.
 * @param {Object} photo - The photo object containing 'path' and 'filename'.
 */
function showFeaturedPhoto(photo) {
    log('Preloading photo:', photo.path);
    const img = new Image();
    img.src = photo.path;

    img.onload = () => {
        log('Photo loaded:', photo.path);
        // Remove 'visible' class to initiate fade-out
        featuredImg.classList.remove('visible');

        // After the fade-out transition completes, update the src and fade back in
        setTimeout(() => {
            featuredImg.src = photo.path;
            featuredImg.alt = photo.filename;
            featuredImg.classList.add('visible');
        }, 1000); // Match this timeout with the CSS transition duration
    };

    img.onerror = () => {
        console.error('Failed to load photo:', photo.path);
    };
}

/**
 * Adds a bubble animation for the new photo.
 * @param {Object} photo - The photo object containing 'path' and 'filename'.
 */
function addBubble(photo) {
    log('Adding bubble for photo:', photo.path);
    const img = new Image();
    img.src = photo.path;

    img.onload = () => {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        bubble.style.backgroundImage = `url(${photo.path})`;

        // Generate a random horizontal position within the viewport
        const randomX = Math.random() * 100;
        bubble.style.left = `${randomX}%`;

        bubblesContainer.appendChild(bubble);

        // Remove bubble after animation
        bubble.addEventListener('animationend', () => {
            bubblesContainer.removeChild(bubble);
        });
    };

    img.onerror = () => {
        console.error('Failed to load bubble image:', photo.path);
    };
}

/**
 * Starts the slideshow by displaying the current featured photo and scheduling the next one.
 */
function startSlideshow() {
    if (photoQueue.length === 0 && newPhotos.length === 0) {
        log('Photo queues are empty. Slideshow not started.');
        return;
    }

    let nextPhoto;
    if (newPhotos.length > 0) {
        nextPhoto = newPhotos.shift();
        photoQueue.push(nextPhoto);
    } else {
        nextPhoto = photoQueue[currentFeaturedIndex];
        currentFeaturedIndex = (currentFeaturedIndex + 1) % photoQueueLength;
    }

    log('Starting slideshow with photo:', nextPhoto);
    showFeaturedPhoto(nextPhoto);
    setTimeout(startSlideshow, displayDuration);

    // Update the stored length of the photoQueue
    if (currentFeaturedIndex === 0) {
        photoQueueLength = photoQueue.length;
    }
}

// Initial connection to the server
socket.on('connect', () => {
    log('Connected to server');
});

// Receive the initial state containing the photo queue
socket.on('initial_state', data => {
    log('Received initial state:', data);
    photoQueue = data.photo_queue;
    photoQueueLength = photoQueue.length;
    if (photoQueue.length > 0) {
        startSlideshow();
    }
});

// Receive new photos in real-time
socket.on('new_photo', photo => {
    log('Received new photo:', photo);
    newPhotos.push(photo);
    addBubble(photo);
    if (photoQueue.length === 0 && newPhotos.length === 1) {
        startSlideshow();
    }
});

// Handle disconnections gracefully
socket.on('disconnect', () => {
    log('Disconnected from server. Attempting to reconnect...');
});

// Optionally, handle reconnection events
socket.on('reconnect', (attemptNumber) => {
    log('Reconnected to server after', attemptNumber, 'attempt(s)');
});

let idleTimeout;

function resetIdleTimer() {
    document.body.classList.remove('idle');
    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => {
        document.body.classList.add('idle');
    }, 3000); // 3 seconds
}

document.addEventListener('mousemove', resetIdleTimer);
document.addEventListener('keydown', resetIdleTimer);

resetIdleTimer(); // Initialize the timer on page load

// QR Code Generation
(function () {
    var qr = new QRious({
        element: document.getElementById('qr'),
        value: 'https://partyshow.xyz/upload',
        size: 170,
        background: 'black',
        backgroundAlpha: 0.5,
        foreground: 'gold',
    });
})();
