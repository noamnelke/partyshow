import { startSlideshow } from './slideshow.js'; // Import the slideshow function

const displayDuration = 5000; // Set the display duration for each photo

// Function to submit the form when a file is selected
function handleInputChange(event) {
    const form = document.getElementById('upload-form');
    form.submit();
}

// Attach event listener to the file input
document.getElementById('upload-input').addEventListener('change', handleInputChange);

// Function to fetch the photo queue
async function fetchPhotoQueue() {
    try {
        const response = await fetch('/queue');
        if (!response.ok) {
            throw new Error('Network response was not ok. Status: ' + response.status);
        }
        const json_response = await response.json();
        const photoQueue = json_response['photo_queue'];
        const element = document.getElementById('featured-img');
        startSlideshow(element, photoQueue, [], displayDuration); // Start the slideshow with the fetched data
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

// Fetch the photo queue when the page loads
document.addEventListener('DOMContentLoaded', fetchPhotoQueue);
