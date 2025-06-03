const articleDiv = document.getElementById("article");
const button = document.getElementById("newArticle");

async function loadRandomArticle() {
  articleDiv.innerHTML = "<p>Loading...</p>";
  const url = "https://en.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts&exintro&explaintext&format=json&origin=*";

  try {
    const res = await fetch(url);
    const data = await res.json();
    const page = Object.values(data.query.pages)[0];

    articleDiv.innerHTML = `
      <h2>${page.title}</h2>
      <p>${page.extract}</p>
      <p><a href="https://en.wikipedia.org/?curid=${page.pageid}" target="_blank">Read full article →</a></p>
    `;
  } catch (err) {
    articleDiv.innerHTML = "<p>Error loading article. Try again.</p>";
    console.error(err);
  }
}

button.addEventListener("click", loadRandomArticle);
loadRandomArticle(); // Load on first visit
