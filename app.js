const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const passport = require("passport");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const connectDB = require("./config/db");

// Handlebars Helpers
const {
  formatDate,
  stripTags,
  limit,
  editIcon,
  select,
} = require("./helpers/hbs");

// Load config
dotenv.config({ path: "./config/config.env" });
// Passport Config
require("./config/passport")(passport);
connectDB();

const app = express();

// Body Parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method Override
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Handlebars
app.engine(
  ".hbs",
  exphbs({
    helpers: {
      formatDate,
      limit,
      stripTags,
      editIcon,
      select,
    },
    defaultLayout: "main_layout",
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");

// Express Session
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Set Global Variables
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Static Folder
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", require("./routes"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
