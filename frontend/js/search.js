import { api } from "./api.js";
import { setupCommon } from "./common.js";
import { openModal } from "./modal.js";

setupCommon();

const searchInput = document.getElementById("searchInput");
const grid = document.getElementById("resultsGrid");

async function loadResults(query = "") {
  const results = await api.getPhotos(query);
  displayResults(results);
}

function displayResults(list) {
  grid.innerHTML = "";

  if (!list.length) {
    grid.innerHTML = "<p>Aucun résultat.</p>";
    return;
  }

  list.forEach(photo => {
    const card = document.createElement("article");
    card.className = "post";

    const author = photo.username || "Utilisateur";
    const url = photo.image_path;

    card.innerHTML = `
      <div class="post-header">
        <img class="post-pfp" src="https://api.dicebear.com/8.x/thumbs/svg?seed=${author}" />
        <span class="post-user-name">${author}</span>
      </div>

      <img src="${url}" class="post-img" />

      <div class="post-desc">
        <strong>${author}</strong>
        <span>${photo.caption || ""}</span>
      </div>
    `;

    const img = card.querySelector(".post-img");
    if (img) {
      img.addEventListener("click", () => openModal(photo));
      img.addEventListener("error", () => {
        if (!img.src.includes("/api/proxy?url=")) {
          img.src = `/api/proxy?url=${encodeURIComponent(url)}`;
        }
      });
    }

    grid.appendChild(card);
  });
}

if (searchInput) {
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim();
    loadResults(q);
  });
}

loadResults();
