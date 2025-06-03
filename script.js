const articleDiv = document.getElementById("article");
const saveBtn = document.getElementById("saveArticle");
const recentList = document.getElementById("recentList");
const favoritesList = document.getElementById("favoritesList");
const clearFavoritesBtn = document.getElementById("clearFavoritesBtn");
const categorySelect = document.getElementById("category");
const loadArticleBtn = document.getElementById("loadArticle");

let currentArticle = null;
let favorites = JSON.parse(localStorage.getItem("favorites") || "{}");
let recent = JSON.parse(localStorage.getItem("recent") || "[]");

// Save favorites and recent to localStorage
function saveStorage() {
  localStorage.setItem("favorites", JSON.stringify(favorites));
  localStorage.setItem("recent", JSON.stringify(recent));
}

// Render favorites list
function renderFavorites() {
  favoritesList.innerHTML = "";
  for (const pageId in favorites) {
    const item = document.createElement("li");
    item.textContent = favorites[pageId].title;
    item.style.cursor = "pointer";
    item.onclick = () => showArticleById(pageId);
    // Add remove button
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "🗑";
    removeBtn.style.marginLeft = "10px";
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      delete favorites[pageId];
      saveStorage();
      renderFavorites();
    };
    item.appendChild(removeBtn);
    favoritesList.appendChild(item);
  }
}

// Render recent list, max 20 items
function renderRecent() {
  recentList.innerHTML = "";
  const recentLimited = recent.slice(-20).reverse();
  recentLimited.forEach(page => {
    const item = document.createElement("li");
    item.textContent = page.title;
    item.style.cursor = "pointer";
    item.onclick = () => showArticleById(page.pageid);
    recentList.appendChild(item);
  });
}

// Show article by pageid (fetch from API)
async function showArticleById(pageid) {
  articleDiv.innerHTML = "Loading...";
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&pageids=${pageid}&prop=extracts|pageimages&exintro=1&explaintext=1&piprop=thumbnail&pithumbsize=300`;
    const res = await fetch(url);
    const data = await res.json();
    const page = data.query.pages[pageid];
    displayArticle(page);
  } catch (e) {
    articleDiv.textContent = "Error loading article: " + e;
  }
}

// Display article info and update currentArticle + recent list
function displayArticle(page) {
  currentArticle = page;
  // Update recent list (avoid duplicates)
  recent = recent.filter(p => p.pageid !== page.pageid);
  recent.push({ pageid: page.pageid, title: page.title });
  saveStorage();
  renderRecent();

  // Build article HTML
  let html = `<h2>${page.title}</h2>`;
  if (page.thumbnail && page.thumbnail.source) {
    html += `<img src="${page.thumbnail.source}" alt="${page.title}" style="max-width: 300px; display: block; margin-bottom: 1rem;" />`;
  }
  html += `<p>${page.extract || "No summary available."}</p>`;
  html += `<a href="https://en.wikipedia.org/?curid=${page.pageid}" target="_blank" rel="noopener" style="
    display:inline-block;
    background:#1a73e8;
    color:white;
    padding:0.5rem 1rem;
    border-radius:6px;
    text-decoration:none;
    text-align:center;
    margin-top:1rem;
  ">🔗 Read full article</a>`;

  articleDiv.innerHTML = html;
}

// Fetch random article from category or truly random
async function fetchArticle(category) {
  articleDiv.textContent = "Loading...";
  try {
    let url;
    if (!category) {
      // Truly random article
      url = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=random&grnnamespace=0&prop=extracts|pageimages&exintro=1&explaintext=1&piprop=thumbnail&pithumbsize=300&grnlimit=1`;
    } else {
      // From category
      url = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=categorymembers&gcmtitle=Category:${encodeURIComponent(category)}&gcmtype=page&gcmlimit=50&prop=extracts|pageimages&exintro=1&explaintext=1&piprop=thumbnail&pithumbsize=300`;
    }

    const res = await fetch(url);
    const data = await res.json();

    if (!data.query) {
      articleDiv.textContent = "No articles found in this category.";
      return;
    }

    // Pick one article randomly if category
    let pages = Object.values(data.query.pages);
    let page = category ? pages[Math.floor(Math.random() * pages.length)] : pages[0];

    displayArticle(page);
  } catch (e) {
    articleDiv.textContent = "Error loading article: " + e;
  }
}

// Save current article to favorites
saveBtn.onclick = () => {
  if (!currentArticle) return alert("No article loaded");
  favorites[currentArticle.pageid] = { title: currentArticle.title };
  saveStorage();
  renderFavorites();
};

// Clear favorites
clearFavoritesBtn.onclick = () => {
  if (confirm("Clear all favorites?")) {
    favorites = {};
    saveStorage();
    renderFavorites();
  }
};

// Load new article button
loadArticleBtn.onclick = () => {
  const category = categorySelect.value;
  fetchArticle(category);
};

// Initialize lists and load first article on page load
window.onload = () => {
  renderFavorites();
  renderRecent();
  fetchArticle(categorySelect.value);
};
