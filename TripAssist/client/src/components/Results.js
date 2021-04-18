//////////Written by Scott Theer//////////

import React from 'react';
import '../style/Results.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ajaxPost } from "./util.js";
import { catchAjaxError } from "./util.js";
import { properCasing } from "./util.js";

//single row component displaying flight information in expanded Results Block
class FlightRow extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {    
    return (
        <div className="results-row">
          <div className="route result"><span className="result-topic">Route: </span>{this.props.city1 + ", " + this.props.state1 + " -----> " + this.props.city2 + ", " + this.props.state2}</div>
          <div className="cost result"><span className="result-topic">Estimated Ticket Cost ($): </span>{this.props.costLow + " - " + this.props.costHigh}</div>
        </div>
    );
  }
}

//single row component displaying hotel information in expanded Results Block
class HotelRow extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {    
    return (
        <div className="results-row">
          <div className="name result">{this.props.name}</div>
          <div className="type result"><span className="result-topic">Type: </span>{this.props.type}</div>
          <div className="rating result"><span className="result-topic">Avg Rating: </span>{this.props.rating + " / 5"}</div>
          <div className="review result">{this.props.review}</div>
        </div>
    );
  }
}

//single row component displaying restaurant information in expanded Results Block
class CuisineRow extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {    
    return (
        <div className="results-row">
          <div className="name result">{this.props.name}</div>
          <div className="type result"><span className="result-topic">Cuisine: </span>{this.props.type}</div>
          <div className="rating result"><span className="result-topic">Avg Rating: </span>{this.props.rating + " / 5"}</div>
          <div className="review result"><span className="result-topic">Price: </span><span className="dollars">{this.props.price}</span></div>
        </div>
    );
  }
}

//single row component displaying museum information in expanded Results Block
class MuseumRow extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {    
    return (
        <div className="results-row">
          <div className="museum-name result">{this.props.name}</div>
          <div className="museum-type result"><span className="result-topic">Type: </span>{this.props.type}</div>
        </div>
    );
  }
}

