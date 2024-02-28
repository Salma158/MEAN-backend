const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const routes = require('./routes');
const path = require("path");
const cors = require('cors');
const cookieSession = require("cookie-session");
const staticFile = path.join(__dirname, 'images')
dotenv.config();
const app = express();
var corsOptions = {
  origin: "http://localhost:4200"
};

app.use(cors(corsOptions));

app.use(express.static(staticFile));
app.use(
  cookieSession({
    name: "goodread-session",
    keys: ["COOKIE_SECRET"],
    httpOnly: true
  })
);
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
app.use(routes);



app.use((error, req, res, next) => res.status(error.status).json({ error: error.message }));

app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});
