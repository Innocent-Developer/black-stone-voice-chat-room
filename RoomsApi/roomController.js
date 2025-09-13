// controllers/roomController.js
const Room = require("../schema/RoomsApi-Schema");
const User = require("../schema/account-create");

const generateRoomId = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
// Create Room
exports.createRoom = async (req, res) => {
  try {
    let roomId;
    let existingRoom;
     const { ui_id } = req.body;

    // Ensure roomId is unique
    do {
      roomId = generateRoomId();
      existingRoom = await Room.findOne({ roomId });
    } while (existingRoom);

    req.body.roomId = roomId;
    const roomData = {
      ...req.body,
      members: [ui_id], // Add the user as the first member
    };

    const room = await Room.create(roomData);
    res.status(201).json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// Delete Room
exports.deleteRoom = async (req, res) => {
  try {
    await Room.findOneAndDelete({ roomId: req.params.roomId });
    
    res.status(200).json({ message: "Room deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update Room
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findOneAndUpdate(
      { roomId: req.params.roomId },
      {
        roomName: req.body.roomName,
        roomThemeImage: req.body.roomThemeImage,
      },
      { new: true }
    );
    res.status(200).json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Block/Kick User
exports.blockUser = async (req, res) => {
  try {
    const { ui_id, roomId, type } = req.body;
    const expiry =
      type === "temporary" ? new Date(Date.now() + 2 * 60 * 60 * 1000) : null;

    await User.findOneAndUpdate(
      { ui_id },
      {
        $push: {
          blockedRooms: {
            roomId,
            type,
            expiry,
          },
        },
      }
    );

    res.status(200).json({ message: `${type} block applied` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Join Room
exports.joinRoom = async (req, res) => {
  try {
    const { roomId, ui_id, roomKey } = req.body;

    const room = await Room.findOne({ roomId });
    const user = await User.findOne({ ui_id });

    if (!room || !user)
      return res.status(404).json({ error: "Room or User not found" });

    // Check if room is banned
    if (room.roomBan?.isBanned) {
      const now = new Date();
      const isExpired = room.roomBan.expiresAt && now > room.roomBan.expiresAt;

      if (!isExpired) {
        return res.status(403).json({
          error: `Room is currently banned (${room.roomBan.type}). Reason: ${room.roomBan.reason}`,
        });
      } else {
        // Auto-unban expired ban
        room.roomBan = {
          isBanned: false,
          type: null,
          bannedAt: null,
          expiresAt: null,
          reason: null,
        };
        await room.save();
      }
    }

    // Check if user is blocked
    const isBlocked = user.blockedRooms.find(
      (b) =>
        b.roomId === roomId &&
        (b.type === "permanent" ||
          (b.expiry && new Date(b.expiry) > new Date()))
    );
    if (isBlocked)
      return res.status(403).json({ error: "User is blocked from this room" });

    if (room.members.includes(ui_id)) {
      return res.status(400).json({ message: "User already in room" });
    }

    // if (room.members.length >= room.maxUsers)
    //   return res.status(403).json({ error: "Room is full" });

    // Private room: require correct key
    if (room.roomLabel === "Private") {
      if (!roomKey || roomKey !== room.roomKey) {
        return res.status(401).json({ error: "Invalid or missing room key" });
      }
    }
    // update total members in room
    room.totalMembers = room.members.length + 1;

    // Add user to room
    room.members.push(ui_id);
    await room.save();

    res.status(200).json({
      message: `User joined ${room.roomLabel.toLowerCase()} room successfully`,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// chat in room
// POST /room/:roomId/chat
exports.sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params; // ✅ Get roomId from URL params
    const { ui_id, message } = req.body;

    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ error: "Room not found" });

    // Check if room is banned
    if (room.roomBan?.isBanned) {
      const now = new Date();
      const isExpired = room.roomBan.expiresAt && now > room.roomBan.expiresAt;

      if (!isExpired) {
        return res.status(403).json({
          error: `Room is currently banned (${room.roomBan.type}). Reason: ${room.roomBan.reason}`,
        });
      } else {
        // Auto-unban expired ban
        room.roomBan = {
          isBanned: false,
          type: null,
          bannedAt: null,
          expiresAt: null,
          reason: null,
        };
        await room.save();
      }
    }

    // Check if chat is disabled
    if (!room.chatEnabled) {
      return res
        .status(403)
        .json({ error: "Chat is disabled in this room by admin." });
    }

    // Check if user is a room member
    const isMember = room.members.includes(ui_id);
    if (!isMember) {
      return res
        .status(403)
        .json({ error: "You must join the room to send messages." });
    }

    // Save message
    room.chat.push({ sender: ui_id, message });
    await room.save();

    res.status(200).json({ message: "Message sent" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId });

    if (!room) return res.status(404).json({ error: "Room not found" });

    res.status(200).json({ chat: room.chat });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// Get All Rooms
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    // show total members in each room
    const totalUser = rooms.map(room => ({
      ...room.toObject(),
      memberCount: room.members.length
    }));
    res.status(200).json(rooms, totalUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get Room by ID
exports.getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId });
    // get total user in room
    const totalUser = room.members.length;
    console.log(totalUser);
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.status(200).json(room,totalUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT /admin/room-chat-toggle/:roomId
exports.adminChatBan = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { chatEnabled } = req.body; // true or false

    const room = await Room.findOneAndUpdate(
      { roomId },
      { chatEnabled },
      { new: true }
    );

    if (!room) return res.status(404).json({ error: "Room not found" });

    res
      .status(200)
      .json({ message: `Chat is now ${chatEnabled ? "enabled" : "disabled"}` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// POST /admin/ban-room
exports.banRoom = async (req, res) => {
  try {
    const { roomId, type, reason, customDurationInHours } = req.body;

    let expiresAt = null;
    const now = new Date();

    if (type === "day") {
      expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    } else if (type === "month") {
      expiresAt = new Date(now.setMonth(now.getMonth() + 1));
    } else if (type === "custom") {
      expiresAt = new Date(
        now.getTime() + customDurationInHours * 60 * 60 * 1000
      );
    }

    await Room.findOneAndUpdate(
      { roomId },
      {
        roomBan: {
          isBanned: true,
          type,
          reason,
          bannedAt: new Date(),
          expiresAt: type === "permanent" ? null : expiresAt,
        },
      }
    );

    res.status(200).json({ message: `Room banned ${type}`, expiresAt });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// POST /admin/unban-room
exports.unbanRoom = async (req, res) => {
  try {
    const { roomId } = req.body;

    const room = await Room.findOneAndUpdate(
      { roomId },
      { "roomBan.isBanned": false, "roomBan.expiresAt": null },
      { new: true }
    );
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.status(200).json({ message: "Room unbanned successfully", room });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



exports.usergetAllroomsdRooms = async (req, res) => {
  try {
    const { ui_id } = req.body;

    const rooms = await Room.find({ members: ui_id });
    if (!rooms || rooms.length === 0) {
      return res.status(404).json({ message: "No rooms found for this user" });
    }

    res.status(200).json(rooms);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}


exports.kickOffMember = async (req, res) => {
  try {
    const { roomId, ui_id } = req.body;

    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ error: "Room not found" });

    const isMember = room.members.includes(ui_id);
    if (!isMember) return res.status(404).json({ error: "Member not found in room" });
    // update total members in room
    room.totalMembers = room.members.length - 1;
    room.members.pull(ui_id);
    await room.save();

    res.status(200).json({ message: "Member kicked off successfully", room });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//create a new api that are use to seen all gift send form users in this room 
exports.getRoomGifts = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ error: "Room not found" });

    res.status(200).json({ gifts: room.gifts || [] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Endpoint to send a gift in a room
exports.sendGift = async (req, res) => {
  try {
    const { roomId, ui_id, giftType, giftValue } = req.body;

    const room = await Room.find({roomId });
    const user = await User.find({ui_id});
    
    if (!room || !user)
      return res.status(404).json({ error: "Room or User not found" }); 
    // Check if user is a room member
    const isMember = room.members.includes(ui_id);
    if (!isMember) {
      return res
        .status(403)
        .json({ error: "You must join the room to send gifts." });
    }

    // Add gift to room's gifts array
    room.gifts.push({ sender: ui_id, giftType, giftValue });
    await room.save();

    res.status(200).json({ message: "Gift sent successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};  

// leave user room 

exports.leaveRoom = async (req, res) => {
  try {
    const { roomId, ui_id } = req.body;

    // Always convert roomId to string because schema stores it as string
    const room = await Room.findOne({ roomId: roomId.toString() });
    const user = await User.findOne({ ui_id });

    if (!room || !user) {
      return res.status(404).json({ error: "Room or User not found" });
    }

    // Ensure members exists
    if (!Array.isArray(room.members)) {
      room.members = [];
    }

    // Check membership
    const isMember = room.members.includes(ui_id.toString());
    if (!isMember) {
      return res
        .status(403)
        .json({ error: "You are not a member of this room." });
    }

    // Remove user
    room.members = room.members.filter((id) => id !== ui_id.toString());

    // Update totalMembers
    room.totalMembers = room.members.length;

    // Optional: auto delete if no members left
    if (room.totalMembers === 0) {
      await Room.deleteOne({ _id: room._id });
      return res.status(200).json({
        message: "User left the room. Room deleted because no members remain.",
      });
    }

    await room.save();

    res.status(200).json({ message: "User left the room successfully" });
  } catch (err) {
    console.error("LeaveRoom Error:", err);
    res.status(400).json({ error: err.message });
  }
};




// RoomsApi/roomController.js ends here