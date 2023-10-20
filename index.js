const express = require("express");
const app = express();
const axios = require("axios");
const port = 3000; // You can change the port to any desired port number
require("dotenv").config();

// Notion SDK
const { Client } = require("@notionhq/client");
const notion = new Client({
  auth: process.env.notion_api_secret,
});

// Define a route for the home page
app.get("/", (req, res) => {
  res.send("Welcome to the Home Page");
});

// const Splitwise = require("splitwise");
// console.log(process.env.splitwise_consumer_key);
// const sw = Splitwise({
//   consumerKey: process.env.splitwise_consumer_key,
//   consumerSecret: process.env.splitwise_consumer_secret,
// });

// sw.getCurrentUser().then(console.log); // => { id: ... }

const url = `https://secure.splitwise.com/api/v3.0/get_expenses?limit=100`;

// Set the headers with your API credentials
const headers = {
  Authorization: `Bearer kto7zcEm3fBNqcceCkDc4UOCPaBBBDFamqEO5aiV`,
};

axios
  .get(url, { headers })
  .then((response) => {
    if (response.status === 200) {
      // Successfully retrieved expenses
      const expenses = response.data.expenses;
      expenses.forEach((expense) => {
        console.log(expense);
        console.log(
          `Expense ID: ${expense.id}, Amount: ${expense.cost}---------------------`
        );
        addExpense(
          expense.description,
          parseFloat(expense.cost),
          expense.created_by.first_name,
          expense.date
        );
      });
    } else {
      console.error(
        `Failed to retrieve expenses. Status code: ${response.status}`
      );
    }
  })
  .catch((error) => {
    console.error("Error:", error);
  });

// GET ALL THE EXPENSES

// sw.getExpenses({ limit: 100 }).then((data) => {
//   console.log("-------------------Expenses-------------------");

//   for (let i = 0; i < data.length; i++) {
//     // console.log(data[i]);
//     let created_by = data[i].created_by.first_name;
//     let my_share = data[i].repayments[0].amount;
//     let title = data[i].description;
//     let date = data[i].date;
//     // console.log(data[i].created_by);
//     console.log
//     console.log("created By======>", data[i].created_by.first_name);
//     console.log("My share ======>", data[i].repayments[0].amount);
//     console.log("Title ======>", data[i].description);
//     console.log("Date ======>", data[i].date);
//     console.log(
//       "-------------------------------------------------------------------------------------------------------------"
//     );

//     addExpense(title, parseFloat(my_share), created_by, date);
//   }

//   // data I need to use
//   // 1.  created By , who added the expense  data[i].createdBy
//   // 2.  What will be my share in this expense    data[i].
//   // 3.  Name of Expnese  data[i].description
//   // 4.  Date of Expnese  data[i].date
// });

// sw.getGroup({ id: "39093241" }).then((data) => {
//   console.log(data);
// });

// ADDING DATA TO NOTION

const addExpense = async (title, my_share, created_by, date) => {
  console.log("adding expense to notion");

  const response = await notion.pages.create({
    parent: {
      type: "database_id",
      database_id: process.env.database_id,
    },
    // "icon" : {
    //   type : "external",
    //   external : {
    //     "url" :
    //   }
    // }
    properties: {
      Name: {
        title: [
          {
            type: "text",
            text: {
              content: title,
            },
          },
        ],
      },
      My_Share: {
        number: my_share,
      },

      Date: {
        date: {
          start: date,
        },
      },
    },
  });
};

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// to dos
//  add group name
//  add photo
// add to git hub
//