//Result Block component containing all results for 1 distinct, recommended city
class ResultBlock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: false,
      final_matches: [],
      hotel_results: [],
      cuisine_results: [],
      museum_results: [],
      price: '',
      covid: ''
    }
  }

  componentDidMount(e) {
    //get interest matches from db query
    var matches = []; var i = 0;
    this.props.matchingIntersts.forEach((match) => {
      if(i == 0){matches.push(match); i++;}
      else{matches.push(" | " + match); i++;}
    });
    this.setState({
      final_matches: matches
    });

    //get hotel matches from db query
    var resultHotel = [];
    this.props.hotels.forEach((hotel, i) => {
      resultHotel.push(<HotelRow key={i} name={hotel['name']} type={hotel['categories'].search(this.props.hotel_category[0]) == -1 ? this.props.hotel_category[1] : this.props.hotel_category[0]} 
      rating={hotel['reviews_rating']} review={hotel['reviews_title']} />);
    });
    this.setState({
      hotel_results: resultHotel
    });

    //get cuisine matches from db query
    var cuisines = [];
    var cuisinePrice = 0;
    this.props.cuisine.forEach((cuisine, i) => {
      console.log(cuisine);
      console.log(this.props.cuisine_category);
      cuisines.push(<CuisineRow key={i} name={cuisine['restaurant_name']} type={cuisine['cuisines_list'].search(this.props.cuisine_category[0]) == -1 ? this.props.cuisine_category[1] : this.props.cuisine_category[0]} 
      rating={cuisine['avg_rating']} price={cuisine['price']} />);
      
      switch(cuisine['price']) { //Solve for total cuisine price using restaurant prices from db
        case '$':
          cuisinePrice++;
          break;
        case '$-$$':
          cuisinePrice = cuisinePrice + 2;
          break;
        case '$$':
          cuisinePrice = cuisinePrice + 3;
          break;
        case '$$-$$$':
          cuisinePrice = cuisinePrice + 4;
          break;
        case '$$$':
          cuisinePrice = cuisinePrice + 5;
          break;
        case '$$$-$$$$':
          cuisinePrice = cuisinePrice + 6;
          break;
        case '$$$$':
          cuisinePrice = cuisinePrice + 7;
          break
        default:
      }
    });
    this.setState({
      cuisine_results: cuisines
    });

    //get museum matches from db query
    var museums = [];
    this.props.museum.forEach((museum, i) => {
      museums.push(<MuseumRow key={i} name={properCasing(museum['museum_name'])} type={properCasing(museum['museum_type'])}/>);
    });
    this.setState({
      museum_results: museums
    });

    var finalPrice; 
    var expectedPrice = (this.props.costLow + this.props.costHigh) / 2; //calculate expected flight price as average of high and low ticket prices
    if(expectedPrice <= 200 && cuisinePrice <= 5){ //calculate final price estimate using flight and restaurant prices
      finalPrice = '$';
    }else if((expectedPrice <= 300 && expectedPrice > 200) && cuisinePrice <= 5){
      finalPrice = '$$';
    }else if(expectedPrice <= 200 && (cuisinePrice <= 8 && cuisinePrice > 5)){
      finalPrice = '$$';
    }else if((expectedPrice <= 300 && expectedPrice > 200) && (cuisinePrice <= 14 && cuisinePrice > 5)){
      finalPrice = '$$$';
    }else if((expectedPrice <= 300 && expectedPrice > 200) && cuisinePrice > 14){
      finalPrice = '$$$';
    }else if(expectedPrice > 300 && cuisinePrice > 14){
      finalPrice = '$$$$';
    }else if(expectedPrice > 300 && (cuisinePrice <= 14 && cuisinePrice > 5)){
      finalPrice = '$$$';
    }else{
      finalPrice = '$$$';
    }
    this.setState({
      price: finalPrice
    });

    //Calculatee covid risk using covid statistics on state level 
    var covidRisk = 0; var covidClass = ''; 
    var pos = this.props.covid[0]['positive']; var tot = this.props.covid[0]['total_test_results']; 
    var hosp = this.props.covid[0]['hospitalized']; var death = this.props.covid[0]['death'];
    var pop = this.props.covid[0]['population'];
    if(pos/tot > 0 && pos/tot <= .05){
      covidRisk++;
    }else if(pos/tot > .05 && pos/tot <= .10){
      covidRisk = covidRisk + 2;
    }else if(pos/tot > .10 && pos/tot <= .20){
      covidRisk = covidRisk + 4;
    }else if(pos/tot > .2){
      covidRisk = covidRisk + 6;
    }

    if(hosp/pop > 0 && hosp/pop <= .0025){
      covidRisk++;
    }else if(hosp/pop > .0025 && hosp/pop <= .005){
      covidRisk = covidRisk + 2;
    }else if(hosp/pop > .005){
      covidRisk = covidRisk + 4;
    }

    if(death/pop > 0 && death/pop <= .001){
      covidRisk++;
    }else if(death/pop > .001 && death/pop <= .002){
      covidRisk = covidRisk + 2;
    }else if(death/pop > .002){
      covidRisk = covidRisk + 4;
    }

    if(covidRisk <= 3){
      covidClass = 'risk-1';
    }else if(covidRisk <= 6 && covidRisk > 3){
      covidClass = 'risk-2';
    }else if(covidRisk <= 9 && covidRisk > 6){
      covidClass = 'risk-3';
    }else if(covidRisk <= 12 && covidRisk > 9){
      covidClass = 'risk-4';
    }else if(covidRisk <= 15 && covidRisk > 12){
      covidClass = 'risk-5';
    }else if(covidRisk > 15){
      covidClass = 'risk-6';
    }
    this.setState({
      covid: covidClass
    });
  }

  expandBlock(e) {
    this.setState(prevState => ({
      expand: !prevState.expand
    }));
  }

  render() {
    return (
      <div className={this.state.expand == false ? "results-block-min" : "results-block-min clicked-rec"} onClick={e => this.expandBlock(e)}>
        <div className="results-top">
          <div className="results-preview city-name">{this.props.cityName + ", " + this.props.stateName}</div>
          <div className="results-preview estimated-cost"><b>Estimated Cost:</b> <span class="dollars">{this.state.price}</span></div>
          <div className="results-preview matching-interests"><b>Matching Interests:</b>{this.state.final_matches}</div>
          <div className="results-preview covid-risk"><b>COVID Risk-Level:</b> <div className={"covid-level " + this.state.covid}></div></div>
        </div>
        <div className={this.state.expand == false ? "hidden results-bottom" : "results-bottom"}>
          <div className="flights results-list"><span className="results-title">Flights</span>
            <FlightRow city1={this.props.city1} state1={this.props.state1} city2={this.props.cityName} state2={this.props.stateName} costLow={this.props.costLow} costHigh={this.props.costHigh} />
          </div>
          <div className="hotels results-list"><span className="results-title">Accomodations</span>
            {this.state.hotel_results}
          </div>
          <div className="cuisines results-list"><span className="results-title">Restaurants</span>
            {this.state.cuisine_results}
          </div>
          <div className="museums results-list"><span className="results-title">Museums</span>
            {this.state.museum_results}
          </div>
        </div>
      </div>
    );
	}
}

