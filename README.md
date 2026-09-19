# 💰 AI Financial Advisor

An AI-powered personal finance management web application designed to help users track income and expenses, monitor savings, understand spending patterns, and receive personalized financial insights.

The application combines a web-based frontend with a Node.js/Express backend, MySQL for structured financial data, JWT-based authentication, and AI-powered financial guidance.

## 🚀 Features

* 🔐 User authentication with JWT
* 💵 Income tracking
* 💳 Expense tracking by category
* 📊 Financial dashboard
* 📈 Automatic savings and savings-rate calculations
* 🤖 AI-powered financial advice
* 🚨 Financial alerts based on spending and savings patterns
* 📄 Monthly financial report generation in PDF format
* 🗄️ Persistent financial data using MySQL
* 🌐 RESTful backend APIs
* 🔑 Environment-based configuration for API credentials

## 🏗️ Architecture

```text
┌──────────────────────────────┐
│          Frontend            │
│     HTML / CSS / JavaScript  │
└──────────────┬───────────────┘
               │
               │ REST API
               ▼
┌──────────────────────────────┐
│       Node.js + Express      │
│                              │
│ Authentication               │
│ Income / Expense APIs        │
│ Dashboard                    │
│ AI Financial Advice          │
│ Alerts                       │
│ PDF Reports                  │
└──────────────┬───────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐  ┌────────────────┐
│    MySQL    │  │   AI Service   │
│             │  │   AI21 / LLM   │
└─────────────┘  └────────────────┘
```

## 🛠️ Technology Stack

### Backend

* Node.js
* Express.js
* MySQL
* JWT
* bcrypt / bcryptjs
* Axios
* dotenv
* PDFKit

### Frontend

* HTML
* CSS
* JavaScript

### AI

* AI21 Jamba
* AI-powered financial insight generation

### Development

* Nodemon
* npm

## 📂 Project Structure

```text
AI-Financial-Advisor/
│
├── Frontend/
│   ├── ...
│
├── app.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## 🔑 Core Functionality

### Authentication

Users authenticate through the application and receive a JWT token. Protected API endpoints use the token to identify the authenticated user.

### Income & Expense Management

Users can add and retrieve income and expense records.

Expense records are categorized, allowing the application to calculate spending patterns and provide a consolidated view of financial activity.

### Financial Dashboard

The dashboard calculates:

* Total income
* Total expenses
* Savings
* Savings rate

The backend calculates these values directly from the user's stored financial records.

### AI Financial Advice

The application collects relevant financial information such as:

* Total income
* Total expenses
* Savings
* Expense categories
* User questions

This information is sent to an AI service to generate contextual financial guidance.

### Financial Alerts

The system evaluates financial conditions and generates alerts when:

* Expenses exceed income
* The savings rate falls below a defined threshold

### Monthly Reports

The application can generate a downloadable PDF containing:

* Total income
* Total expenses
* Savings
* Monthly financial summary

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/Utie2519/AI-Financial-Advisor.git
cd AI-Financial-Advisor
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=3000

DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

JWT_SECRET=your_jwt_secret

AI21_API_KEY=your_ai21_api_key
```

Never commit your `.env` file to GitHub.

### 4. Configure MySQL

Create the required database and tables for:

* Users
* Income
* Expenses

Update the database credentials in your `.env` file.

### 5. Start the application

For development:

```bash
npm run dev
```

If Nodemon is not configured:

```bash
node app.js
```

The server runs on:

```text
http://localhost:3000
```

## 🔒 Security

The application uses:

* JWT authentication for protected API endpoints
* Password hashing using bcrypt
* Environment variables for sensitive credentials
* User-specific database queries

API keys and database credentials should never be committed to the repository.

## 📊 Example Financial Flow

```text
User
  │
  ├── Add Income
  │
  ├── Add Expenses
  │
  ▼
MySQL Database
  │
  ▼
Financial Analysis
  │
  ├── Income
  ├── Expenses
  ├── Savings
  └── Savings Rate
  │
  ├───────────────┐
  ▼               ▼
Alerts         AI Advice
  │               │
  └───────┬───────┘
          ▼
     User Dashboard
```

## 🎯 Future Improvements

* Investment portfolio tracking
* Budget planning and spending limits
* Interactive financial charts
* Expense forecasting
* Recurring transactions
* Personalized financial goals
* Improved AI recommendations
* Multi-currency support
* Email notifications
* Automated financial summaries

## ⚠️ Disclaimer

This application is intended for educational and informational purposes. AI-generated financial insights should not be considered professional financial, investment, tax, or legal advice.

## 👨‍💻 Author

**Utkarsh Sharma**

GitHub: [@Utie2519](https://github.com/Utie2519)

---

⭐ If you find this project useful, consider giving it a star.
