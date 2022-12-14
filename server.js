const path = require("path");
const express = require("express");
const session = require("express-session");
const exphbs = require("express-handlebars");
const routes = require("./controllers");
const helpers = require("./utils/helpers");
// Helper method for generating unique ids
const uuid = require("./utils/uuid");

const sequelize = require("./config/connection");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

const app = express();
const PORT = process.env.PORT || 3001;

const hbs = exphbs.create({ helpers });

// Implement socket.io
const http = require("http");
const server = http.createServer(app);
const {run_socket} = require("./socketServer");

const sess = {

  secret: 'whosapp_secret',
  cookie: {
    maxAge: 1000 * 60 * 5, // log out after 5 minutes in milliseconds
  },
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize,
  }),
};

app.use(session(sess));

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(routes);

run_socket(server);

sequelize.sync({ force: false }).then(() => {

  server.listen(PORT, () => console.log(`Now listening http://localhost:${PORT}`));
});

