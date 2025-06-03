const articleDiv = document.getElementById("article");
const categorySelect = document.getElementById("categorySelect");
const newArticleBtn = document.getElementById("newArticle");
const saveFavoriteBtn = document.getElementById("saveFavorite");
const favoritesList = document.getElementById("favoritesList");

const categories = {
  "Philosophy": "Category:Philosophy",
  "Science": "Category:Science",
  "History": "Category:History",
  "Psychology": "Category:Psychology",
  "Technology": "Category:Technology",
  "Mathematics": "Category:Mathematics",
  "Art": "Category:Art"
};

let currentArticle = null;

function populateCategories() {
  for (const name in categories) {
    const opt = document.createElement("option");
    opt.value = categories[name];
    opt.textContent = name;
    categorySelect.appendChild(opt);
  }
}

async function getRandomArticleFromCategory(category) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtitle=${encodeURIComponent(category)}&cmlimit=500&origin=*`;
  const res = await fetch(url);
  const data = await res.json();
  const pages = data.query.categorymembers.filter(p => p.ns === 0);
  if (pages.length === 0) throw new Error("No articles in category.");
  const page = pages[Math.floor(Math.random() * pages.length)];
  return page;
}

async function showArticle(page) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&format=json&pageids=${page.pageid}&origin=*`;
  const res = await fetch(url);
  const data = await res.json();
  const content = data.query.pages[page.pageid];
  currentArticle = content;

  articleDiv.innerHTML = `
    <h2><a href="https://en.wikipedia.org/?curid=${page.pageid}" target="_blank" rel="noopener">${content.title}</a></h2>
    <p>${content.extract || "No summary available."}</p>
  `;
}

async function loadArticle() {
  const category = categorySelect.value;
  if (!category) return;
  try {
    const page = await getRandomArticleFromCategory(category);
    await showArticle(page);
  } catch {
    articleDiv.innerHTML = "<p>Could not load article.</p>";
  }
}

function saveFavorite() {
  if (!currentArticle) return;
  const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  if (!favorites.find(a => a.pageid === currentArticle.pageid)) {
    favorites.push({ title: currentArticle.title, pageid: currentArticle.pageid });
    localStorage.setItem("favorites", JSON.stringify(favorites));
    updateFavoritesList();
  }
}

function updateFavoritesList() {
  const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  favoritesList.innerHTML = "";
  favorites.forEach(article => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = `https://en.wikipedia.org/?curid=${article.pageid}`;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = article.title;

    const delBtn = document.createElement("button");
    delBtn.textContent = "🗑️";
    delBtn.className = "deleteBtn";
    delBtn.setAttribute("aria-label", `Delete ${article.title} from favorites`);
    delBtn.onclick = () => {
      const updated = favorites.filter(a => a.pageid !== article.pageid);
      localStorage.setItem("favorites", JSON.stringify(updated));
      updateFavoritesList();
    };

    li.appendChild(link);
    li.appendChild(delBtn);
    favoritesList.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  populateCategories();
  updateFavoritesList();
});

newArticleBtn.addEventListener("click", loadArticle);
saveFavoriteBtn.addEventListener("click", saveFavorite);

async function showArticle(page) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&format=json&pageids=${page.pageid}&origin=*`;
  const res = await fetch(url);
  const data = await res.json();
  const content = data.query.pages[page.pageid];
  currentArticle = content;

  const wikiUrl = `https://en.wikipedia.org/?curid=${page.pageid}`;

  articleDiv.innerHTML = `
    <h2><a href="${wikiUrl}" target="_blank" rel="noopener">${content.title}</a></h2>
    <p>${content.extract || "No summary available."}</p>
  `;

  // Update share links
  document.getElementById("shareX").href = `https://x.com/intent/tweet?url=${encodeURIComponent(wikiUrl)}&text=${encodeURIComponent(content.title)} via Wiki Explorer`;
  document.getElementById("shareReddit").href = `https://www.reddit.com/submit?url=${encodeURIComponent(wikiUrl)}&title=${encodeURIComponent(content.title)}`;
  document.getElementById("shareFacebook").href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(wikiUrl)}`;
}
