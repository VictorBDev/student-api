const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const db = new sqlite3.Database('./students.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the students database.');
});

db.run(`CREATE TABLE IF NOT EXISTS estudiantes (
  _id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  carrera TEXT NOT NULL,
  edad INTEGER NOT NULL,
  fecha_ingreso TEXT NOT NULL
)`);

app.get('/students', (req, res) => {
  db.all("SELECT * FROM estudiantes", [], (err, rows) => {
    if (err) {
      res.status(400).json({"error":err.message});
      return;
    }
    res.json({
      "message":"success",
      "data":rows
    });
  });
});

app.get('/students/:id', (req, res) => {
  db.get("SELECT * FROM estudiantes WHERE _id = ?", [req.params.id], (err, row) => {
    if (err) {
      res.status(400).json({"error":err.message});
      return;
    }
    res.json({
      "message":"success",
      "data":row
    });
  });
});

app.post('/students', (req, res) => {
  const {nombre, carrera, edad, fecha_ingreso} = req.body;
  db.run(`INSERT INTO estudiantes (nombre, carrera, edad, fecha_ingreso) VALUES (?,?,?,?)`,
    [nombre, carrera, edad, fecha_ingreso],
    function(err) {
      if (err) {
        res.status(400).json({"error": err.message});
        return;
      }
      res.json({
        "message": "success",
        "data": {id: this.lastID}
      });
    });
});

app.put('/students/:id', (req, res) => {
  const {nombre, carrera, edad, fecha_ingreso} = req.body;
  db.run(`UPDATE estudiantes SET nombre = ?, carrera = ?, edad = ?, fecha_ingreso = ? WHERE _id = ?`,
    [nombre, carrera, edad, fecha_ingreso, req.params.id],
    function(err) {
      if (err) {
        res.status(400).json({"error": err.message});
        return;
      }
      res.json({
        message: "success",
        data: {changes: this.changes}
      });
    });
});

app.delete('/students/:id', (req, res) => {
  db.run(`DELETE FROM estudiantes WHERE _id = ?`,
    req.params.id,
    function(err) {
      if (err) {
        res.status(400).json({"error": err.message});
        return;
      }
      res.json({"message":"deleted", changes: this.changes});
    });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});