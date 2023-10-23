const axios = require("axios");
require("dotenv").config();
const { addExpense } = require("./notionAPI");
const { Client } = require("@notionhq/client");
const notion = new Client({
  auth: process.env.notion_api_secret,
});

const url = `https://secure.splitwise.com/api/v3.0/get_expenses?limit=100`;

// Set the headers with your API credentials
const headers = {
  Authorization: `Bearer ${process.env.splitwise_api_key}`,
};

const getExpenses = async () => {
  // console.log(
  //   "api key-------------------------------------------",
  //   process.env.splitwise_api_key
  // );
  let x = await axios.get(url, { headers });

  const expenses = x.data.expenses;
  console.log("len------------------------------------------", expenses.length);
  for (let i = 0; i < expenses.length; i++) {
    // console.log(expense);

    let expense = expenses[i];
    console.log(
      `${i}  ,  Expense ID: ${expense.id}, Amount: ${expense.cost}---------------------`
    );
    // await addExpense(
    //   expense.description,
    //   parseFloat(expense.cost),
    //   expense.created_by.first_name,
    //   expense.date
    // );

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

    //   await Promise.all([
    //     notion.pages.create({
    //       parent: {
    //         type: "database_id",
    //         database_id: process.env.database_id,
    //       },

    //       properties: {
    //         number: {
    //           number: expense.id,
    //         },

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
  // .catch((error) => {
  //   console.error("Error:", error);
  // });
};

// AFTER GETTING NOTIFICATION WE NEED TO FETCH EXPENSE DETAILS USING EXPENSEID WHICH IS PRESENT IN NOTIFICATION DETAILS
const getExpensesById = async (expenseId) => {
  let getExpensesUrl = `https://secure.splitwise.com/api/v3.0/get_expense/${expenseId}`;
  let res = await axios.get(getExpensesUrl, { headers });
  //   console.log(res.data);
  return res.data.expense;
};

// GET USER DETAILS TO SHOW ALL THE USERS INCLUDEDE IN THE EXPENSE
const getUser = async (userId) => {
  let getUserId = `https://secure.splitwise.com/api/v3.0/get_user/${userId}`;
  let res = await axios.get(getUserId, { headers });
  console.log(res);
};

// TO SHOW GROUP DETAILS IN NOTION
const getGroup = async (groupId) => {
  let getGroupUrl = `https://secure.splitwise.com/api/v3.0/get_group/${groupId}`;
  let res = await axios.get(getGroupUrl, { headers });
  //   console.log(res.data.group);
  return res.data.group;
};

module.exports = { getExpenses, getExpensesById, getUser, getGroup };
