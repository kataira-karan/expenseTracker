// Notion SDK
const { Client } = require("@notionhq/client");
const notion = new Client({
  auth: process.env.notion_api_secret,
});

//  ADDING EXPENSE TO NOTION
const addExpense = async (title, my_share, created_by, date) => {
  console.log("adding expense to notion");

  await notion.pages.create({
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

      Date: {
        date: {
          start: date,
        },
      },
    },
  });
};

module.exports = { addExpense };
