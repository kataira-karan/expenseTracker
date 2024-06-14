const axios = require("axios");
require(".env").config();
const { addExpense, updateExpense } = require("./notionAPI");
const { getExpensesById, getUser, getGroup } = require("./splitwiseAPI");
const { Client } = require("@notionhq/client");
const notion = new Client({
  auth: process.env.notion_api_secret,
});

const fetchExpensesFromNotion = async () => {
  const databaseId = process.env.database_id;
  const response = await notion.databases.retrieve({ database_id: databaseId });
  console.log(response);

  return response;
};

module.exports = { getNotification };
