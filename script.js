const articleDiv = document.getElementById("article");
const loadBtn = document.getElementById("loadArticle");
const saveBtn = document.getElementById("saveArticle");
const categorySelect = document.getElementById("category");
const favoritesList = document.getElementById("favoritesList");
const recentList = document.getElementById("recentList");
const themeToggleBtn = document.getElementById("toggleTheme");
const shareBtn = document.getElementById("shareBtn");

let currentArticle = null;

// Load random or category article
async function loadArticle() {
  articleDiv.innerHTML = "<p>Loading...</p>";
  let selectedCategory = categorySelect.value;

  if (selectedCategory) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:${selectedCategory}&cmlimit=50&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query.categorymembers;
    const filteredPages = pages.filter(p => !p.title.startsWith("Category:") && !p.title.startsWith("List of"));
    if (filteredPages.length === 0) {
      articleDiv.innerHTML = "<p>No valid articles found in this category.</p>";
      return;
    }
    const randomPage = filteredPages[Math.floor(Math.random() * filteredPages.length)];
    fetchArticleByTitle(randomPage.title);
  } else {
    const url = `https://en.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts|pageimages&piprop=thumbnail&pithumbsize=600&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const page = Object.values(data.query.pages)[0];
    showArticle(page);
  }
}

async function fetchArticleByTitle(title) {
  const api = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts|pageimages&piprop=thumbnail&pithumbsize=600&exintro&explaintext&format=json&origin=*`;
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
    thumbnail: page.thumbnail ? page.thumbnail.source : null
  };

  addToRecentlyViewed(currentArticle);

  articleDiv.innerHTML = `
    ${page.thumbnail ? `<img src="${page.thumbnail.source}" alt="Thumbnail">` : ""}
    <h2>${page.title}</h2>
    <p>${page.extract || "No summary available."}</p>
    <p><a href="https://en.wikipedia.org/?curid=${page.pageid}" target="_blank">🔗 Read full article</a></p>
  `;
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

function updateFavoritesList() {
  let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  favoritesList.innerHTML = "";
  favorites.forEach(article => {
    const li = document.createElement("li");
    li.innerHTML = `
      <a href="https://en.wikipedia.org/?curid=${article.pageid}" target="_blank">${article.title}</a>
      <button class="remove-btn" onclick="removeFromFavorites(${article.pageid})">🗑</button>
    `;
    favoritesList.appendChild(li);
  });
}

function removeFromFavorites(pageid) {
  let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  favorites = favorites.filter(a => a.pageid !== pageid);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateFavoritesList();
}

function addToRecentlyViewed(article) {
  let recent = JSON.parse(localStorage.getItem("recent") || "[]");
  recent = recent.filter(a => a.pageid !== article.pageid);
  recent.unshift(article);
  if (recent.length > 10) recent = recent.slice(0, 10);
  localStorage.setItem("recent", JSON.stringify(recent));
  updateRecentList();
}

function updateRecentList() {
  let recent = JSON.parse(localStorage.getItem("recent") || "[]");
  recentList.innerHTML = "";
  recent.forEach(article => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="https://en.wikipedia.org/?curid=${article.pageid}" target="_blank">${article.title}</a>`;
    recentList.appendChild(li);
  });
}

// Theme toggle
function setTheme(mode) {
  document.body.classList.toggle("dark", mode === "dark");
  localStorage.setItem("theme", mode);
}

themeToggleBtn.addEventListener("click", () => {
  const currentTheme = document.body.classList.contains("dark") ? "light" : "dark";
  setTheme(currentTheme);
});

// Load theme on start
(function () {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    setTheme(savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme("dark");
  }
})();

// Share button
shareBtn.addEventListener("click", () => {
  const url = window.location.href;
  if (navigator.share) {
    navigator.share({
      title: document.title,
      url: url
    });
  } else {
    navigator.clipboard.writeText(url);
    shareBtn.textContent = "✅ Copied!";
    setTimeout(() => (shareBtn.textContent = "🔗"), 2000);
  }
});

// Load content on page load
loadBtn.addEventListener("click", loadArticle);
saveBtn.addEventListener("click", saveCurrentArticle);
document.addEventListener("DOMContentLoaded", () => {
  loadArticle();
  updateFavoritesList();
  updateRecentList();
});
