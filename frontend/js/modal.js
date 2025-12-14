
import { api } from "./api.js";

const modal = document.getElementById("photoModal");
const closeModalBtn = document.getElementById("closeModal");
const modalImg = document.getElementById("modalImg");
const modalAuthor = document.getElementById("modalAuthor");
const modalLikes = document.getElementById("modalLikes");
const modalLikeIcon = document.getElementById("modalLikeIcon");
const modalComments = document.getElementById("modalComments");
const newCommentInput = document.getElementById("newComment");
const sendCommentBtn = document.getElementById("sendComment");
const deleteModalPhotoBtn = document.getElementById("deleteModalPhoto");

let currentPhoto = null;

export function openModal(photo) {
  currentPhoto = photo;
  if (!modal) return;

  modal.style.display = "flex";

  const imgUrl = photo.image_path || photo.download_url || "";
  if (modalImg) {
    modalImg.src = imgUrl;
    modalImg.onerror = () => {
      if (!modalImg.src.includes("/api/proxy?url=")) {
        modalImg.src = `/api/proxy?url=${encodeURIComponent(imgUrl)}`;
      }
    };
  }

  const authorName = photo.username || photo.author || "Utilisateur";
  if (modalAuthor) modalAuthor.textContent = authorName;

  if (modalLikes) modalLikes.textContent = "0";

  if (modalLikeIcon) {
    modalLikeIcon.classList.remove("liked", "fa-solid");
    modalLikeIcon.classList.add("fa-regular");
  }

  refreshModalLikes();
  loadModalComments();

  const isOwner = !!(window.currentUserId && photo.user_id === window.currentUserId);
  if (deleteModalPhotoBtn) {
    deleteModalPhotoBtn.style.display = isOwner ? "inline-block" : "none";
  }
}

async function refreshModalLikes() {
  if (!currentPhoto) return;
  const data = await api.getLikes(currentPhoto.id);
  if (modalLikes) {
    modalLikes.textContent = data.likes ?? 0;
  }
}

async function loadModalComments() {
  if (!currentPhoto || !modalComments) return;
  const comments = await api.getComments(currentPhoto.id);
  modalComments.innerHTML = "";
  comments.forEach((c) => {
    const p = document.createElement("p");
    const author = c.username || c.author || "Utilisateur";
    p.innerHTML = `<strong>${author}</strong> ${c.comment}`;
    modalComments.appendChild(p);
  });
}

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", () => {
    if (modal) modal.style.display = "none";
  });
}

if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
}

if (modalLikeIcon) {
  modalLikeIcon.addEventListener("click", async () => {
    if (!currentPhoto) return;
    const data = await api.toggleLike(currentPhoto.id);
    if (data.liked) {
      modalLikeIcon.classList.add("liked", "fa-solid");
      modalLikeIcon.classList.remove("fa-regular");
    } else {
      modalLikeIcon.classList.remove("liked", "fa-solid");
      modalLikeIcon.classList.add("fa-regular");
    }
    await refreshModalLikes();
  });
}

if (sendCommentBtn) {
  sendCommentBtn.addEventListener("click", async () => {
    if (!currentPhoto || !newCommentInput) return;
    const text = newCommentInput.value.trim();
    if (!text) return;
    await api.addComment(currentPhoto.id, text);
    newCommentInput.value = "";
    await loadModalComments();
  });
}

if (deleteModalPhotoBtn) {
  deleteModalPhotoBtn.addEventListener("click", async () => {
    if (!currentPhoto) return;
    const ok = window.confirm("Supprimer cette photo ?");
    if (!ok) return;
    await api.deletePhoto(currentPhoto.id);
    if (modal) modal.style.display = "none";
    window.location.reload();
  });
}
