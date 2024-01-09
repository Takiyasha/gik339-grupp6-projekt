const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const app = express();

// Använd CORS för att tillåta alla typer av förfrågningar från alla domäner
app.use(cors());

// Middleware för att parse JSON-data från request body
app.use(express.json());

// Skapa databasanslutning
const db = new sqlite3.Database("./mydatabase.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the SQLite database.");
});

// Skapa movies tabell om den inte finns
db.run(`CREATE TABLE IF NOT EXISTS movies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  director TEXT,
  releaseYear INTEGER,
  genre TEXT
)`);

// GET route för att hämta alla filmer
app.get("/movies", (req, res) => {
  const sql = "SELECT * FROM movies";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.json(rows);
  });
});

// GET route för att hämta en specifik film
app.get("/movies/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM movies WHERE id = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    if (row) {
      res.json(row);
    } else {
      res.status(404).send("Film hittades inte");
    }
  });
});

// POST route för att lägga till en ny film
app.post("/movies", (req, res) => {
  const { title, director, releaseYear, genre } = req.body;
  if (!title || !director || !releaseYear || !genre) {
    res.status(400).send("Alla fält är obligatoriska");
    return;
  }
  const sql = `INSERT INTO movies (title, director, releaseYear, genre)
               VALUES (?, ?, ?, ?)`;
  db.run(sql, [title, director, releaseYear, genre], function (err) {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.status(201).json({ id: this.lastID });
  });
});

// PUT route för att uppdatera en film
app.put("/movies/:id", (req, res) => {
  const { id } = req.params;
  const { title, director, releaseYear, genre } = req.body;
  const sql = `UPDATE movies
                 SET title = ?, director = ?, releaseYear = ?, genre = ?
                 WHERE id = ?`;
  db.run(sql, [title, director, releaseYear, genre, id], function (err) {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.json({ message: `Film uppdaterad: ${this.changes}` });
  });
});

// DELETE route för att ta bort en film
app.delete("/movies/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM movies WHERE id = ?";
  db.run(sql, id, function (err) {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    res.json({ message: `Row(s) deleted: ${this.changes}` });
  });
});

// Starta servern
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
