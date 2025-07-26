Here is the complete and production-ready `README.md` file for your GitHub repository:
👉 [`https://github.com/Innocent-Developer/black-stone-voice-chat-room`](https://github.com/Innocent-Developer/black-stone-voice-chat-room)

---

```md
# 🎧 Black Stone Voice Chat Room

A full-stack real-time **voice and text chat application** built with **Node.js**, **React**, **MongoDB**, and **Socket.IO**. This project includes user interactions, room systems, gift functionality, level systems, admin tools, and release management – all tailored for a modern voice chat experience.

> Live and scalable voice room app for community, entertainment, and chat engagement.

---

## 🔖 Current Version

> **v1.0.30** – Released: July 26, 2025  
> Major update: **Level System, Gift XP Logic, Admin Release Management**

---

## 🚀 Features

- 🎙️ Real-time **voice and chat rooms**
- 🎁 **Gift system** (send/receive virtual items with value)
- 🧠 Dynamic **XP & Level system** (based on gift activity)
- 🛠 Admin panel tools: create gifts, manage users, approve actions
- 📲 Notifications using **Firebase Cloud Messaging (FCM)**
- 🎉 Release versioning with custom titles and notes
- 🧾 MongoDB data models with Mongoose

---

## 🧬 Tech Stack

| Area           | Technology                                |
|----------------|--------------------------------------------|
| Frontend       | Flutter,React.js, Tailwind CSS, Axios              |
| Backend        | Node.js, Express, Socket.IO                |
| Database       | MongoDB, Mongoose                          |
| Auth/Session   | JWT (JSON Web Token)                       |
| Notifications  | Firebase Cloud Messaging (FCM)             |
| Media & Upload | Cloudinary, Uploadcare (gifts/files)       |





## 🧪 Setup Instructions

1. **Clone this repo**
   ```bash
   git clone https://github.com/Innocent-Developer/black-stone-voice-chat-room.git
````

2. **Install Backend**

   ```bash
   cd black-stone-voice-chat-room/server
   npm install
   ```

3. **Install Frontend**

   ```bash
   cd ../client
   npm install
   ```

4. **Environment Variables**
   Add a `.env` file inside `/server` folder with:

   ```
   MONGO_URI=<your_mongodb_uri>
   JWT_SECRET=<your_jwt_secret>
   FCM_SERVER_KEY=<your_firebase_key>
   CLOUDINARY_API_KEY=<your_cloudinary_key>
   ```

5. **Run the project**

   ```bash
   # Start backend
   cd server && npm run dev

   # Start frontend
   cd ../client && npm start
   ```

---

## 🧠 Level System

```ts
// server/controllers/levelUpdate.js
// Calculates XP based on total gifts sent/received
const totalGiftsSent = records.reduce((total, record) => total + record.amount, 0);
user.level = calculateLevel(totalGiftsSent);
```

* 🎁 Sending gifts increases XP
* 📈 XP leads to automatic level ups
* 🎖️ Can be used for badges, unlocks, etc.

---

## 🔄 Release Management

Admin can push new releases with:

* 📌 Title
* 📝 Description
* 🏷 Tag version
* 🖼️ Optional image

Accessible via:

```js
POST /api/releases/create
GET /api/releases/latest
```

Example:

```json
{
  "title": "v1.1.0 – Level System & Gifting XP",
  "description": "XP-based level system added. Refined sender/receiver logic."
}
```

---

## 🎁 Gifting API

### Send Gift

```http
POST /api/gift/send
Content-Type: application/json

{
  "sender": "ui_id_123",
  "receiver": "ui_id_456",
  "amount": 500
}
```

* Validates both users
* Stores in `GiftRecords` schema
* Updates XP & triggers level change

---

## 📊 Admin Tools

* 🎁 Add/Remove gifts
* 🧾 Track records
* ✅ Approve/reject room backgrounds
* 🧰 Admin-only release creation

---

## ✨ Coming Soon

* 🎨 Room themes & customization
* 🪪 User verification (KYC optional)
* 📈 Leaderboards based on level & gifting

---

## 🤝 Contributing

Want to contribute? Open a PR or suggest ideas via Issues!
This is a growing platform with future goals to support:

* Multi-language support
* Streaming integration
* Premium rooms & token economy

---

## 📄 License

MIT License

---

## 👨‍💻 Maintainer

**Abubakkar Sajid** ([@Innocent-Developer](https://github.com/Innocent-Developer))
Founder of Mi-Networks | MERN Developer | Chat System Specialist

---

## 📎 Repository

[🔗 GitHub – black-stone-voice-chat-room](https://github.com/Innocent-Developer/black-stone-voice-chat-room)

> Let your users chat, gift, and grow their voice – all in real time 🔊

```

---

✅ You can now copy this directly into your `README.md` file in the root of your repo. Let me know if you want me to generate badges or a markdown TOC.
```
