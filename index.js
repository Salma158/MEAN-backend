const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");


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

app.use((err, req, res, next) => {
  res.status(err.status).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});
