const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Initialize SQLite in-memory database
const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error("Failed to connect to database:", err);
    } else {
        console.log("Connected to SQLite in-memory database.");
        db.run(`CREATE TABLE users (username TEXT, password TEXT)`);
    }
});

// Endpoint to store user data
app.post('/storeUser', (req, res) => {
    const { username, password } = req.body;
    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, password], (err) => {
        if (err) {
            res.status(500).json({ error: "Failed to store data" });
        } else {
            res.json({ message: "Data stored successfully" });
        }
    });
});

// Endpoint to fetch user data
app.get('/getUserData', (req, res) => {
    db.all(`SELECT * FROM users`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: "Failed to fetch data" });
        } else {
            res.json(rows);
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});