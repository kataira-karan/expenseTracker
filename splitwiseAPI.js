const axios = require("axios");
require("dotenv").config();
const { isExpenseAvailable, addExpense } = require("./notionAPI");
const { Client } = require("@notionhq/client");
const notion = new Client({
  auth: process.env.notion_api_secret,
});

const url = `https://secure.splitwise.com/api/v3.0/get_expenses?limit=100`;

// Set the headers with your API credentials
const headers = {
  Authorization: `Bearer ${process.env.splitwise_api_key}`,
};

// GET ALL THE EXPENSES OF SPLITWISE
const getExpenses = async () => {
  let x = await axios.get(url, { headers });

  const expenses = x.data.expenses;
  console.log("len------------------------------------------", expenses.length);
  for (let i = 0; i < expenses.length; i++) {
    console.log(expense);

    let expense = expenses[i];
    console.log(
      `${i}  ,  Expense ID: ${expense.id}, Amount: ${expense.cost}---------------------`
    );

    const options = {
      method: "POST",
      url: "https://api.notion.com/v1/pages",
      headers: {
        Authorization: `Bearer ${process.env.notion_api_secret}`,
        accept: "application/json",
        "Notion-Version": "2022-06-28",
        "content-type": "application/json",
      },

      data: JSON.stringify({
        parent: {
          type: "database_id",
          database_id: process.env.database_id,
        },
        properties: {
          expenseID: {
            number: expense.id,
          },
          Name: {
            title: [
              {
                type: "text",
                text: {
                  content: expense.description,
                },
              },
            ],
          },

          My_Share: {
            number: parseFloat(expense.cost),
          },

          Date: {
            date: {
              start: expense.date,
            },
          },
        },
      }),
    };

    axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });

    //         Name: {
    //           title: [
    //             {
    //               type: "text",
    //               text: {
    //                 content: expense.description,
    //               },
    //             },
    //           ],
    //         },
    //         My_Share: {
    //           number: parseFloat(expense.cost),
    //         },

    //         Date: {
    //           date: {
    //             start: expense.date,
    //           },
    //         },
    //       },
    //     }),
    //     new Promise(resolve => setTimeout(resolve, 1000))
    // ]);
  }
};

const getNotification = async () => {
  let getNotificationUrl =
    "https://secure.splitwise.com/api/v3.0/get_notifications?limit=60";

  console.log("Getting Notification");
  let groupName = "No Group";
  let res = await axios.get(getNotificationUrl, { headers });
  let notifications = res.data.notifications;
  console.log(notifications.length);

  //  LOOPING THROUGH NEW NOTIFICATIONS
  for (let i = 0; i < notifications.length; i++) {
    let notification = notifications[i];

    // IF NOTIFICATION IS OF DELETED EXPENESE
    console.log(notification);
    if (
      notification.type !== 0 ||
      notification.type !== 1 ||
      notification.type !== 2
    ) {
      continue;
    }
    // FETCH EXPENSE BY ID
    let expense = await getExpensesById(notification.source.id);
    // console.log(expense);
    if (!expense) continue;
    // IF THE NOTIFICATION IS TO SETTLE UP THE BALANCE
    if (expense.description === "Settle all balances") {
      continue;
    }

    // check if entry is already available or not--------------------------------------------
    let isExpenseAlreadyAvailable = await isExpenseAvailable(expense.id);
    // console.log(isExpenseAlreadyAvailable);
    if (isExpenseAlreadyAvailable) {
      console.log("Expense Exist");
      continue;
    }

    console.log(expense);

    // LOOPING THROUGH ALL USER TO GET INFO ABOUT USER-------------------------------------
    let users = expense.users;
    let myShare = 0;
    let usersArray = [];
    for (let i = 0; i < users.length; i++) {
      usersArray.push({ name: users[i].user.first_name });
      // CALCULATING MY SHARE , IN USERS ARRAY IT SHOW WHICH USER OWES WHAT AMOUNT ,
      // SO COMPARING MY USER_ID TO ALL USERS'ID AND IF MATCHES GETTING MY SHARE

      // IF THE PAYMENT IS NOT DONE BY ME
      if (users[i].user_id === 11533056) {
        myShare = users[i].owed_share;
      }
    }

    if (expense.description === "Payment") {
      myShare = 0;
    }

    // IF THE EXPENSE IS ADDED IN THE GROUP GET THE GROUP DETAILS TO SHOW NAME OF THE GROUP IN NOTION
    if (expense.group_id) {
      // console.log("Expense added in group");
      let group = await getGroup(expense.group_id);
      if (!group) continue;
      groupName = group.name;
    } else {
      groupName = "Individual Expense";
    }

    // ADDING EXPENSE IN NOTION
    addExpense(
      expense.id,
      expense.description,
      parseFloat(myShare),
      parseFloat(expense.cost),
      expense.created_by.picture.medium,
      expense.created_by.first_name,
      groupName,
      usersArray,
      expense.date
    );
  }
};

// AFTER GETTING NOTIFICATION FETCH EXPENSE DETAILS USING EXPENSEID WHICH IS PRESENT IN NOTIFICATION DETAILS
const getExpensesById = async (expenseId) => {
  try {
    let getExpensesUrl = `https://secure.splitwise.com/api/v3.0/get_expense/${expenseId}`;
    let res = await axios.get(getExpensesUrl, { headers });
    let expense = res.data.expense;
    return expense;
  } catch (error) {
    return error;
  }
};

// GET USER DETAILS TO SHOW ALL THE USERS INCLUDEDE IN THE EXPENSE
const getUser = async (userId) => {
  let getUserId = `https://secure.splitwise.com/api/v3.0/get_user/${userId}`;
  let res = await axios.get(getUserId, { headers });
};

// TO SHOW GROUP DETAILS IN NOTION
const getGroup = async (groupId) => {
  try {
    let getGroupUrl = `https://secure.splitwise.com/api/v3.0/get_group/${groupId}`;
    let res = await axios.get(getGroupUrl, { headers });
    let group = res.data.group;
    return group;
  } catch (error) {
    return error;
  }
};

module.exports = {
  getExpenses,
  getExpensesById,
  getUser,
  getGroup,
  getNotification,
};
