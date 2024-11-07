import { startSlideshow } from './slideshow.js';

// Connect to the specified namespace
const socket = io('/', { path: '/socket.io' });

const newPhotos = [];
const displayDuration = 15000; // 15 seconds in milliseconds

const featuredImg = document.getElementById('featured-img');
const bubblesContainer = document.getElementById('bubbles-container');

/**
 * Adds a bubble animation for the new photo.
 * @param {Object} photo - The photo object containing 'path' and 'filename'.
 */
export function addBubble(photo) {
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
window.addBubble = addBubble;

// Receive the initial state containing the photo queue
socket.on('initial_state', data => {
    const photoQueue = data.photo_queue;
    if (photoQueue.length > 0) {
        startSlideshow(featuredImg, photoQueue, newPhotos, displayDuration);
    }
});

// Receive new photos in real-time
socket.on('new_photo', photo => {
    newPhotos.push(photo);
    addBubble(photo);
    if (!window.stopSlideshow) {
        startSlideshow(featuredImg, [], newPhotos, displayDuration);
    }
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
function generateQR(element, value) {
    new QRious({
        element: element,
        value: value,
        size: 1000,
        background: 'black',
        backgroundAlpha: 0,
        foreground: 'gold',
    });
    if (value.substring(0, 4) === 'http') {
        element.addEventListener('click', () => {
            window.open(value, '_blank');
        });
        element.style.cursor = 'pointer';
    }
    element.title = value;
};

generateQR(document.getElementById('qr-upload'), window.location.href + 'upload');
generateQR(document.getElementById('qr-wifi'), 'WIFI:T:WPA;S:Honeypot;P:050-7700593;');
