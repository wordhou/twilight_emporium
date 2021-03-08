const express = require("express");
const app = express();

app.get("/", (_, res) => {
  res.send("Hello world!");
});

const server = app.listen(3000, () => {
  console.log(
    `Listening at http://${server.address().address}:${server.address().port}`
  );
});
