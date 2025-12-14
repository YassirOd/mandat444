
import { api } from "./api.js";
import { setupCommon } from "./common.js";
import { openModal } from "./modal.js";

setupCommon();

const grid = document.getElementById("photoGrid");
const searchInput = document.getElementById("search");
const nameSpan = document.getElementById("welcomeName");

// Charge le nom de l'utilisateur connecté
async function loadCurrentUser() {
  try {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    const user = await res.json();
    if (user && user.username && nameSpan) {
      nameSpan.textContent = user.username;
    }
    if (user && user.id) {
      window.currentUserId = user.id;
    }
  } catch (err) {
    console.error("Erreur chargement utilisateur courant:", err);
  }
}
if (nameSpan) {
  loadCurrentUser();
}

async function loadPhotos(search = "") {
  const photos = await api.getPhotos(search);
  displayPosts(photos || []);
}

function displayPosts(photos) {
  if (!grid) return;
  grid.innerHTML = "";

  if (!photos.length) {
    grid.innerHTML = "<p>Aucune photo trouvée.</p>";
    return;
  }

  photos.forEach((photo) => {
    const article = document.createElement("article");
    article.className = "post";

    const authorName = photo.username || photo.author || "Utilisateur";
    const imageUrl = photo.image_path || photo.download_url || "";
    const isOwner = photo.user_id ===  window.currentUserId;

    article.innerHTML = `
      <div class="post-header">
        <img class="post-pfp" src="https://api.dicebear.com/8.x/thumbs/svg?seed=${encodeURIComponent(
          authorName
        )}" alt="pfp" />
        <span class="post-user-name">${authorName}</span>
        ${isOwner ? `<button class="post-delete-btn" title="Supprimer la photo" data-photo-id="${photo.id}">🗑️</button>` : ""}
      </div>
      <img src="${imageUrl}" alt="photo" class="post-img">

      <div class="post-actions">
        <i class="fa-regular fa-heart post-like"></i>
        <i class="fa-regular fa-comment"></i>
        <span class="post-comments-count-label" data-photo-comments-count="${photo.id}">${photo.comment_count}</span>
      </div>

      <div class="post-likes">
        <span data-photo-likes="${photo.id}">0</span> likes
      </div>

      <div class="post-desc">
        <strong>${authorName}</strong>
        <span>${photo.caption || ""}</span>
      </div>
      <div class="post-comments" data-photo-comments="${photo.id}"></div>
      <div class="post-add-comment">
        <input type="text" placeholder="Ajouter un commentaire..." data-comment-input="${photo.id}" />
        <button data-comment-btn="${photo.id}">Publier</button>
      </div>
    `;

    const imgEl = article.querySelector(".post-img");
    if (imgEl) {
      imgEl.addEventListener("click", () => openModal(photo));
      imgEl.addEventListener("error", () => {
        const original = imageUrl;
        if (!imgEl.src.includes("/api/proxy?url=")) {
          imgEl.src = `/api/proxy?url=${encodeURIComponent(original)}`;
        }
      });
    }

    const likeIcon = article.querySelector(".post-like");
    if (likeIcon) {
      likeIcon.addEventListener("click", async () => {
        const data = await api.toggleLike(photo.id);
        if (data.liked) {
          likeIcon.classList.add("liked", "fa-solid");
          likeIcon.classList.remove("fa-regular");
        } else {
          likeIcon.classList.remove("liked", "fa-solid");
          likeIcon.classList.add("fa-regular");
        }
        await refreshLikes(photo.id);
      });
    }

    const commentBtn = article.querySelector(`[data-comment-btn="${photo.id}"]`);
    if (commentBtn) {
      commentBtn.addEventListener("click", async () => {
        const input = article.querySelector(
          `[data-comment-input="${photo.id}"]`
        );
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;
        await api.addComment(photo.id, text);
        input.value = "";
        await loadComments(photo.id)
        await refreshCommnetsCount(photo.id);
      });
    }
    const deleteBtn = article.querySelector(".post-delete-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        const ok = window.confirm("Êtes-vous sûr de vouloir supprimer cette photo ?");
        if (!ok) return;
        await api.deletePhoto(photo.id);
        await loadPhotos(searchInput ? searchInput.value.trim() : "");
      });
    }

    grid.appendChild(article);
    refreshLikes(photo.id);
    loadComments(photo.id);
  });
}

async function refreshLikes(photoId) {
  const data = await api.getLikes(photoId);
  const span = document.querySelector(`[data-photo-likes="${photoId}"]`);
  if (span) span.textContent = data.likes ?? 0;
}

async function refreshCommnetsCount(photoId) {
  const photos = await api.getPhotos("");
  const photo = photos.find(p => p.id === photoId);
const span = document.querySelector(`[data-photo-comments-count="${photoId}"]`);
  if (span) span.textContent =  photo.comment_count ?? 0;}

async function loadComments(photoId) {
  const comments = await api.getComments(photoId);
  const container = document.querySelector(
    `[data-photo-comments="${photoId}"]`
  );
  if (!container) return;
  container.innerHTML = "";
  comments.slice(-3).forEach((c) => {
    const p = document.createElement("p");
    const author = c.username || c.author || "Utilisateur";
    p.innerHTML = `<strong>${author}</strong> ${c.comment}`;
    container.appendChild(p);
  });
}

if (searchInput) {
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim();
    loadPhotos(q);
  });
}

loadPhotos();
