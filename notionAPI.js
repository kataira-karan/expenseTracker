require("dotenv").config();
// Notion SDK
const { Client } = require("@notionhq/client");
const notion = new Client({
  auth: process.env.notion_api_secret,
});

//  ADDING EXPENSE TO NOTION
const addExpense = async (
  expenseID,
  description,
  my_share,
  totalCost,
  pageImg,
  created_by,
  groupName,
  participants,
  date
) => {
  console.log("adding expense to notion");
  let expense = await notion.pages.create({
    icon: {
      type: "external",
      external: {
        url: pageImg,
      },
    },

    parent: {
      type: "database_id",
      database_id: process.env.database_id,
    },

    properties: {
      expenseID: {
        number: expenseID,
      },

      Paid_by: {
        title: [
          {
            type: "text",
            text: {
              content: created_by,
            },
          },
        ],
      },
      description: {
        rich_text: [
          {
            type: "text",
            text: {
              content: description,
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
      totalCost: {
        number: totalCost,
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

const isExpenseAvailable = async (expenseId) => {
  console.log(expenseId);
  console.log("Finding Expense");
  const row = await notion.databases.query({
    database_id: process.env.database_id,
    filter: {
      property: "expenseID",
      number: {
        equals: expenseId,
      },
    },
  });
  // console.log("---------------------------------------------------", row);
  return row.results.length === 0 ? false : true;
};

module.exports = { addExpense, updateExpense, isExpenseAvailable };
