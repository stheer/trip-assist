//////////Written by Scott Theer//////////

var config = require('./db-config.js');
var mysql = require('mysql');

config.connectionLimit = 10;
var connection = mysql.createPool(config);

/* -------------------------------------------------- */
/* ------------------- Route Handlers --------------- */
/* -------------------------------------------------- */
function getSearch(req, res) {
  var queries = `
    SELECT DISTINCT(city1) FROM Airfare_Data ORDER BY city1; 
  `;
  connection.query(queries, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      res.json(rows);
    }
  });
}

function getStates(req, res) {
  var queries = `
    SELECT DISTINCT(sm.FullName) 
    FROM Covid_Data cd
    JOIN state_mappings sm ON cd.State =  sm.Acronym;
  `;
  connection.query(queries, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      res.json(rows);
    }
  });
}

function getCovidForState(req, res) {
  var stateSelected = req.params.covidState
  var queries = `
    SELECT cd.population, cd.death AS deaths, cd.positive AS cases, cd.recovered, cd.hospitalized_currently AS hospit
    FROM Covid_Data cd
    JOIN state_mappings sm ON cd.state = sm.Acronym
    WHERE sm.FullName LIKE '${stateSelected}'
  `;
  connection.query(queries, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      res.json(rows);
    }
  });
}

function getCuisine(req, res) {
  res.json({cuisine: ['Afghani', 'African', 'American', 'Armenian', 'Asian', 'Bar', 'Barbecue', 'Cafe', 'Cajun & Creole', 
  'Chinese', 'Deli', 'Ethiopian', 'Fast Food', 'Fusion', 'Gluten Free', 'Halal', 'Healthy', 'Italian', 'Korean', 
  'Mediterranean', 'Mexican', 'Middle Eastern', 'Peruvian', 'Pizza', 'Pub', 'Seafood', 'Spanish', 'Sushi', 'Thai', 
  'Vegan Options', 'Vegetarian Friendly', 'Vietnamese']});
}

function getAccomodation(req, res) {
  res.json({accommodation: ['Bed Breakfast', 'Apartment Hotel', 'Budget Hotel', 'Casino', 'Corporate Lodging', 'Family-Friendly Hotel', 'Hotel',
    'Luxury Hotel', 'Motel', 'Resort', 'Spa']});
}

//--added general museum
function getInterests(req, res) {
  res.json({interests: ['General Museum', 'Art', "Children's Museum", 'History', 'Natural History', 'Nature', 'Historic Preservation', 
    'Science & Technology', 'Wildlife Conservation']});
}

