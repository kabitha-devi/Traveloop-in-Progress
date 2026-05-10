# 🧳 Traveloop — AI-Powered Intelligent Travel Companion

**Traveloop** is a next-generation travel planning and management platform designed to eliminate the friction of itinerary creation. Built for the **Odoo x KAHE Coimbatore Hackathon**, it leverages advanced AI to transform vague travel ideas into detailed, budget-optimized, and personalized experiences.

---

## 🚀 The Problem
Planning a trip is often more stressful than the trip itself. Travelers face:
- **Decision Fatigue**: Sifting through thousands of attractions.
- **Budget Mismatch**: Itineraries that don't align with actual costs.
- **Logistical Conflicts**: Overlapping activities or closed attractions.
- **Language Barriers**: Struggling to find help in emergency situations.
- **Static Packing**: Generic lists that don't account for destination specificities.

## 💡 The Solution
Traveloop acts as your personal AI travel agent. It doesn't just list places; it **thinks** for you. By combining LLM-driven generation with a curated destination knowledge base, it provides:
- **Instant Itineraries**: 1-click generation based on destination, budget, and days.
- **Context-Aware Recommendations**: Suggestions that scale based on your actual wallet size.
- **Proactive Planning**: Identifying conflicts and weather risks before you even leave home.

---

## 🛠 Tech Stack

### **Frontend**
- **React 19 & Vite**: High-performance, modern UI framework.
- **Framer Motion**: Premium, fluid micro-animations for a "luxury" app feel.
- **Zustand**: Lightweight, high-speed state management with persistence.
- **Tailwind CSS**: Custom-designed utility styling for a sleek, glassmorphic aesthetic.
- **Lucide React**: Consistent, high-quality iconography.

### **Backend**
- **Node.js & Express**: Scalable and fast server-side execution.
- **Prisma ORM**: Type-safe database interactions with SQLite (dev) / PostgreSQL (prod).
- **Google Gemini AI**: The "brain" powering trip generation and analysis.
- **Socket.io**: Real-time updates for community interactions.
- **Cloudinary**: Cloud-based storage for user profile and trip photos.

---

## ✨ Novelties & Competitive Edge
What makes Traveloop different from TripAdvisor or Google Travel?

1.  **AI Mood Planner**: Don't know where to go? Select your "Mood" (Adventure, Relax, Party, Culture) and let the AI find the destination and plan the vibe for you.
2.  **Emergency Phrase Engine**: Not just a translator. It provides native script, phonetic pronunciation, and audio-style guidance for critical phrases (Police, Doctor, Lost Passport) tailored to the specific country you are visiting.
3.  **Conflict Detection 🧠**: The AI scans your itinerary for logical errors (e.g., "The temple is 2 hours away from your previous stop, you won't make it in time") and suggests fixes.
4.  **Budget Optimizer**: Analyzes your spending across Accommodation, Transport, and Food, suggesting specific areas to save (e.g., "Switch to local dhabas in Tirupati to save $40").
5.  **Smart "Add to Trip"**: Click any suggested activity, and it's **automatically** injected into your itinerary logic without manual typing.
6.  **Destination-Aware Mocking**: Even if the AI API is down, our sophisticated "Destination Knowledge Base" ensures Tirupati, Kerala, and Goa return real, site-specific landmarks, not generic placeholders.

---

## 🏗 Features Overview

### **1. AI Trip Builder**
- Define your budget, destination, and dates.
- Get a complete day-wise breakdown including Hotels, Activities, and Transport costs.
- **Scaling Logic**: A $50 trip and a $5000 trip look different. Our AI scales the luxury level based on your budget.

### **2. AI Smart Packing**
- Generates a list of essentials based on your destination's climate and activities.
- *Novelty*: Includes "Essential Reasons" (e.g., "Pack a Dhoti — Mandatory for Tirumala entry").

### **3. Community & Social**
- Share your best trips with the world.
- "Copy Trip": See a plan you like? One click copies it into your personal dashboard for editing.

### **4. Travel Journal**
- Document your memories with AI-assisted entry generation.

---

## 🛣 Road to Perfection (Future Scope)
To make Traveloop the ultimate "Super App" for travel:
- **Direct Booking Integration**: One-click booking for the hotels and flights suggested in the AI itinerary via Odoo's booking modules.
- **Real-Time Group Planning**: Collaborative "Live Rooms" where friends can vote on activities and see budget changes in real-time.
- **AR Navigation**: Augmented reality overlays to find the specific "hidden gems" mentioned in the AI report.
- **Offline Mode**: Downloading AI itineraries and emergency phrases as PWA (Progressive Web App) for use in zero-connectivity zones.
- **Expense Tracker**: Integration with bank APIs or manual entry to track real-time spending against the AI's predicted budget.

---

## 🛠 Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/jayachandran-jk/Odoo-x-KAHE-Coimbatore-Hackathon-26-Traveloop.git
    ```

2.  **Setup Backend**
    ```bash
    cd backend
    npm install
    cp .env.example .env # Update your GEMINI_API_KEY
    npx prisma generate
    npm run dev
    ```

3.  **Setup Frontend**
    ```bash
    cd ..
    npm install
    npm run dev
    ```

---

**Developed for the Odoo x KAHE Coimbatore Hackathon 2026** 🚀
