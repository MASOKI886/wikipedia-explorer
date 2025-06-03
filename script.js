const articleDiv = document.getElementById("article");
const loadBtn = document.getElementById("loadArticle");
const surpriseBtn = document.getElementById("surpriseBtn");
const saveBtn = document.getElementById("saveArticle");
const categorySelect = document.getElementById("category");
const favoritesList = document.getElementById("favoritesList");

let currentArticle = null;

const curatedCategories = [
  "History",
  "Science",
  "Art",
  "Philosophy",
  "Unusual_articles",
  "Inventions",
  "Mythology",
  "Food_and_drink"
];

async function loadArticle(category = "") {
  articleDiv.innerHTML = "<p>Loading...</p>";

  if (category) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:${category}&cmlimit=50&format=json&origin=*`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const pages = data.query.categorymembers;
      const randomPage = pages[Math.floor(Math.random() * pages.length)];
      fetchArticleByTitle(randomPage.title);
    } catch (err) {
      articleDiv.innerHTML = "<p>Could not load category. Try again.</p>";
    }
  } else {
    const url = "https://en.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts&exintro&explaintext&format=json&origin=*";
    try {
      const res = await fetch(url);
      const data = await res.json();
      const page = Object.values(data.query.pages)[0];
      showArticle(page);
    } catch (err) {
      articleDiv.innerHTML = "<p>Error loading article. Try again.</p>";
    }
  }
}

async function fetchArticleByTitle(title) {
  const api = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts&exintro&explaintext&format=json&origin=*`;
  try {
    const res = await fetch(api);
    const data = await res.json();
    const page = Object.values(data.query.pages)[0];
    showArticle(page);
  } catch (err) {
    articleDiv.innerHTML = "<p>Error fetching article.</p>";
  }
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

  if (!favorites.find(a => a.pageid === currentArticle.pageid)) {
    favorites.push(currentArticle);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    updateFavoritesList();
  }
}

function deleteFavorite(pageid) {
  let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  favorites = favorites.filter(a => a.pageid !== pageid);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateFavoritesList();
}

function updateFavoritesList() {
  let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  favoritesList.innerHTML = "";
  favorites.forEach(article => {
    const li = document.createElement("li");
    li.innerHTML = `
      <a href="https://en.wikipedia.org/?curid=${article.pageid}" target="_blank">${article.title}</a> 
      <button class="deleteBtn" data-id="${article.pageid}" title="Remove from favorites">❌</button>
    `;
    favoritesList.appendChild(li);
  });

  // Attach delete event listeners
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = Number(e.target.getAttribute("data-id"));
      deleteFavorite(id);
    });
  });
}

function surpriseMe() {
  const randomCategory = curatedCategories[Math.floor(Math.random() * curatedCategories.length)];
  categorySelect.value = randomCategory;
  loadArticle(randomCategory);
}

// Event Listeners
loadBtn.addEventListener("click", () => loadArticle(categorySelect.value));
surpriseBtn.addEventListener("click", surpriseMe);
saveBtn.addEventListener("click", saveCurrentArticle);
document.addEventListener("DOMContentLoaded", () => {
  loadArticle();
  updateFavoritesList();
});
