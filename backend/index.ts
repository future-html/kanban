import express from "express";

const app = express();
const port = 3000;

// 1. This should print IMMEDIATELY when you run `npm run start`
console.log('hello api - Server is starting up...');

app.get("/", (req, res) => {
  // 2. This should print ONLY when you visit http://localhost:3000
  console.log("hello api - Someone visited the route!");
  res.send("API is working");
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});