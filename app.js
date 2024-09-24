const apiKey = '43396093-d7525ef1cc07563160813f0cc';
const searchInput = document.getElementById('search-input');
const gallery = document.getElementById('gallery');
let bookmarkedImages = JSON.parse(localStorage.getItem('bookmarkedImages')) || [];
let allImages = []; // Global array to store fetched images

// Function to fetch images from Pixabay API
async function fetchImages(query = 'nature') {
    try {
      gallery.innerHTML = '<p>Loading images...</p>'; // Show loading message
      const response = await fetch(`https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&per_page=20`);
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      const data = await response.json();
      allImages = data.hits; // Store all images globally
      return allImages;
    } catch (error) {
      console.error(error);
      gallery.innerHTML = '<p>Error loading images. Please try again later.</p>';
      return []; // Return an empty array to avoid issues
    }
  }
  

// Function to display images in the gallery with Download, Share, and Bookmark options
function displayImages(images) {
  gallery.innerHTML = ''; // Clear previous results
  if (images.length > 0) {
    images.forEach(image => {
      // Create container div for each image
      const imageContainer = document.createElement('div');
      imageContainer.classList.add('image-container');

      // Create image element
      const imgElement = document.createElement('img');
      imgElement.src = image.webformatURL;
      imgElement.alt = image.tags;
      imgElement.loading = 'lazy';

      // Create action buttons container
      const actions = document.createElement('div');
      actions.classList.add('actions');

      // Download button
      const downloadButton = document.createElement('button');
      downloadButton.textContent = 'Download';
      downloadButton.onclick = () => downloadImage(image.largeImageURL);

      // Share button
      const shareButton = document.createElement('button');
      shareButton.textContent = 'Share';
      shareButton.onclick = () => shareImage(image.pageURL);

      // Bookmark button
      const bookmarkButton = document.createElement('button');
      bookmarkButton.textContent = bookmarkedImages.includes(image.id) ? 'Bookmarked' : 'Bookmark';
      bookmarkButton.onclick = () => toggleBookmark(image);

      // Append buttons to actions container
      actions.appendChild(downloadButton);
      actions.appendChild(shareButton);
      actions.appendChild(bookmarkButton);

      // Append image and actions to the image container
      imageContainer.appendChild(imgElement);
      imageContainer.appendChild(actions);

      // Append image container to the gallery
      gallery.appendChild(imageContainer);
    });
  } else {
    gallery.innerHTML = '<p>No images found. Try a different search.</p>';
  }
}

// Download image function
async function downloadImage(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to download image');
  
      const blob = await response.blob(); // Create a blob from the image response
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'image.jpg'; // You can customize the filename here
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href); // Clean up
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download image. Please try again.');
    }
  }
  

// Share image function (uses Web Share API if supported)
function shareImage(url) {
  if (navigator.share) {
    navigator.share({
      title: 'Check out this image!',
      url: url
    }).then(() => console.log('Shared successfully!'))
    .catch(error => console.log('Error sharing:', error));
  } else {
    alert('Sharing not supported on this browser');
  }
}

// Toggle bookmark for an image
async function toggleBookmark(image) {
    const index = bookmarkedImages.indexOf(image.id);
    if (index === -1) {
      // Add to bookmarks
      bookmarkedImages.push(image.id);
      localStorage.setItem('bookmarkedImages', JSON.stringify(bookmarkedImages));
      alert('Image bookmarked!');
    } else {
      // Remove from bookmarks
      bookmarkedImages.splice(index, 1);
      localStorage.setItem('bookmarkedImages', JSON.stringify(bookmarkedImages));
      alert('Bookmark removed!');
    }
    updateBookmarkedImages(); // Update displayed bookmarks
  }

// Update displayed images based on bookmarks
function updateBookmarkedImages() {
    const bookmarkedImagesDetails = allImages.filter(image => bookmarkedImages.includes(image.id));
    displayImages(bookmarkedImagesDetails);
  }

// Load default images on page load
window.addEventListener('load', () => {
    fetchImages().then(displayImages); // Load 'nature' images by default
  });
  

// Event listener for search input
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const query = searchInput.value.trim();
    if (query) {
      fetchImages(query).then(displayImages);
    }
  }
});
