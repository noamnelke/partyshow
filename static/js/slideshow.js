export const loggingEnabled = false; // Set to true to enable logging

export function log(...args) {
    if (loggingEnabled) {
        console.log(...args);
    }
}

/**
 * Preloads an image and updates the specified element upon successful loading.
 * @param {Object} photo - The photo object containing 'path' and 'filename'.
 * @param {HTMLElement} element - The HTML element to update with the photo.
 */
export function showFeaturedPhoto(photo, element) {
    log('Preloading photo:', photo.path);
    const img = new Image();
    img.src = photo.path;

    img.onload = () => {
        log('Photo loaded:', photo.path);
        // Remove 'visible' class to initiate fade-out
        element.classList.remove('visible');

        // After the fade-out transition completes, update the src and fade back in
        setTimeout(() => {
            element.src = photo.path;
            element.alt = photo.filename;
            element.classList.add('visible');
        }, 1000); // Match this timeout with the CSS transition duration
    };

    img.onerror = () => {
        console.error('Failed to load photo:', photo.path);
    };
}

/**
 * Starts the slideshow by displaying the current featured photo and scheduling the next one.
 * @param {HTMLElement} element - The HTML element to update with the photo.
 * @param {Array} photoQueue - The queue of photos to display.
 * @param {Array} newPhotos - The queue of new photos to add to the slideshow.
 * @param {number} displayDuration - The duration to display each photo.
 */
export function startSlideshow(element, photoQueue, newPhotos, displayDuration) {
    let currentFeaturedIndex = 0;
    let photoQueueLength = photoQueue.length;

    function displayNextPhoto() {
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
        showFeaturedPhoto(nextPhoto, element);
        setTimeout(displayNextPhoto, displayDuration);

        // Update the stored length of the photoQueue
        if (currentFeaturedIndex === 0) {
            photoQueueLength = photoQueue.length;
        }
    }

    displayNextPhoto();
}
