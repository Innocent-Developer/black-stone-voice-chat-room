const express = require("express");
const createItem = require("./createItem");
const buyItem = require("./Buyitem");
const deleteItem = require("./deleteItem");
const updateItem = require("./Updateitem");
const getAllItems = require("./getAllitem");
const items = express.Router();


items.post("/create", createItem)
items.post("/buy", buyItem)
items.delete("/delete/item", deleteItem)
items.post("/update/item", updateItem)
items.get("/items", getAllItems)

module.exports = items;