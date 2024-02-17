const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const booksRouter = require("./routes/booksRouter");

dotenv.config({ path: "./config.env" });

const app = express();
const PORT = process.env.PORT;
const DB = process.env.DATABASE;

mongoose
  .connect(DB)
  .then(() => {
    console.log("successfully connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(express.json());

app.use("/books", booksRouter);

app.use((error, req, res) =>
  res.status(error.status).json({ error: error.message })
);

app.use((err, req, res) => {
  res.status(err.status).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});
