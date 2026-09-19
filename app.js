const express = require("express");
const cors = require("cors");

const app = express();
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config({ override: true });
const PDFDocument = require("pdfkit");
const fs = require("fs");
const axios = require("axios");
const path = require("path");

app.use(express.static(path.join(__dirname, "frontend")));

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

// DB CONNECTION
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect((err) => {
    if (err) {
        console.log("Database Error");
        console.log(err);
    } else {
        console.log("Database Connected");
    }
});


// ================= JWT MIDDLEWARE (FIXED) =================
function verifyToken(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Access Denied" });
    }

    const token = authHeader.split(" ")[1]; // 🔥 FIX HERE

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid Token" });
    }
}


// ================= REGISTER =================
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = "INSERT INTO users(name, email, password) VALUES (?, ?, ?)";

        connection.query(query, [name, email, hashedPassword], (err) => {
            if (err) {
                return res.status(500).json({ message: err.message });
            }

            res.status(201).json({ message: "User Registered Successfully" });
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ================= LOGIN =================
app.post("/login", (req, res) => {

    const { email, password } = req.body;

    const query = "SELECT * FROM users WHERE email = ?";

    connection.query(query, [email], async (err, results) => {

        if (err) return res.status(500).json({ message: err.message });

        if (results.length === 0) {
            return res.status(404).json({ message: "User Not Found" });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login Successful",
            token
        });
    });
});


// ================= PROFILE =================
app.get("/profile", verifyToken, (req, res) => {
    res.json({
        message: "Protected Route Accessed",
        user: req.user
    });
});


// ================= INCOME =================
app.post("/income", verifyToken, (req, res) => {

    const { source, amount } = req.body;

    const query = "INSERT INTO income(user_id, source, amount) VALUES (?, ?, ?)";

    connection.query(query, [req.user.id, source, amount], (err) => {
        if (err) return res.status(500).json({ message: err.message });

        res.json({ message: "Income Added Successfully" });
    });
});

app.get("/income", verifyToken, (req, res) => {

    connection.query(
        "SELECT * FROM income WHERE user_id = ?",
        [req.user.id],
        (err, results) => {
            if (err) return res.status(500).json({ message: err.message });

            res.json(results);
        }
    );
});


// ================= EXPENSE =================
app.post("/expense", verifyToken, (req, res) => {

    const { category, amount } = req.body;

    const query = "INSERT INTO expense(user_id, category, amount) VALUES (?, ?, ?)";

    connection.query(query, [req.user.id, category, amount], (err) => {
        if (err) return res.status(500).json({ message: err.message });

        res.json({ message: "Expense Added Successfully" });
    });
});

app.get("/expense", verifyToken, (req, res) => {

    connection.query(
        "SELECT * FROM expense WHERE user_id = ?",
        [req.user.id],
        (err, results) => {
            if (err) return res.status(500).json({ message: err.message });

            res.json(results);
        }
    );
});


// ================= DASHBOARD =================
app.get("/dashboard", verifyToken, (req, res) => {

    const incomeQuery = "SELECT SUM(amount) AS totalIncome FROM income WHERE user_id = ?";
    const expenseQuery = "SELECT SUM(amount) AS totalExpense FROM expense WHERE user_id = ?";

    connection.query(incomeQuery, [req.user.id], (err, incomeResult) => {

        if (err) return res.status(500).json({ message: err.message });

        connection.query(expenseQuery, [req.user.id], (err2, expenseResult) => {

            if (err2) return res.status(500).json({ message: err2.message });

            const totalIncome = Number(incomeResult[0].totalIncome) || 0;
            const totalExpense = Number(expenseResult[0].totalExpense) || 0;

            const savings = totalIncome - totalExpense;

            const savingsRate = totalIncome > 0
                ? ((savings / totalIncome) * 100).toFixed(2)
                : 0;

            res.json({
                totalIncome,
                totalExpense,
                savings,
                savingsRate: `${savingsRate}%`
            });
        });
    });
});


// ================= AI ADVICE =================
app.post("/ai/advice", verifyToken, async (req, res) => {

    try {

        const { message } = req.body;

        const db = connection.promise();

        const [income] = await db.query(
            "SELECT SUM(amount) AS total FROM income WHERE user_id=?",
            [req.user.id]
        );

        const [expense] = await db.query(
            "SELECT SUM(amount) AS total FROM expense WHERE user_id=?",
            [req.user.id]
        );

        const [categories] = await db.query(
            "SELECT category, SUM(amount) AS total FROM expense WHERE user_id=? GROUP BY category",
            [req.user.id]
        );

        const totalIncome = income[0].total || 0;
        const totalExpense = expense[0].total || 0;

        const savings = totalIncome - totalExpense;

        const categoryText = categories
            .map(c => `${c.category}: ${c.total}`)
            .join(", ");

        const prompt = `
User Income: ${totalIncome}
Expense: ${totalExpense}
Savings: ${savings}
Category: ${categoryText}
User Question: ${message}
`;

        const response = await axios.post(
            "https://api.ai21.com/studio/v1/chat/completions",
            {
                model: "jamba-mini",
                messages: [
                    { role: "system", content: "You are a financial advisor." },
                    { role: "user", content: prompt }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.AI21_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.json({
            reply: response.data.choices[0].message.content
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// ================= ALERTS =================
app.get("/alerts", verifyToken, async (req, res) => {

    const db = connection.promise();

    const [income] = await db.query(
        "SELECT SUM(amount) AS total FROM income WHERE user_id=?",
        [req.user.id]
    );

    const [expense] = await db.query(
        "SELECT SUM(amount) AS total FROM expense WHERE user_id=?",
        [req.user.id]
    );

    const totalIncome = income[0].total || 0;
    const totalExpense = expense[0].total || 0;

    const savingsRate = totalIncome
        ? ((totalIncome - totalExpense) / totalIncome) * 100
        : 0;

    let alerts = [];

    if (totalExpense > totalIncome) {
        alerts.push({ type: "DANGER", message: "Expenses > Income" });
    }

    if (savingsRate < 20) {
        alerts.push({ type: "WARNING", message: "Low savings rate" });
    }

    res.json({
        totalAlerts: alerts.length,
        alerts
    });
});

app.get("/report/monthly", verifyToken, async (req, res) => {
    try {
        const db = connection.promise();

        const [income] = await db.query(
            "SELECT SUM(amount) AS total FROM income WHERE user_id=?",
            [req.user.id]
        );

        const [expense] = await db.query(
            "SELECT SUM(amount) AS total FROM expense WHERE user_id=?",
            [req.user.id]
        );

        const totalIncome = income[0].total || 0;
        const totalExpense = expense[0].total || 0;
        const savings = totalIncome - totalExpense;

        const fileName = `report_${req.user.id}_${Date.now()}.pdf`;
        const filePath = `./${fileName}`;

        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // CONTENT
        doc.fontSize(20).text("Monthly Financial Report", { align: "center" });
        doc.moveDown();

        doc.fontSize(14).text(`Income: ₹${totalIncome}`);
        doc.text(`Expense: ₹${totalExpense}`);
        doc.text(`Savings: ₹${savings}`);

        doc.moveDown();
        doc.text("Generated by AI Financial Advisor");

        // END PDF
        doc.end();

        // IMPORTANT: wait for file fully written
        stream.on("finish", () => {

            res.download(filePath, (err) => {
                if (!err) {
                    // delete AFTER download completes
                    fs.unlink(filePath, () => {});
                }
            });

        });

        stream.on("error", (err) => {
            res.status(500).json({ message: "PDF generation failed" });
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// ================= HOME =================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "index.html"));
});


// ================= START SERVER =================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});