const axios = require("axios");
require("dotenv").config();
const { addExpense, updateExpense } = require("./notionAPI");
const { getExpensesById, getUser, getGroup } = require("./splitwiseAPI");
const { Client } = require("@notionhq/client");
const notion = new Client({
  auth: process.env.notion_api_secret,
});

const headers = {
  Authorization: `Bearer ${process.env.splitwise_api_key}`,
};

const getNotification = async () => {
  let getNotificationUrl =
    "https://secure.splitwise.com/api/v3.0/get_notifications?limit=20";

  console.log("Getting Notification");
  let groupName = "";
  let res = await axios.get(getNotificationUrl, { headers });
  let notifications = res.data.notifications;
  console.log(notifications.length);

  //  LOOPING THROUGH NEW NOTIFICATIONS
  for (let i = 0; i < notifications.length; i++) {
    let notification = notifications[i];

    // IF NOTIFICATION IS OF DELETED EXPENESE

    // FETCH ACTION BY ID
    let expense = await getExpensesById(notification.source.id);
    if (!expense) continue;
    // IF THE NOTIFICATION IS TO SETTLE UP THE BALANCE
    if (expense.description === "Settle all balances") {
      continue;
    }

    // if (notification.type === 2) {
    //   //   IF NOTIFICATION IS TO DELETE EXPENSE WE NEED TO DELETE IT FROM NOTION
    //   updateExpense(expense, true);
    //   console.log(notification);
    //   continue;
    // }

    // IF NOTIFICATION IS TO UPDATE AN EXISING EXPENSE
    // if (notification.type === 1) {
    //   let isExpenseAlreadyAvailable = await isExpenseAvailable(expense.id);
    //   if (isExpenseAlreadyAvailable.length !== 0) {
    //     updateExpense(expense);
    //     continue;
    //   }
    //   continue;
    // } else if (notification.type === 2) {
    //   // IF AN EXPENSE IF DELETED
    //   // WILL BE ADDED SOON
    // }

    // check if entry is already available or not--------------------------------------------
    let isExpenseAlreadyAvailable = await isExpenseAvailable(expense.id);
    // console.log(isExpenseAlreadyAvailable);
    if (isExpenseAlreadyAvailable.length !== 0) {
      console.log("Expense Exist");
      continue;
    }

    // LOOPING THROUGH ALL USER TO GET INFO ABOUT USER-------------------------------------
    // console.log(expense);
    let users = expense.users;
    let myShare = 0;
    let usersArray = [];
    for (let i = 0; i < users.length; i++) {
      usersArray.push({ name: users[i].user.first_name });
      //   CALCULATING MY SHARE , IN USERS ARRAY IT SHOW WHICH USER OWES WHAT AMOUNT ,
      // SO COMPARING MY USER_ID TO ALL USERS'ID AND IF MATCHES GETTING MY SHARE
      if (users[i].user_id === 11533056) {
        myShare = users[i].owed_share;
      }
      //   console.log(users[i].user);
    }

    // 11533056 , my user ID for splitwise

    // IF THE EXPENSE IS ADDED IN THE GROUP GET THE GROUP DETAILS TO SHOW NAME OF THE GROUP IN NOTION
    if (expense.group_id) {
      console.log("Expense added in group");
      let group = await getGroup(expense.group_id);
      if (!group) continue;
      groupName = group.name;
    }

    // ADDING EXPENSE IN NOTION
    addExpense(
      expense.id,
      expense.description,
      parseFloat(myShare),
      expense.created_by.first_name,
      groupName,
      usersArray,
      expense.date
    );
  }
};

const fetchExpensesFromNotion = async () => {
  const databaseId = process.env.database_id;
  const response = await notion.databases.retrieve({ database_id: databaseId });
  console.log(response);

  return response;
};

const isExpenseAvailable = async (expenseId) => {
  const row = await notion.databases.query({
    database_id: process.env.database_id,
    filter: {
      property: "expenseID",
      number: {
        equals: expenseId,
      },
    },
  });
  //   console.log("---------------------------------------------------", row);
  return row.results;
};

module.exports = { getNotification };
