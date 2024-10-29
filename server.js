const express =  require("express");
const cors = require("cors");
const routes =require("./routes");
const bodyParser = require("body-parser");

const app = express();

// use body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Allow requests from your frontend origin
app.use(cors({ origin: '*' })); // Adjust to your frontend's origin

const port = process.env.PORT || 5000;

// routers
app.use("/api-v1", routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

