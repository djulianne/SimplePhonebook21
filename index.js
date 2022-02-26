const express = require('express');
const parser = require('cookie-parser');
const flash = require('connect-flash');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = process.env.PORT || 5000;

require("dotenv").config();

app.use(express.urlencoded( {extended: true} ));
app.use(express.static("content"));
app.use(expressLayouts);

app.use(parser("PhonebookSecure"));
app.use(session({
    secret: "PhonebookSecretSession",
    saveUninitialized: true,
    resave: true
}));

app.use(flash());
app.use(fileUpload());

app.set("layout", "./shared/layout");
app.set("view engine", "ejs");

const routes = require("./server/routes/phonebookRoutes.js");
app.use("/", routes);

app.listen(PORT, () => console.log(`App is listening on port ${PORT}`))