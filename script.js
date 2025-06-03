const articleDiv = document.getElementById("article");
const loadBtn = document.getElementById("loadArticle");
const saveBtn = document.getElementById("saveArticle");
const categorySelect = document.getElementById("category");
const favoritesList = document.getElementById("favoritesList");
const recentList = document.getElementById("recentList");

let currentArticle = null;

async function loadArticle() {
  articleDiv.innerHTML = "<p>Loading...</p>";
  const selectedCategory = categorySelect.value;

  if (selectedCategory) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:${selectedCategory}&cmlimit=50&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query.categorymembers;
    const randomPage = pages[Math.floor(Math.random() * pages.length)];
    fetchArticleByTitle(randomPage.title);
  } else {
    const url = "https://en.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts|pageimages&piprop=thumbnail&pithumbsize=500&exintro&explaintext&format=json&origin=*";
    const res = await fetch(url);
    const data = await res.json();
    const page = Object.values(data.query.pages)[0];
    showArticle(page);
  }
}

async function fetchArticleByTitle(title) {
  const api = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts|pageimages&piprop=thumbnail&pithumbsize=500&exintro&explaintext&format=json&origin=*`;
  const res = await fetch(api);
  const data = await res.json();
  const page = Object.values(data.query.pages)[0];
  showArticle(page);
}

function showArticle(page) {
  currentArticle = {
    title: page.title,
    extract: page.extract,
    pageid: page.pageid,
    thumbnail: page.thumbnail?.source || null
  };

  let html = `<h2>${page.title}</h2>`;
  if (page.thumbnail) {
    html += `<img src="${page.thumbnail.source}" alt="Thumbnail of ${page.title}" />`;
  }
  html += `<p>${page.extract}</p>`;
  html += `<div class="link-wrapper"><a class="article-link" href="https://en.wikipedia.org/?curid=${page.pageid}" target="_blank">🔗 Read full article</a></div>`;
  articleDiv.innerHTML = html;

  addToRecent(currentArticle);
}

function saveCurrentArticle() {
  if (!currentArticle) return;
  let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  if (!favorites.find(a => a.pageid === currentArticle.pageid)) {
    favorites.push(currentArticle);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    updateFavoritesList();
  }
}

function addToRecent(article) {
  let recent = JSON.parse(localStorage.getItem("recent") || "[]");
  // Remove duplicate if exists
  recent = recent.filter(a => a.pageid !== article.pageid);
  // Add new article to the front
  recent.unshift(article);
  // Limit recent list to max 10 items
  if (recent.length > 5) {
    recent = recent.slice(0, 5);
  }
  localStorage.setItem("recent", JSON.stringify(recent));
  updateRecentList();
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
}

function updateRecentList() {
  const recent = JSON.parse(localStorage.getItem("recent") || "[]");
  recentList.innerHTML = "";
  recent.forEach(article => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="https://en.wikipedia.org/?curid=${article.pageid}" target="_blank">${article.title}</a>`;
    recentList.appendChild(li);
  });
}

function removeFavorite(id) {
  let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  favorites = favorites.filter(article => article.pageid !== id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateFavoritesList();
}

// Load on startup
loadBtn.addEventListener("click", loadArticle);
saveBtn.addEventListener("click", saveCurrentArticle);
document.addEventListener("DOMContentLoaded", () => {
  loadArticle();
  updateFavoritesList();
  updateRecentList();
});
