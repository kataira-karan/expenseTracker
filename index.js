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

const Splitwise = require("splitwise");
console.log(process.env.splitwise_consumer_key);
const sw = Splitwise({
  consumerKey: process.env.splitwise_consumer_key,
  consumerSecret: process.env.splitwise_consumer_secret,
});

sw.getCurrentUser().then(console.log); // => { id: ... }

// GET ALL THE EXPENSES

sw.getExpenses().then((data) => {
  console.log("-------------------Expenses-------------------");
  for (let i = 0; i < data.length; i++) {
    // console.log(data[i].users);
    let created_by = data[i].created_by.first_name;
    let my_share = data[i].repayments[0].amount;
    let title = data[i].description;
    let date = data[i].date;
    console.log(data[i].created_by);
    console.log("created By======>", data[i].created_by.first_name);
    console.log("My share ======>", data[i].repayments[0].amount);
    console.log("Title ======>", data[i].description);
    console.log("Date ======>", data[i].date);

    addExpense(title, parseFloat(my_share), created_by, date);
  }

  // data I need to use
  // 1.  created By , who added the expense  data[i].createdBy
  // 2.  What will be my share in this expense    data[i].
  // 3.  Name of Expnese  data[i].description
  // 4.  Date of Expnese  data[i].date
});

// ADDING DATA TO NOTION

const addExpense = async (title, my_share, created_by, date) => {
  console.log("adding expense to notion");

  const response = await notion.pages.create({
    parent: {
      type: "database_id",
      database_id: process.env.database_id,
    },

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
      Added_By: {
        rich_text: [
          {
            type: "text",
            text: {
              content: created_by,
            },
          },
        ],
      },
      Date: {
        date: {
          start: date,
        },
      },

      // Email: {
      //   email: "ada@makenotion.com",
      // },
    },
  });
};

// (async () => {
//   const response = await notion.pages.create({
//     parent: {
//       type: "database_id",
//       database_id: process.env.database_id,
//     },

//     properties: {
//       Name: {
//         title: [
//           {
//             type: "text",
//             text: {
//               content: "This will be title",
//             },
//           },
//         ],
//       },
//       My_Share: {
//         number: 55.5,
//       },
//       Added_By: {
//         rich_text: [
//           {
//             type: "text",
//             text: {
//               content: "Krutarth",
//             },
//           },
//         ],
//       },
//       Date: {
//         date: {
//           start: "2023-02-23",
//         },
//       },

//       // Email: {
//       //   email: "ada@makenotion.com",
//       // },
//     },
//   });
//   console.log(response);
// })();

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// to dos
//  add group name
//  add photo
// add to git hub
//
