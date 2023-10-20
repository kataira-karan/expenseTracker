const axios = require("axios");
require("dotenv").config();
const { addExpense } = require("./notionAPI");

const url = `https://secure.splitwise.com/api/v3.0/get_expenses?limit=100`;

// Set the headers with your API credentials
const headers = {
  Authorization: `Bearer kto7zcEm3fBNqcceCkDc4UOCPaBBBDFamqEO5aiV`,
};

const getExpenses = () => {
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
};

module.exports = { getExpenses };
