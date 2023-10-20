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
  console.log(
    "api key-------------------------------------------",
    process.env.splitwise_api_key
  );
  let x = await axios.get(url, { headers });
  // .then(async (response) => {
  //   console.log(response);
  //   if (response.status === 200) {
  //     // Successfully retrieved expenses
  //     const expenses = response.data.expenses;
  //     for (let i = 0; i < expenses.lengh; i++) {
  //       // console.log(expense);

  //       let expense = expenses[i];
  //       console.log(
  //         `Expense ID: ${expense.id}, Amount: ${expense.cost}---------------------`
  //       );
  //       await addExpense(
  //         expense.description,
  //         parseFloat(expense.cost),
  //         expense.created_by.first_name,
  //         expense.date
  //       );
  //     }
  //   } else {
  //     console.error(
  //       `Failed to retrieve expenses. Status code: ${response.status}`
  //     );
  //   }
  // })

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
        accept: "application/json",
        "Notion-Version": "2022-06-28",
        "content-type": "application/json",
      },
    };

    await Promise.all([
      axios.request(options),
      notion.pages.create({
        parent: {
          type: "database_id",
          database_id: process.env.database_id,
        },

        properties: {
          number: {
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
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);
  }
  // .catch((error) => {
  //   console.error("Error:", error);
  // });
};

module.exports = { getExpenses };
