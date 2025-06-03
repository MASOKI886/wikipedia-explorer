// Elements
const categorySelect = document.getElementById("categorySelect");
const articleDiv = document.getElementById("article");
const favoritesList = document.getElementById("favoritesList");
const recentList = document.getElementById("recentList");
const clearFavoritesBtn = document.getElementById("clearFavoritesBtn");

// Categories (already set in your HTML select)
const categories = {
  "Science": "Science",
  "Technology": "Technology",
  "History": "History",
  "Arts": "Arts",
  "Geography": "Geography",
  "Sports": "Sports",
  "Politics": "Politics",
  "Animals": "Animals",
  "Music": "Music",
  "Books": "Books",
  "Film": "Film",
  "Mathematics": "Mathematics",
  "Languages": "Languages"
};

// Fetch random article from category by searching pages
async function fetchRandomArticle(category) {
  try {
const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=categorymembers&gcmtitle=Category:${encodeURIComponent(category)}&gcmtype=page&gcmlimit=50&prop=extracts|pageimages&exintro=1&piprop=thumbnail&pithumbsize=300&explaintext=1`;
    const response = await fetch(url);
    const data = await response.json();
    if (!data.query) {
      articleDiv.innerHTML = "<p>No articles found in this category.</p>";
      return null;
    }
    const pages = Object.values(data.query.pages);
    const randomIndex = Math.floor(Math.random() * pages.length);
    return pages[randomIndex];
  } catch (error) {
    articleDiv.innerHTML = `<p>Error fetching article: ${error}</p>`;
    return null;
  }
}

// Show article in the page
async function showArticle(category) {
  articleDiv.innerHTML = "<p>Loading...</p>";
  const page = await fetchRandomArticle(category);
  if (!page) return;

  // Construct HTML with thumbnail if available
  let thumbHtml = "";
  if (page.thumbnail && page.thumbnail.source) {
    thumbHtml = `<img src="${page.thumbnail.source}" alt="Thumbnail" />`;
  }

  let html = `
    <h2>${page.title}</h2>
    <div class="article-thumbnail">${thumbHtml}</div>
    <p>${page.extract || "No extract available."}</p>
    <div class="link-wrapper">
      <a class="article-link" href="https://en.wikipedia.org/?curid=${page.pageid}" target="_blank">🔗 Read full article</a>
    </div>
    <div class="share-buttons">
      <button onclick="shareOnX('${encodeURIComponent(page.title)}', '${page.pageid}')" title="Share on X">🐦 X</button>
      <button onclick="shareOnFacebook('${encodeURIComponent(page.title)}', '${page.pageid}')" title="Share on Facebook">📘 FB</button>
      <button onclick="shareOnReddit('${encodeURIComponent(page.title)}', '${page.pageid}')" title="Share on Reddit">👽 Reddit</button>
    </div>
    <button id="favoriteBtn">❤️ Add to Favorites</button>
  `;

  articleDiv.innerHTML = html;

  // Animate fade-in
  articleDiv.classList.remove("fade-in");
  void articleDiv.offsetWidth;
  articleDiv.classList.add("fade-in");

  // Add to recent viewed
  addToRecent(page);

  // Favorite button event
  document.getElementById("favoriteBtn").addEventListener("click", () => {
    addToFavorites(page);
  });
}

// Favorites handling
function addToFavorites(article) {
  let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  if (favorites.find(a => a.pageid === article.pageid)) {
    alert("Already in favorites!");
    return;
  }
  favorites.push(article);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateFavoritesList();
}

function removeFavorite(pageid) {
  let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  favorites = favorites.filter(a => a.pageid !== pageid);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateFavoritesList();
}

function updateFavoritesList() {
  const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  favoritesList.innerHTML = "";
  favorites.forEach(article => {
    const li = document.createElement("li");
    li.innerHTML = `
      <a href="https://en.wikipedia.org/?curid=${article.pageid}" target="_blank">${article.title}</a>
      <button class="remove-button" onclick="removeFavorite(${article.pageid})">🗑</button>
    `;
    favoritesList.appendChild(li);
  });
  favoritesList.classList.remove("fade-in");
  void favoritesList.offsetWidth;
  favoritesList.classList.add("fade-in");
}

// Clear favorites button
clearFavoritesBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all favorites?")) {
    localStorage.removeItem("favorites");
    updateFavoritesList();
  }
});

// Recent viewed handling
function addToRecent(article) {
  let recent = JSON.parse(localStorage.getItem("recent") || "[]");
  recent = recent.filter(a => a.pageid !== article.pageid);
  recent.unshift(article);
  if (recent.length > 10) recent = recent.slice(0, 10);
  localStorage.setItem("recent", JSON.stringify(recent));
  updateRecentList();
}

function updateRecentList() {
  const recent = JSON.parse(localStorage.getItem("recent") || "[]");
  recentList.innerHTML = "";
  recent.forEach(article => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="https://en.wikipedia.org/?curid=${article.pageid}" target="_blank">${article.title}</a>`;
    recentList.appendChild(li);
  });
  recentList.classList.remove("fade-in");
  void recentList.offsetWidth;
  recentList.classList.add("fade-in");
}

// Share button functions
function shareOnX(title, pageid) {
  const url = `https://en.wikipedia.org/?curid=${pageid}`;
  const text = `Check out this Wikipedia article: "${decodeURIComponent(title)}" ${url}`;
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(shareUrl, '_blank');
}

function shareOnFacebook(title, pageid) {
  const url = `https://en.wikipedia.org/?curid=${pageid}`;
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(shareUrl, '_blank');
}

function shareOnReddit(title, pageid) {
  const url = `https://en.wikipedia.org/?curid=${pageid}`;
  const shareUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(decodeURIComponent(title))}`;
  window.open(shareUrl, '_blank');
}

// On category change, load new article
categorySelect.addEventListener("change", () => {
  showArticle(categorySelect.value);
});

// Initial load
window.onload = () => {
  updateFavoritesList();
  updateRecentList();
  showArticle(categorySelect.value);
};
