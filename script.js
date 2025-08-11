
// API key (replace with your key)
const apiKey = 'cbef13ae0cae4b4a944c4206e893d143'; 
const newsGrid = document.getElementById('newsGrid');
const bookmarkGrid = document.getElementById('bookmarkGrid');

// Load bookmarks from localStorage or empty array
function loadBookmarks() {
  return JSON.parse(localStorage.getItem('bookmarks') || '[]');
}

// Save bookmarks to localStorage
function saveBookmarks(bookmarks) {
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

// Check if an article is bookmarked (using url as unique id)
function isBookmarked(url) {
  const bookmarks = loadBookmarks();
  return bookmarks.some(article => article.url === url);
}

// Render news articles to a container with bookmark buttons
function renderArticles(articles, container, isBookmarkSection = false) {
  container.innerHTML = "";
  if (articles.length === 0) {
    container.innerHTML = `<p>${isBookmarkSection ? 'No bookmarks yet. Click 🔖 on articles to bookmark.' : 'No news articles available.'}</p>`;
    return;
  }
  articles.forEach(article => {
    const card = document.createElement('article');
    card.className = 'news-item';
    const bookmarked = isBookmarked(article.url);
    card.innerHTML = `
      <img src="${article.urlToImage || 'https://via.placeholder.com/350x160?text=No+Image'}" alt="${article.title}" />
      <div class="content">
        <h3><a href="${article.url}" target="_blank" rel="noopener">${article.title}</a></h3>
        <p>${article.description || ''}</p>
        <button class="bookmark-btn" data-url="${article.url}" title="${bookmarked ? 'Remove Bookmark' : 'Add Bookmark'}">${bookmarked ? '🔖' : '📑'}</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Toggle bookmark state on click
function toggleBookmark(url, title, description, urlToImage) {
  let bookmarks = loadBookmarks();
  if (isBookmarked(url)) {
    bookmarks = bookmarks.filter(article => article.url !== url);
  } else {
    bookmarks.push({url, title, description, urlToImage});
  }
  saveBookmarks(bookmarks);
  renderArticles(bookmarks, bookmarkGrid, true);
  renderArticles(latestArticles, newsGrid, false);
}

// Fetch news from API
let latestArticles = [];
async function fetchNews() {
  try {
    const url = `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=6&apiKey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    latestArticles = data.articles || [];
    renderArticles(latestArticles, newsGrid);
    renderArticles(loadBookmarks(), bookmarkGrid, true);
  } catch (err) {
    newsGrid.innerHTML = '<p>Failed to load news. Please try again later.</p>';
    console.error(err);
  }
}

// Event delegation for bookmark button clicks
document.body.addEventListener('click', e => {
  if (e.target.classList.contains('bookmark-btn')) {
    const btn = e.target;
    const articleCard = btn.closest('.news-item');
    const url = btn.getAttribute('data-url');
    const title = articleCard.querySelector('h3 a').textContent;
    const description = articleCard.querySelector('p').textContent;
    const urlToImage = articleCard.querySelector('img').src;
    toggleBookmark(url, title, description, urlToImage);
  }
});

// Initial call
fetchNews();
