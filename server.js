require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { WSS_ENDPOINTS, HTTPS_ENDPOINTS, NETWORK_SYMBOL, NETWORK_IDS, CHAIN_IDS } = require("./config/constants");
const routes = require("./routes");
const app = express();
const ethers = require("ethers");
const axios = require('axios');

//Add Cors
app.use(cors());
app.options("*", cors());
app.use(express.static(path.resolve(__dirname, "build")));
// else
app.use('/tokens', express.static(path.join(__dirname, 'Tokens')));
// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
// mongoose
//   .connect(db, { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true, useCreateIndex: true })
//   .then(() => console.log("MongoDB successfully connected"))
//   .catch((err) => console.log(err));
// Routes
app.use("/api", routes);

const port = process.env.PORT || 3000;

// app.listen(port, () => console.log(`Server up and running on port ${port} !`));

var http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:7260",
  }
});

io.on('connection', (socket) => {
  socket.on('sync_time', (callback) => {
    callback({
      time: Date.now()
    });
  });
});
http.listen(port, function () {
  console.log(`Server up and running on port ${port} !`);
});