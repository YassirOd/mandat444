
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = process.env.SQLITE_PATH || path.join(__dirname, "basededonnee.sqlite3");
try { fs.mkdirSync(path.dirname(dbPath), { recursive: true }); } catch {}
const db = new sqlite3.Database(dbPath);

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

module.exports = {
  db,
  all,
  get,
  run,
};
