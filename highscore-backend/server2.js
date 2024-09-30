const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch"); // Add this line

const app = express();
const port = process.env.PORT || 3000;
const dbUrl = process.env.REPLIT_DB_URL;

const defaultHighScore = 100;

// Function to read high score from the database
const readHighScore = async () => {
  const response = await fetch(`${dbUrl}/highScore`);
  const highScore = await response.text();
  return highScore ? parseInt(highScore, 10) : defaultHighScore;
};

// Function to write high score to the database
const writeHighScore = async (score) => {
  console.log("Writing score:", score); // Debug log
  await fetch(dbUrl, {
    method: "POST",
    body: `highScore=${score}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
};

let highScore;

// Initialize high score from the database
readHighScore().then((score) => {
  highScore = score;
  console.log("Initial score:", highScore); // Debug log
});

// Remove the periodic update

app.use(bodyParser.json());
app.use(cors()); // Enable CORS

// Endpoint to get the high score
app.get("/highscore", async (req, res) => {
  console.log("Request received");
  const currentHighScore = await readHighScore();
  res.json({ highScore: { ok: true, value: currentHighScore } });
});

// Endpoint to update the high score
app.post("/highscore", async (req, res) => {
  console.log("New highscore received:", req.body);
  const newHighScore = req.body.highScore;
  const currentHighScore = await readHighScore();
  if (newHighScore > currentHighScore) {
    await writeHighScore(newHighScore); // Persist new high score to database
    console.log("New score:", newHighScore);
  }
  const updatedHighScore = await readHighScore();
  res.json({ highScore: { ok: true, value: updatedHighScore } });
});

app.listen(port, () => {
  console.log(
    `Server is running on ${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
  );
});
