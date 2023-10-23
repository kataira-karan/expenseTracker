// Notion SDK
const { Client } = require("@notionhq/client");
const notion = new Client({
  auth: process.env.notion_api_secret,
});
require("dotenv").config();

//  ADDING EXPENSE TO NOTION
const addExpense = async (
  expenseID,
  title,
  my_share,
  created_by,
  groupName,
  participants,
  date
) => {
  console.log("adding expense to notion");
  console.log(expenseID);
  await notion.pages.create({
    parent: {
      type: "database_id",
      database_id: process.env.database_id,
    },

    properties: {
      expenseID: {
        number: expenseID,
      },

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
      group: {
        rich_text: [
          {
            type: "text",
            text: {
              content: groupName,
            },
          },
        ],
      },
      Participants: {
        multi_select: participants,
      },
      My_Share: {
        number: my_share,
      },
      Created_by: {
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
    },
  });
};

const updateExpense = async (expense, isDeleted) => {
  console.log("Inside Notion page");

  // NEED TO FETCH PAGE ID
  const row = await notion.databases.query({
    database_id: process.env.database_id,
    filter: {
      property: "expenseID",
      number: {
        equals: expense.id,
      },
    },
  });
  const pageId = row.results[0].id;
  const response = await notion.pages.update({
    page_id: pageId,
    properties: {
      My_Share: {
        number: parseFloat(expense.cost),
      },
      isDeleted: {
        status: {
          name: isDeleted ? "deleted" : "Not Deleted",
        },
      },
    },
  });
};

module.exports = { addExpense, updateExpense };
