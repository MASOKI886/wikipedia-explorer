const articleDiv = document.getElementById("article");
const loadBtn = document.getElementById("loadArticle");
const saveBtn = document.getElementById("saveArticle");
const categorySelect = document.getElementById("category");
const favoritesList = document.getElementById("favoritesList");

let currentArticle = null;

async function loadArticle() {
  articleDiv.innerHTML = "<p>Loading...</p>";
  let url = "";

  const selectedCategory = categorySelect.value;

  if (selectedCategory) {
    // Search articles in a specific category
    url = `https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:${selectedCategory}&cmlimit=50&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query.categorymembers;
    const randomPage = pages[Math.floor(Math.random() * pages.length)];
    fetchArticleByTitle(randomPage.title);
  } else {
    // Random article
    url = "https://en.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts&exintro&explaintext&format=json&origin=*";
    const res = await fetch(url);
    const data = await res.json();
    const page = Object.values(data.query.pages)[0];
    showArticle(page);
  }
}

async function fetchArticleByTitle(title) {
  const api = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts&exintro&explaintext&format=json&origin=*`;
  const res = await fetch(api);
  const data = await res.json();
  const page = Object.values(data.query.pages)[0];
  showArticle(page);
}

function showArticle(page) {
  currentArticle = {
    title: page.title,
    extract: page.extract,
    pageid: page.pageid
  };

  articleDiv.innerHTML = `
    <h2>${page.title}</h2>
    <p>${page.extract}</p>
    <p><a href="https://en.wikipedia.org/?curid=${page.pageid}" target="_blank">🔗 Read full article</a></p>
  `;
}

function saveCurrentArticle() {
  if (!currentArticle) return;
  let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

  // Avoid duplicates
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
    li.innerHTML = `<a href="https://en.wikipedia.org/?curid=${article.pageid}" target="_blank">${article.title}</a>`;
    favoritesList.appendChild(li);
  });
}

// Event Listeners
loadBtn.addEventListener("click", loadArticle);
saveBtn.addEventListener("click", saveCurrentArticle);
document.addEventListener("DOMContentLoaded", () => {
  loadArticle();
  updateFavoritesList();
});
