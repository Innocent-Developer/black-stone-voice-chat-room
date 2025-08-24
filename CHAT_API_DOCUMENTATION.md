# Chat System API Documentation

This document describes the enhanced chat system that supports both **user-to-user messaging** and **admin broadcast messages**.

## Overview

The chat system provides:
- User-to-user private messaging
- Admin broadcast messaging to all users or specific users
- Message read status tracking
- Pagination support
- Soft delete functionality
- Message search and filtering

## Authentication

All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## User-to-User Chat Endpoints

### 1. Send a Direct Message
**POST** `/chats/send`

Send a private message to another user.

**Request Body:**
```json
{
  "receiverId": "user_object_id",
  "content": "Hello, how are you?",
  "title": "Optional message title",
  "image": "Optional image URL"
}
```

**Response:**
```json
{
  "message": "Message sent successfully",
  "data": {
    "_id": "message_id",
    "senderId": "sender_object_id",
    "receiverId": "receiver_object_id",
    "conversationId": "conversation_id",
    "content": "Hello, how are you?",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "read": false
  }
}
```

### 2. Get Conversation Messages
**GET** `/chats/conversation/:receiverId`

Get all messages between you and another user.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Messages per page (default: 50)

**Response:**
```json
{
  "messages": [
    {
      "_id": "message_id",
      "senderId": {
        "_id": "sender_id",
        "name": "John Doe",
        "username": "johndoe",
        "profilePicture": "image_url"
      },
      "content": "Hello!",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "read": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25
  }
}
```

### 3. Get All Conversations
**GET** `/chats/conversations`

Get all conversations for the authenticated user.

**Response:**
```json
[
  {
    "_id": "conversation_id",
    "members": [
      {
        "_id": "user_id",
        "name": "John Doe",
        "username": "johndoe",
        "profilePicture": "image_url"
      }
    ],
    "lastMessage": {
      "_id": "message_id",
      "content": "Last message content",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "unreadCount": 3,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### 4. Create or Get Conversation
**POST** `/chats/conversations`

Create a new conversation or get existing one with another user.

**Request Body:**
```json
{
  "receiverId": "user_object_id"
}
```

### 5. Mark Message as Read
**PATCH** `/chats/messages/:messageId/read`

Mark a specific message as read.

**Response:**
```json
{
  "message": "Message marked as read",
  "data": {
    "_id": "message_id",
    "read": true,
    "readAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 6. Delete Message
**DELETE** `/chats/messages/:messageId`

Soft delete a message (only sender can delete their own messages).

### 7. Delete Conversation
**DELETE** `/chats/conversations/:conversationId`

Soft delete an entire conversation and all its messages.

### 8. Get Chat History
**GET** `/chats/history/:user2Id`

Get full chat history between authenticated user and another user.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Messages per page (default: 50)

### 9. Get All User Messages
**GET** `/chats/user/all-messages`

Get all messages where the user is sender or receiver.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Messages per page (default: 50)

## Admin Broadcast Endpoints

### 1. Send Broadcast Message
**POST** `/chats/admin/broadcast`

Send a message to all users or specific users (Admin only).

**Request Body:**
```json
{
  "title": "Important Announcement",
  "content": "This is an important message for all users",
  "image": "Optional image URL",
  "targetUsers": ["user_id_1", "user_id_2"] // Optional: specific users
}
```

**Response:**
```json
{
  "message": "Broadcast sent to 150 users successfully",
  "sentTo": 150,
  "messages": [
    {
      "_id": "message_id",
      "content": "Broadcast content",
      "isAdminBroadcast": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. Get Broadcast Messages
**GET** `/chats/admin/broadcasts`

Get all broadcast messages sent by admin.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Messages per page (default: 50)

### 3. Get Users List
**GET** `/chats/admin/users`

Get list of all users for targeted broadcasting (Admin only).

**Response:**
```json
{
  "users": [
    {
      "_id": "user_id",
      "name": "John Doe",
      "username": "johndoe",
      "profilePicture": "image_url",
      "ui_id": 1001,
      "email": "john@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 150
}
```

### 4. Get Admin Statistics
**GET** `/chats/admin/stats`

Get statistics about admin broadcasts.

**Response:**
```json
{
  "totalBroadcasts": 25,
  "totalUsers": 150,
  "unreadBroadcasts": 75,
  "recentBroadcasts": 5,
  "readRate": "50.00"
}
```

## Room Chat Endpoints

### 1. Send Room Message
**POST** `/room/:roomId/chat`

Send a message in a specific room.

**Request Body:**
```json
{
  "ui_id": "user_ui_id",
  "message": "Hello everyone in the room!"
}
```

### 2. Get Room Messages
**GET** `/room/:roomId/chat`

Get all messages in a specific room.

## Message Schema

```javascript
{
  "_id": "ObjectId",
  "senderId": "ObjectId", // Reference to User
  "receiverId": "ObjectId", // Reference to User
  "conversationId": "ObjectId", // Reference to Conversation
  "content": "String", // Message content (max 2000 chars)
  "title": "String", // Optional title (max 100 chars)
  "image": "String", // Optional image URL
  "messageType": "String", // 'text', 'image', 'file', 'system'
  "isAdminBroadcast": "Boolean", // true for admin broadcasts
  "read": "Boolean", // Read status
  "readAt": "Date", // When message was read
  "deliveredAt": "Date", // When message was delivered
  "deletedFor": ["ObjectId"], // Users who deleted this message
  "isEdited": "Boolean", // Whether message was edited
  "editedAt": "Date", // When message was edited
  "replyTo": "ObjectId", // Reference to replied message
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Error Responses

All endpoints return appropriate HTTP status codes:

- `200`: Success
- `201`: Created successfully
- `400`: Bad request (missing required fields)
- `401`: Unauthorized (invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found
- `500`: Internal server error

Error response format:
```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Usage Examples

### User Chat Example
```javascript
// Send a message
const response = await fetch('/chats/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    receiverId: '507f1f77bcf86cd799439011',
    content: 'Hello there!'
  })
});

// Get conversations
const conversations = await fetch('/chats/conversations', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```

### Admin Broadcast Example
```javascript
// Send broadcast to all users
const broadcast = await fetch('/chats/admin/broadcast', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + adminToken
  },
  body: JSON.stringify({
    title: 'System Maintenance',
    content: 'The system will be under maintenance from 2-4 PM today.'
  })
});

// Send to specific users
const targetedBroadcast = await fetch('/chats/admin/broadcast', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + adminToken
  },
  body: JSON.stringify({
    title: 'VIP Notice',
    content: 'Special announcement for VIP users',
    targetUsers: ['user1_id', 'user2_id', 'user3_id']
  })
});
```

## Features

- ✅ User-to-user private messaging
- ✅ Admin broadcast messaging
- ✅ Targeted admin broadcasts
- ✅ Message read status tracking
- ✅ Pagination support
- ✅ Soft delete functionality
- ✅ Message search and filtering
- ✅ Room-based chat
- ✅ Real-time messaging support
- ✅ Admin statistics and analytics
- ✅ Conversation management
- ✅ Message type support (text, image, file)

## Notes

1. All messages support soft deletion - messages are not permanently deleted but marked as deleted for specific users
2. Admin broadcasts create individual conversations with each target user
3. Pagination is available on all list endpoints for better performance
4. Read status is automatically updated when fetching conversation messages
5. Room chat is separate from direct messaging and follows different rules
6. All endpoints include proper error handling and validation 