
import { api } from "./api.js";
import { setupCommon } from "./common.js";

setupCommon();

const form = document.getElementById("createPostForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const imageUrl = document.getElementById("imageUrl").value.trim();
    const caption = document.getElementById("caption").value.trim();

    if (!imageUrl) {
      alert("L'URL de l'image est obligatoire.");
      return;
    }

    const res = await api.addPhoto(imageUrl, caption);
    if (res.error) {
      alert(res.error);
    } else {
      alert("Post créé !");
      window.location.href = "index.html";
    }
  });
}
