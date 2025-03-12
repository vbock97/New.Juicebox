const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

// Serve static files from the React app's build directory
app.use(express.static(path.join(__dirname, "build")));

// For any other request, serve the React app's index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
