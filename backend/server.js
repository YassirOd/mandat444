
const express = require("express");
const session = require("express-session");
const path = require("path");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const photosRoutes = require("./routes/photos");
const likesRoutes = require("./routes/likes");
const commentsRoutes = require("./routes/comments");
const storiesRoutes = require("./routes/stories");
const proxyRoutes = require("./routes/proxy");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "instakill-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/api/auth", authRoutes);
app.use("/api/photos", photosRoutes);
app.use("/api/likes", likesRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/stories", storiesRoutes);
app.use("/api/proxy", proxyRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
