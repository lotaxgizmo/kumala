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
  try {
    fs.writeFileSync(highScoreFile, JSON.stringify({ highScore: score }));
  } catch (error) {
    console.error("Error writing high score to file:", error);
  }
};

let highScore = readHighScore(); // Initialize high score from file

// Periodically update high score from file every 5 seconds
setInterval(() => {
  highScore = readHighScore();
}, 5000);

app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      if (
        req.method === "POST" &&
        req.headers["content-type"] !== "application/json"
      ) {
        throw new Error("Invalid content-type. Expected application/json");
      }
    },
  })
);

const corsOptions = {
  origin: "http://localhost:5500", // Replace with your frontend URL
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions)); // Enable CORS

// Endpoint to get the high score
app.get("/highscore", (req, res) => {
  console.log("GET /highscore request received");
  res.json({ highScore });
});

// Endpoint to update the high score
app.post("/highscore", (req, res) => {
  console.log("POST /highscore request received with body:", req.body);
  const { highScore: newHighScore } = req.body;
  if (newHighScore > highScore) {
    highScore = newHighScore;
    writeHighScore(highScore); // Persist new high score to file
    console.log("New high score updated to", highScore);
  }
  res.json({ highScore });
});

// Log request details
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
