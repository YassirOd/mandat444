
import { api } from "./api.js";

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      alert("Remplis tous les champs.");
      return;
    }

    const res = await api.login(username, password);
    if (res.ok) {
      window.location.href = "index.html";
    } else {
      alert(res.error);
    }
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      alert("Remplis tous les champs.");
      return;
    }

    const res = await api.signup(username, password);
    if (res.ok) {
      alert("Compte créé, tu peux te connecter.");
      window.location.href = "login.html";
    } else {
      alert(res.error);
    }
  });
}
