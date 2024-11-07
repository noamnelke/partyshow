import { startSlideshow } from './slideshow.js';

const displayDuration = 5000; // Set the display duration for each photo

// Function to submit the form when a file is selected
function handleInputChange(event) {
    const form = document.getElementById('upload-form');
    form.submit();
}

// Attach event listener to the file input
document.getElementById('upload-input').addEventListener('change', handleInputChange);

async function setupSlideshow() {
    const element = document.getElementById('featured-img');
    startSlideshow(element, window.photoQueue, window.newPhotos, displayDuration);
}

// Setup the slideshow when the page loads
document.addEventListener('DOMContentLoaded', setupSlideshow);
