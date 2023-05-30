const express = require("express");
const server = require("http").createServer(express);
const app = express();

app.get("/", function (req, res) {
  res.sendFile("/index.html", { root: __dirname });
});

server.on("request", app);
server.listen(3000, function () {
  console.log("Server started on port 3000");
});

process.on("SIGINT", function () { 
  wss.clients.forEach(function each(client) {
    client.close();
  });
  server.close(() => {
    shutdownDB();
  });
});

/** Begin websocket */

const webSocketServer = require("ws").Server;

const wss = new webSocketServer({ server: server });

wss.on("connection", function connection(ws) {
  const numClients = wss.clients.size;
  console.log("New client connected. Total clients: " + numClients);

  // to everyone
  wss.broadcast("New client connected. Total clients: " + numClients);

  // on open connection
  ws.readyState === ws.OPEN && ws.send("Welcome to my server!");

  db.run(`
    INSERT INTO visitors (count, time)
    VALUES (${numClients}, datetime('now'))
  `);

  ws.on("close", function closed() {
    wss.broadcast("Client disconnected. Total clients: " + wss.clients.size);
    console.log("Client disconnected. Total clients: " + wss.clients.size);
  });
});

wss.broadcast = function broadcast(msg) {
  wss.clients.forEach(function each(client) {
    client.send(msg);
  });
};

/** End Web Socket Server */

/** Begin Database */

const sqlite = require("sqlite3");
const db = new sqlite.Database(":memory:");

db.serialize(() => {
  db.run(`
    CREATE TABLE visitors (
      count INTEGER,
      time TEXT
    )
  `);
});

function getCounts() {
  db.each("SELECT * FROM visitors", (err, row) => {
    console.log(row);
  });
}

function shutdownDB() {
  getCounts();
  console.log("Shutting down database...");
  db.close();
}
