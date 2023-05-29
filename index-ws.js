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
