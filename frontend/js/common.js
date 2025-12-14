
import { api } from "./api.js";

export function setupCommon() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await api.logout();
      window.location.href = "login.html";
    });
  }
}
