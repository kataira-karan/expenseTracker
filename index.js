require(".env").config();
const { getNotification } = require("./splitwiseAPI");

// FETCH NOTIFICATION TO UPDATE NOTION EVERY DAY AT 12AM
getNotification();