function postSelections(req, res) {
  var airfare_budget = req.body.value['budget']*.30;
  var rest_budget1; var rest_budget2; var rest_budget3; var rest_budget4; var rest_budget5;
  if(airfare_budget <= 500){rest_budget1 = '$'; rest_budget2 = '$$'; rest_budget3 = '$-$$'; rest_budget4 = null; rest_budget5 = null}
  else if(airfare_budget > 500 && airfare_budget <= 1000){rest_budget1 = '$'; rest_budget2 = '$$'; rest_budget3 = '$-$$'; rest_budget4 = '$$$'; rest_budget5 = '$$-$$$';}
  else{rest_budget1 = '$$'; rest_budget2 = '$$$'; rest_budget3 = '$$-$$$'; rest_budget4 = '$$$$'; rest_budget5 = '$$$-$$$$';}
  var queries = `
  WITH Possible_Cities AS (
     SELECT city2 AS city, state2 AS state
     FROM Travel_App.Airfare_Data
     WHERE city1 = ? AND year = 2020 AND fare <= ?
     GROUP BY city2, state2
    ),
    Hotel_Info AS (
     SELECT hotels.city, hotels.state, COUNT(*) AS hotel_num
     FROM
     (SELECT h.city, h.state, h.name
     FROM Possible_Cities c JOIN Travel_App.Hotel_Reviews h ON c.city = h.city AND c.state = h.state
     WHERE h.reviews_rating >= 4 AND (h.categories LIKE ? OR h.categories LIKE ?)
     GROUP BY h.city, h.state, h.name) hotels
     GROUP BY city, state
    ),
    Museum_Info AS (
     SELECT museums.city, museums.state, COUNT(*) AS museum_num
     FROM
     (SELECT m.city, m.state, m.museum_name
     FROM Possible_Cities c JOIN Travel_App.Museum_Data m ON m.city = c.city AND m.state = c.state
     WHERE (m.museum_type LIKE ? OR m.museum_type LIKE ? OR m.museum_type LIKE ?) AND rating >= 4
     GROUP BY m.city, m.state, m.museum_name) museums
     GROUP BY museums.city, museums.state
    ),
    Restaurant_Info AS (
     SELECT restaurants.city_name AS city, restaurants.state_name AS state, COUNT(*) restaurant_num
     FROM
     (SELECT r.city_name, r.state_name, r.restaurant_name
     FROM Possible_Cities c JOIN Travel_App.Restaurant_Reviews r ON c.city = r.city_name AND c.state = r.state_name
     WHERE (r.cuisines_list LIKE ? OR r.cuisines_list LIKE ?) AND r.avg_rating >= 4 AND (price = ? OR price = ? OR price = ? OR price = ? OR price = ?)
     GROUP BY r.city_name, r.state_name, r.restaurant_name) restaurants
     GROUP BY restaurants.city_name, restaurants.state_name
    )
    SELECT h.city, h.state, hotel_num, museum_num, restaurant_num
    FROM Hotel_Info h
     JOIN Museum_Info m ON h.city = m.city AND h.state= m.state
     JOIN Restaurant_Info r ON h.city = r.city AND h.state = r.state LIMIT 10;
  `;
  connection.query(queries, [req.body.value['leavingFrom'], airfare_budget, '%'+req.body.value['accommodation'][0]+'%', 
    '%'+req.body.value['accommodation'][1]+'%', '%'+req.body.value['interests'][0]+'%', '%'+req.body.value['interests'][1]+'%', 
    '%'+req.body.value['interests'][2]+'%', '%'+req.body.value['cuisine'][0]+'%', '%'+req.body.value['cuisine'][1]+'%', 
    rest_budget1, rest_budget2, rest_budget3, rest_budget4, rest_budget5], function(err, rows, fields) {
    if (err) console.log(err);
    else {
      if(rows[0] != null){
        var queries = ''; var values = [];
        for (var i = 0; i < rows.length; i++) {
          queries = queries + `
          SELECT a.city1, b.state1, a.city2, a.state2, a.fare_low, a.fare_lg FROM Travel_App.Airfare_Data a JOIN 
            (SELECT state1, city1 FROM Travel_App.Airfare_Data WHERE city1 = ?) b ON b.city1 = a.city1 WHERE a.city1 = ? AND 
            a.city2 = `+`'`+rows[i]['city']+`'`+` AND a.state2 = `+`'`+rows[i]['state']+`'`+` AND a.year = 2020 AND a.fare <= ?;
          SELECT DISTINCT(name), reviews_title, reviews_rating, categories FROM Travel_App.Hotel_Reviews WHERE reviews_rating >= 4 AND (categories LIKE ? OR categories LIKE ?) AND
            city = `+`'`+rows[i]['city']+`'`+` AND state = `+`'`+rows[i]['state']+`'`+` GROUP BY name ORDER BY reviews_rating DESC LIMIT 3;
          SELECT DISTINCT(museum_name), museum_type FROM Travel_App.Museum_Data WHERE (museum_type LIKE ? OR 
            museum_type LIKE ? OR museum_type LIKE ?) AND rating >= 4 AND city = `+`'`+rows[i]['city']+`'`+` AND state = `+`'`+rows[i]['state']+`'`+` GROUP BY museum_name LIMIT 3;
          SELECT DISTINCT(restaurant_name), price, avg_rating, cuisines_list FROM Travel_App.Restaurant_Reviews WHERE avg_rating >= 4 AND 
            city_name = `+`'`+rows[i]['city']+`'`+` AND state_name = `+`'`+rows[i]['state']+`'`+` AND (price = ? OR price = ? OR price = ? OR price = ? OR price = ?) AND 
            (cuisines_list LIKE ? OR cuisines_list LIKE ?) GROUP BY restaurant_name ORDER BY avg_rating DESC LIMIT 3;
          SELECT * FROM Travel_App.Covid_Data WHERE state = `+`'`+rows[i]['state']+`'`+`;`;

          values.push(req.body.value['leavingFrom'], req.body.value['leavingFrom'], airfare_budget, '%'+req.body.value['accommodation'][0]+'%', 
            '%'+req.body.value['accommodation'][1]+'%', '%'+req.body.value['interests'][0]+'%', '%'+req.body.value['interests'][1]+'%', 
            '%'+req.body.value['interests'][2]+'%', rest_budget1, rest_budget2, rest_budget3, rest_budget4, rest_budget5, 
            '%'+req.body.value['cuisine'][0]+'%', '%'+req.body.value['cuisine'][1]+'%')
        }
          connection.query(queries, values, function(err, rows, fields) {
            if (err){
              console.log(err);
            }else {
              res.json(rows);
            }
          });
      }else{
        res.json({response: "none"});
      }
    }
  });
}

