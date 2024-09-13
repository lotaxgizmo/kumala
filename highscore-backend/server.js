const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const app = express();
const port = 3000;

const highScoreFile = "highscore.json";

// Function to read high score from file
const readHighScore = () => {
  if (fs.existsSync(highScoreFile)) {
    const data = fs.readFileSync(highScoreFile);
    return JSON.parse(data).highScore;
  } else {
    // Create the file with a default high score if it doesn't exist
    const defaultHighScore = 100;
    writeHighScore(defaultHighScore);
    return defaultHighScore;
  }
};

// Function to write high score to file
const writeHighScore = (score) => {
  fs.writeFileSync(highScoreFile, JSON.stringify({ highScore: score }));
};

let highScore = readHighScore(); // Initialize high score from file

// Periodically update high score from file every 5 seconds
setInterval(() => {
  highScore = readHighScore();
}, 5000);

app.use(bodyParser.json());
app.use(cors()); // Enable CORS

// Endpoint to get the high score
app.get("/highscore", (req, res) => {
  res.json({ highScore });
});

// Endpoint to update the high score
app.post("/highscore", (req, res) => {
  const { highScore: newHighScore } = req.body;
  if (newHighScore > highScore) {
    highScore = newHighScore;
    writeHighScore(highScore); // Persist new high score to file
    console.log("New high score update is", highScore); // Log the new high score
  }
  res.json({ highScore });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
