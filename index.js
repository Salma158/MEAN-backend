const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const booksRouter = require("./routes/booksRouter");
const userRouter = require('./routes/users');
const auth = require('./middlewares/auth')

const userBooksRouter = require("./routes/userBooksRouter")
const path = require("path");

dotenv.config();


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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/books", booksRouter);
app.use("/user", userRouter);
app.use('/userbooks', auth.authorization, userBooksRouter);



app.use((error, req, res, next) => res.status(error.status).json({ error: error.message }));

app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});
