# EFIR: Advanced Complaint Management Solution

**E**fficient **F**iling & **I**ntelligent **R**esolution

*A next-generation complaint management platform powered by MERN stack and Generative AI*
</div>

---

## 📋 Overview

EFIR is a comprehensive complaint management platform built using the MERN stack and enhanced with Generative AI capabilities. The system streamlines legal processes, reduces latency, and offers robust security measures through its innovative dual-portal architecture.

## 🌟 Key Features

### 🔐 Dual Portal System

#### Regular Users
- Securely file complaints and submit digital evidence
- Receive unique complaint IDs for tracking
- Access AI-powered legal guidance

#### Super Users (Judiciary & Police)
- Access intelligently categorized complaints
- Receive real-time automated updates
- Leverage AI-assisted case handling tools

### 🛡️ Enhanced Security Framework

| Technology | Purpose |
|------------|---------|
| JWT Authentication | Secure session management with token-based access |
| Base64 Encryption | Protection of sensitive data including digital evidence |
| Socket.io + OTP | Real-time layer of verification for login sessions |
| bcryptJS | Encryption of evidence files to ensure integrity |

### 🤖 Generative AI Integration

- **AI-Powered Legal Guidance**: Provides users with preliminary legal suggestions
- **Smart Complaint Filtering**: Intelligently classifies and prioritizes complaints for authorities
- **Automated Decision Support**: Assists in optimizing case management workflows

### 🖥️ Intuitive User Interface

- Built with React for a responsive and user-friendly experience
- Modular component architecture optimized for fast loading and maintainability

### 📬 Real-time Notification System

- NodeMailer integration for instant email alerts on complaint updates
- In-app notifications for important status changes

### ⚡ Performance Optimization

- Gemini AI automation reduces response times
- Optimized database queries and caching strategies
- Efficient resource utilization for improved system performance

---

## 🛠️ Technology Stack

### Frontend
- **ReactJS**: Dynamic, interactive user interface
- **Gemini AI**: Smart decision-making and automation

### Backend
- **NodeJS + ExpressJS**: Scalable, efficient server architecture
- **Socket.io**: Real-time OTP validation and notifications
- **NodeMailer**: Automated email service integration

### Database
- **MongoDB + Mongoose**: NoSQL database with schema modeling and validation

### Security
- **JWT**: Token-based secure authentication
- **bcryptJS**: Encryption of sensitive user data and evidence
- **Base64**: Additional encryption layer for critical data

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v12+)
- MongoDB (local or cloud instance)

### Steps to Install

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd efir
   ```

2. **Install Dependencies**
   ```bash
   npm install
   cd client
   npm install
   cd ..
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email_address
   EMAIL_PASS=your_email_password
   ```

4. **Start the Application**
   ```bash
   npm run dev
   ```

   Visit: http://localhost:5000

---

## 🚀 Usage Guide

### User Authentication
- Register/login with secure OTP verification
- Sessions protected using JWT tokens

### Complaint Management
- File and track complaints through an intuitive interface
- Super users manage cases with AI-based filtering and notifications

### AI Legal Assistance
- Users receive GenAI-powered legal suggestions
- Automated classification improves case prioritization

### Data Protection
- All user and evidence data is encrypted and securely stored

---

## 📊 System Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Client Layer  │      │  Application    │      │   Data Layer    │
│   (React.js)    │◄────►│   Layer (Node)  │◄────►│   (MongoDB)     │
└─────────────────┘      └─────────────────┘      └─────────────────┘
        ▲                        ▲                         ▲
        │                        │                         │
        ▼                        ▼                         ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   UI Components │      │  API Services   │      │ Data Models &   │
│   & Gemini AI   │      │  & Controllers  │      │   Validation    │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

---

## 💼 Contact & Contribution

Have feedback or want to collaborate? Join us in transforming legal systems with EFIR!

- **Project Maintainer**: Ganesh Tambekar(mailto:ganesh.tambekar124@gmail.com)

---

<div align="center">
  
### Let's build a smarter, faster, and safer justice system 🚀

</div>
