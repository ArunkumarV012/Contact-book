const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db'); 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/contacts', (req, res) => {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({ error: 'Name, email, and phone are required.' });
    }

    const sql = `INSERT INTO contacts (name, email, phone) VALUES (?, ?, ?)`;
    db.run(sql, [name, email, phone], function (err) {
        if (err) {
            
            if (err.code === 'SQLITE_CONSTRAINT') {
                return res.status(409).json({ error: 'A contact with this email already exists.' });
            }
            return res.status(500).json({ error: 'Failed to add contact.' });
        }
       
        res.status(201).json({ id: this.lastID, name, email, phone });
    });
});

app.get('/contacts', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const sqlCount = `SELECT COUNT(*) AS total FROM contacts`;
    const sqlSelect = `SELECT * FROM contacts ORDER BY name ASC LIMIT ? OFFSET ?`;

    db.get(sqlCount, [], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch total count.' });
        }
        const total = row.total;

        db.all(sqlSelect, [limit, offset], (err, contacts) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch contacts.' });
            }
            res.json({
                contacts,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            });
        });
    });
});

app.delete('/contacts/:id', (req, res) => {
    const { id } = req.params;

    const sql = `DELETE FROM contacts WHERE id = ?`;
    db.run(sql, id, function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete contact.' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Contact not found.' });
        }
        res.status(204).send(); 
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
