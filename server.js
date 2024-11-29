const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const bodyParser = require("body-parser");

const app = express();

// use body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Allow requests from your frontend origin
// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://globalnexus.co.rw",
    "https://global-nexus-institute-landing-page.vercel.app",
    "https://global-nexus-institute-landingpage.vercel.app",
    "https://global-nexis-institute-admin.vercel.app",
  ], // Specify your frontend origin
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions)); // Adjust to your frontend's origin

const port = process.env.PORT || 5000;

// routers
app.use("/api-v1", routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
