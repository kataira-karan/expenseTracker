const express = require("express");
const app = express();
const port = 3000; // You can change the port to any desired port number
require("dotenv").config();
const { getExpenses } = require("./splitwiseAPI");
const { getNotification } = require("./getNotification");

// getExpenses();

getNotification();

// to dos
//  add group name
//  add photo
// add to git hub
//