//Results Screen component
export default class Results extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      results: []
    }
  }

  postSearchData(e) {
    let params = new URLSearchParams(window.location.search); //get search parameters from URL for post request and recommendation query
    var postData = {'leavingFrom': params.getAll('leavingFrom'), 
    'cuisine': [params.getAll('cuisine1')[0], params.getAll('cuisine2')[0]],
    'budget': params.getAll('budget'),
    'accommodation': [params.getAll('accommodation1')[0], params.getAll('accommodation1')[0]],
    'interests': [params.getAll('interests1')[0], params.getAll('interests2')[0], params.getAll('interests3')[0]]}

    var resultBlocks = []; var resultHotel = [];
    return new Promise((resolve, reject) => {
      ajaxPost('http://localhost:8786/userResults', postData, function(data) { //post search parameters and get recommendations from db query
        var response = JSON.parse(data);
        var interests; //store interest matches for Result Block title display
        if(response['response'] == 'none'){
          resolve("No Matches - Try a Different Search!"); //if size of query response is zero, 'none' response sent and message displayed
        }else{
          for (var i = 0; i < response.length; i += 5) {
            interests = new Set();
            response[i+2].forEach((museum, i) => {
              if(museum['museum_type'].search('CHILDREN') >= 0){ //remove 'Museum' string from interest matches except for 'CHILDREN'S MUSEUMS'
                interests.add(" " + properCasing(museum['museum_type']));
              }else{
                interests.add(" " + properCasing(museum['museum_type'].replace("MUSEUM", "")));
              }
            });
            //create array of Result Blocks with relevant matches per recommended city
            resultBlocks.push(<ResultBlock key={i} cityName={properCasing(response[i][0]['city2'])} stateName={response[i][0]['state2']} 
              matchingIntersts={interests} city1={properCasing(response[i][0]['city1'])} state1={response[i][0]['state1']}
              costLow={response[i][0]['fare_low']} costHigh={response[i][0]['fare_lg']} covid={response[i+4]}
              hotels={response[i+1]} hotel_category={[params.getAll('accommodation1')[0], params.getAll('accommodation1')[0]]} 
              museum={response[i+2]} cuisine={response[i+3]} cuisine_category={[params.getAll('cuisine1')[0], params.getAll('cuisine2')[0]]}/>);
          }
          resolve(resultBlocks);
        }
      }, catchAjaxError);
    });
  }

  componentDidMount(e) {
    this.postSearchData(e).then((data) => {
      this.setState({
        results: data
      });
    })    
  }

  render() {    
    return (
      <div className="Results">
        <br></br>
        <h1 id="page-title">Recommendations</h1>
        <div className="results-container">
          <img className="planeicon-results" src="plane.png" />
          <img className="cloud" id="cloud1-results" src="cloudwhite.png" />
          <img className="cloud" id="cloud2-results" src="cloudwhite.png" />
          <img className="cloud" id="cloud3-results" src="cloudwhite.png" />
          <img className="cloud" id="cloud4-results" src="cloudwhite.png" />
          <img className="cloud" id="cloud5-results" src="cloudwhite.png" />
          {this.state.results}
        </div>
      </div>
    );
  }
}