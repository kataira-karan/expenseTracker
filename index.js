const express = require("express");
const app = express();
const port = 3000; // You can change the port to any desired port number
require("dotenv").config();
const { getExpenses } = require("./splitwiseAPI");

// Define a route for the home page
app.get("/", (req, res) => {
  res.send("Welcome to the Home Page");
});

getExpenses();

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// to dos
//  add group name
//  add photo
// add to git hub
//
