const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

// Path to the high score file
const highScoreFilePath = path.join(__dirname, "highscore.json");

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5500", // Your frontend development URL
  "https://noted-exciting-ape.ngrok-free.app", // Your ngrok URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Function to read high score from file
const readHighScore = () => {
  try {
    if (fs.existsSync(highScoreFilePath)) {
      const data = fs.readFileSync(highScoreFilePath, "utf-8");
      const parsedData = JSON.parse(data);
      if (typeof parsedData.highScore === "number") {
        return parsedData.highScore;
      } else {
        console.warn(
          "highscore.json exists but does not contain a valid highScore. Resetting to default."
        );
        writeHighScore(100);
        return 100;
      }
    } else {
      // Create the file with a default high score if it doesn't exist
      const defaultHighScore = 100;
      writeHighScore(defaultHighScore);
      return defaultHighScore;
    }
  } catch (error) {
    console.error("Error reading high score from file:", error);
    // In case of error, return default high score
    return 100;
  }
};

// Function to write high score to file
const writeHighScore = (score) => {
  try {
    fs.writeFileSync(
      highScoreFilePath,
      JSON.stringify({ highScore: score }, null, 2)
    );
    console.log(`High score successfully written to ${highScoreFilePath}`);
  } catch (error) {
    console.error("Error writing high score to file:", error);
  }
};

// Initialize high score from file
let highScore = readHighScore();

// Periodically update high score from file every 5 seconds
setInterval(() => {
  highScore = readHighScore();
  console.log("High score updated to:", highScore);
}, 5000);

// Endpoint to get the high score
app.get("/highscore", (req, res) => {
  res.json({ highScore });
});

// Endpoint to update the high score
app.post("/highscore", (req, res) => {
  const { highScore: newHighScore } = req.body;

  if (typeof newHighScore !== "number") {
    return res.status(400).json({ error: "highScore must be a number." });
  }

  if (newHighScore > highScore) {
    highScore = newHighScore;
    writeHighScore(highScore); // Persist new high score to file
    console.log("New high score updated to", highScore);
    return res.status(200).json({ highScore });
  } else {
    return res
      .status(200)
      .json({
        highScore,
        message: "New score is not higher than existing high score.",
      });
  }
});

// Catch-all Route for Undefined Endpoints
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found." });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("An unexpected error occurred:", err.message);
  res.status(500).json({ error: "Internal Server Error." });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
