/**
 * Chat System Test Examples
 * This file demonstrates how to use the enhanced chat system
 * 
 * NOTE: This is for demonstration purposes only.
 * Remove this file after testing or move to a test directory.
 */

const express = require('express');
const app = express();

// Example usage of the enhanced chat system

console.log('🚀 Chat System Examples');
console.log('======================');

console.log(`
📝 User-to-User Chat Examples:
==============================

1. Send a direct message:
POST /chats/send
{
  "receiverId": "507f1f77bcf86cd799439011",
  "content": "Hello! How are you doing?",
  "title": "Greeting",
  "image": "https://example.com/image.jpg"
}

2. Get conversation with another user:
GET /chats/conversation/507f1f77bcf86cd799439011?page=1&limit=20

3. Get all conversations:
GET /chats/conversations

4. Mark message as read:
PATCH /chats/messages/507f1f77bcf86cd799439012/read

5. Delete a message:
DELETE /chats/messages/507f1f77bcf86cd799439012

---

📢 Admin Broadcast Examples:
============================

1. Broadcast to all users:
POST /chats/admin/broadcast
{
  "title": "System Maintenance Notice",
  "content": "The system will be under maintenance from 2-4 PM today. Please save your work.",
  "image": "https://example.com/maintenance.jpg"
}

2. Targeted broadcast to specific users:
POST /chats/admin/broadcast
{
  "title": "VIP Announcement",
  "content": "Special offer for VIP members only!",
  "targetUsers": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439013"]
}

3. Get admin broadcast statistics:
GET /chats/admin/stats

4. Get all users for targeting:
GET /chats/admin/users

---

🏠 Room Chat Examples:
======================

1. Send message in room:
POST /room/ROOM123/chat
{
  "ui_id": "1001",
  "message": "Hello everyone in this room!"
}

2. Get room messages:
GET /room/ROOM123/chat

---

📊 Response Examples:
====================

✅ Successful message send:
{
  "message": "Message sent successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "senderId": "507f1f77bcf86cd799439010",
    "receiverId": "507f1f77bcf86cd799439011",
    "content": "Hello!",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "read": false
  }
}

✅ Successful broadcast:
{
  "message": "Broadcast sent to 150 users successfully",
  "sentTo": 150,
  "messages": [...] 
}

❌ Error response:
{
  "message": "Receiver not found",
  "error": "User with the specified ID does not exist"
}

---

🔐 Authentication:
==================

All requests require JWT token in header:
Authorization: Bearer <your-jwt-token>

Admin endpoints require admin role in the token payload.

---

🎯 Key Features:
================

✅ Real-time messaging support
✅ Message read status tracking
✅ Pagination for all list endpoints
✅ Soft delete functionality
✅ Admin broadcast to all or specific users
✅ Room-based chat
✅ Image and file support
✅ Conversation management
✅ Admin statistics and analytics
✅ Error handling and validation

---

📱 Socket.IO Integration:
=========================

The system emits the following events:

1. User Messages:
   - 'receive_message' - When user receives a direct message
   
2. Admin Broadcasts:
   - 'admin_broadcast' - When admin sends a broadcast message

3. Room Messages:
   - 'room_message' - When someone sends a message in a room

Example Socket.IO client code:

socket.on('receive_message', (message) => {
  console.log('New message:', message);
  // Update UI with new message
});

socket.on('admin_broadcast', (broadcast) => {
  console.log('Admin broadcast:', broadcast);
  // Show notification or update UI
});

---

🛠️ Database Schema:
===================

Messages are stored with the following structure:
- senderId: Reference to sender user
- receiverId: Reference to receiver user  
- conversationId: Reference to conversation
- content: Message text (max 2000 chars)
- title: Optional title (max 100 chars)
- image: Optional image URL
- messageType: 'text', 'image', 'file', 'system'
- isAdminBroadcast: Boolean flag for admin messages
- read: Boolean read status
- readAt: Timestamp when read
- deletedFor: Array of users who deleted the message
- createdAt/updatedAt: Timestamps

Conversations store:
- members: Array of 2 user IDs
- lastMessage: Reference to latest message
- unreadCount: Number of unread messages
- deletedFor: Array of users who deleted conversation

---

📚 API Endpoints Summary:
=========================

User Chat:
  POST   /chats/send                    - Send direct message
  GET    /chats/conversation/:userId    - Get conversation messages
  GET    /chats/conversations           - Get all conversations
  PATCH  /chats/messages/:id/read       - Mark message as read
  DELETE /chats/messages/:id            - Delete message
  DELETE /chats/conversations/:id       - Delete conversation

Admin Broadcast:
  POST   /chats/admin/broadcast         - Send broadcast message
  GET    /chats/admin/broadcasts        - Get admin broadcasts
  GET    /chats/admin/users            - Get users list
  GET    /chats/admin/stats            - Get broadcast statistics

Room Chat:
  POST   /room/:roomId/chat            - Send room message  
  GET    /room/:roomId/chat            - Get room messages

All endpoints support proper error handling, authentication,
and return standardized JSON responses.
`);

// Programmatic examples (if running in actual environment)
const demonstrateUsage = () => {
    console.log('🧪 For actual testing, use the provided API endpoints with tools like:');
    console.log('   - Postman');
    console.log('   - cURL');
    console.log('   - Frontend fetch() calls');
    console.log('   - Thunder Client (VS Code extension)');
    console.log('');
    console.log('📖 See CHAT_API_DOCUMENTATION.md for complete documentation');
};

if (require.main === module) {
    demonstrateUsage();
}

module.exports = {
    demonstrateUsage
}; 