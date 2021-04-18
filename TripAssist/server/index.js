const bodyParser = require('body-parser');
const express = require('express');
var routes = require("./routes.js");
const cors = require('cors');

const app = express();

app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

/* ---------------------------------------------------------------- */
/* ------------------- Route handler registration ----------------- */
/* ---------------------------------------------------------------- */
app.get('/', routes.getSearch);

app.get('/search', routes.getSearch);

app.get('/states', routes.getStates);

app.get('/states/:covidState', routes.getCovidForState);

app.get('/cuisine', routes.getCuisine);

app.get('/accommodation', routes.getAccomodation);

app.get('/interests', routes.getInterests);

app.post('/userResults', routes.postSelections);

app.post('/login', routes.handleLogin);

app.post('/Sign%20Up', routes.handleSignUp);

app.post('/preferences', routes.postPreferences);

app.post('/getPreferences', routes.getPreferences);

app.listen(8786, () => {
	console.log(`Server listening on PORT 8786`);
});