function handleLogin(req, res) {
  var queries = `
    SELECT * FROM Users WHERE user_email = ? AND user_password = ?;
  `;
  connection.query(queries, [req.body.value['user_email'], req.body.value['user_password']], function(err, rows, fields) {
    if (err) console.log(err);
    else {
      res.json(rows);
    }
  });
}

function handleSignUp(req, res) {
  var queries = `
    SELECT * FROM Users WHERE user_email = ?;
  `;
  connection.query(queries, [req.body.value['user_email']], function(err, rows, fields) {
    if (err) console.log(err);
    else {
      if(rows[0] == null){
        var queries = `INSERT INTO Users (user_email, user_password) VALUES (?, ?)`;
        connection.query(queries, [req.body.value['user_email'], req.body.value['user_password']], function(err, rows, fields) {
          if (err){
            console.log(err);
            res.json({response: "systems-failure"});
          }else {
            res.json({response: "success"});
          }
        });
      }else{
        res.json({response: "failure"});
      }
    }
  });
}

function postPreferences(req, res) {
  var queries = `
    UPDATE Users SET leaving_from = ?, restaurants1 = ?, restaurants2 = ?, accommodation1 = ?, accommodation2 = ?, interests1 = ?,
    interests2 = ?, interests3 = ?, budget = ? WHERE user_email = ?;
  `;
  connection.query(queries, [req.body.value['leaving_from'], req.body.value['cuisine'][0], req.body.value['cuisine'][1], req.body.value['accommodation'][0],
    req.body.value['accommodation'][1], req.body.value['interests'][0], req.body.value['interests'][1], req.body.value['interests'][2], 
    req.body.value['budget'], req.body.value['user']], function(err, rows, fields) {
    if (err){
      console.log(err);
      res.json({response: "systems-failure"});
    }else {
      res.json({response: "success"});
    }
  });
}

function getPreferences(req, res) {
  var queries = `
    SELECT * FROM Users WHERE user_email = ?;
  `;
  connection.query(queries, req.body.value['user'], function(err, rows, fields) {
    if (err){
      console.log(err);
    }else {
      res.json(rows);
    }
  });
}


module.exports = {
  getSearch: getSearch,
  getCuisine: getCuisine,
  getAccomodation: getAccomodation,
  getInterests: getInterests,
  postSelections: postSelections,
  handleLogin: handleLogin,
  handleSignUp: handleSignUp,
  getStates: getStates,
  getCovidForState: getCovidForState,
  postPreferences: postPreferences,
  getPreferences: getPreferences
}