const articleDiv = document.getElementById("article");
const loadBtn = document.getElementById("loadArticle");
const saveBtn = document.getElementById("saveArticle");
const categorySelect = document.getElementById("category");
const favoritesList = document.getElementById("favoritesList");
const recentList = document.getElementById("recentList");

let currentArticle = null;

async function loadArticle() {
  articleDiv.innerHTML = "<p>Loading...</p>";
  let selectedCategory = categorySelect.value;
  let url = "";

  if (selectedCategory) {
    url = `https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:${selectedCategory}&cmlimit=50&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query.categorymembers;
    const randomPage = pages[Math.floor(Math.random() * pages.length)];
    fetchArticleByTitle(randomPage.title);
  } else {
    url = `https://en.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts|pageimages&piprop=thumbnail&pithumbsize=600&format=json&origin=*`;
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
  recent = recent.filter(a => a.pageid !== article.pageid); // remove duplicates
  recent.unshift(article); // add to front
  if (recent.length > 10) recent = recent.slice(0, 10); // limit to 10
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

// Event Listeners
loadBtn.addEventListener("click", loadArticle);
saveBtn.addEventListener("click", saveCurrentArticle);
document.addEventListener("DOMContentLoaded", () => {
  loadArticle();
  updateFavoritesList();
  updateRecentList();
});
