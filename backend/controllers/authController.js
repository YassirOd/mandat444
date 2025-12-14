
const bcrypt = require("bcrypt");
const { get, run, all } = require("../utils/db");

async function register(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Nom d'utilisateur et mot de passe requis." });
    }

    const existing = await get(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (existing) {
      return res
        .status(400)
        .json({ error: "Ce nom d'utilisateur existe déjà." });
    }

    const hashed = await bcrypt.hash(password, 10);
    await run(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashed]
    );

    res.json({ message: "Compte créé avec succès." });
  } catch (err) {
    console.error("Erreur register:", err);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Nom d'utilisateur et mot de passe requis." });
    }

    const user = await get(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Mot de passe incorrect." });
    }

    req.session.user = { id: user.id, username: user.username };
    res.json({ message: "Connexion réussie.", user: req.session.user });
  } catch (err) {
    console.error("Erreur login:", err);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Erreur logout:", err);
    }
    // Supprime le cookie de session côté client
    res.clearCookie("connect.sid");
    res.json({ message: "Déconnexion réussie." });
  });
}

// Retourne l'utilisateur courant (ou null s'il n'y a pas de session)
async function ensureProfileColumns() {
  const cols = await all("PRAGMA table_info(users)");
  const names = cols.map((c) => c.name);
  if (!names.includes("full_name")) {
    await run("ALTER TABLE users ADD COLUMN full_name TEXT");
  }
  if (!names.includes("bio")) {
    await run("ALTER TABLE users ADD COLUMN bio TEXT");
  }
  if (!names.includes("avatar_url")) {
    await run("ALTER TABLE users ADD COLUMN avatar_url TEXT");
  }
}

async function me(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.json(null);
    }
    await ensureProfileColumns();
    const row = await get(
      "SELECT id, username, COALESCE(full_name,'') AS full_name, COALESCE(bio,'') AS bio, COALESCE(avatar_url,'') AS avatar_url FROM users WHERE id = ?",
      [req.session.user.id]
    );
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

async function getProfile(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: "Non autorisé." });
    }
    await ensureProfileColumns();
    const row = await get(
      "SELECT id, username, COALESCE(full_name,'') AS full_name, COALESCE(bio,'') AS bio, COALESCE(avatar_url,'') AS avatar_url FROM users WHERE id = ?",
      [req.session.user.id]
    );
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

async function updateProfile(req, res) {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: "Non autorisé." });
    }
    const { full_name = "", bio = "", avatar_url = "" } = req.body || {};
    await ensureProfileColumns();
    await run(
      "UPDATE users SET full_name = ?, bio = ?, avatar_url = ? WHERE id = ?",
      [full_name, bio, avatar_url, req.session.user.id]
    );
    const row = await get(
      "SELECT id, username, COALESCE(full_name,'') AS full_name, COALESCE(bio,'') AS bio, COALESCE(avatar_url,'') AS avatar_url FROM users WHERE id = ?",
      [req.session.user.id]
    );
    res.json({ message: "Profil mis à jour.", profile: row });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la mise à jour du profil." });
  }
}

module.exports = { register, login, logout, me, getProfile, updateProfile };
