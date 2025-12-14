
const API_BASE = "/api";

async function jsonOrEmpty(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export const api = {
  async signup(username, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });
    const data = await jsonOrEmpty(res);
    if (!res.ok) {
      return { ok: false, error: data.error || "Erreur lors de l'inscription." };
    }
    return { ok: true, message: data.message };
  },

  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });
    const data = await jsonOrEmpty(res);
    if (!res.ok) {
      return { ok: false, error: data.error || "Erreur de connexion." };
    }
    return { ok: true, user: data.user };
  },

  async logout() {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  },

  async me() {
    const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
    return jsonOrEmpty(res);
  },

  async getProfile() {
    const res = await fetch(`${API_BASE}/auth/profile`, { credentials: "include" });
    return jsonOrEmpty(res);
  },

  async updateProfile(payload) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {}),
      credentials: "include",
    });
    return jsonOrEmpty(res);
  },

  async getPhotos(search = "") {
    const url = search
      ? `${API_BASE}/photos?search=${encodeURIComponent(search)}`
      : `${API_BASE}/photos`;
    const res = await fetch(url, { credentials: "include" });
    return jsonOrEmpty(res);
  },

  async addPhoto(image_path, caption = "") {
    const res = await fetch(`${API_BASE}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_path, caption }),
      credentials: "include",
    });
    return jsonOrEmpty(res);
  },

  async getLikes(photoId) {
    const res = await fetch(`${API_BASE}/likes/${photoId}`, {
      credentials: "include",
    });
    return jsonOrEmpty(res);
  },

  async toggleLike(photoId) {
    const res = await fetch(`${API_BASE}/likes/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photo_id: photoId }),
      credentials: "include",
    });
    return jsonOrEmpty(res);
  },

  async getComments(photoId) {
    const res = await fetch(`${API_BASE}/comments/${photoId}`, {
      credentials: "include",
    });
    return jsonOrEmpty(res);
  },

  async addComment(photoId, comment) {
    const res = await fetch(`${API_BASE}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photo_id: photoId, comment }),
      credentials: "include",
    });
    return jsonOrEmpty(res);
  },

  async deletePhoto(id) {
    const res = await fetch(`${API_BASE}/photos/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    return jsonOrEmpty(res);
  },

  async getStories() {
    const res = await fetch(`${API_BASE}/stories`, { credentials: "include" });
    return jsonOrEmpty(res);
  },

  async getMyStories() {
    const res = await fetch(`${API_BASE}/stories/me`, { credentials: "include" });
    return jsonOrEmpty(res);
  },

  async addStory(image_url, title = "", video_url = "") {
    const res = await fetch(`${API_BASE}/stories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url, video_url, title }),
      credentials: "include",
    });
    return jsonOrEmpty(res);
  },

  async deleteStory(id) {
    const res = await fetch(`${API_BASE}/stories/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    return jsonOrEmpty(res);
  },
};
