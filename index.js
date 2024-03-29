const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const routes = require('./routes');
const path = require("path");
const cors = require('cors');
const staticFile = path.join(__dirname, 'images')
dotenv.config();
const app = express();
var corsOptions = {
  origin: "https://final-b5630.web.app",
  optionsSuccessStatus: 200

};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://final-b5630.web.app");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use('/images', express.static('images'));
app.use(express.json());
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

app.use(routes);



app.use((error, req, res, next) => res.status(error.status || 500).json({ error: error.message }));

app.listen(PORT, () => {
  console.log(`server is running on port: ${PORT}`);
});
