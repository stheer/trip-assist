//////////Written by Scott Theer//////////

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/Preferences.css';
import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { Button } from "@material-ui/core";
import { ajaxPost } from "./util.js";
import { catchAjaxError } from "./util.js";

//Preference component block
class PreferencesBlock extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			optionsDivs: [],
			optionList: []
		}
	}

	//get options for preference select from db as promise
	getOptionsList(search) {
		return new Promise((resolve, reject) => {
			fetch("http://localhost:8786/"+search,
		    {
		      method: 'GET'
		    }).then(res => {
		      return res.json();
		    }, err => {
		      console.log(err);
		    }).then(optionList => {
		      if (!optionList) return;
		      var option;
		      if(search == "search"){
		      	option = optionList.map((city, i) => city.city1);
		      }else{
		      	option = optionList[search];
		      }
		      resolve(option);
		    }, err => {
		      console.log(err);
		      reject("error");
		    });
		});
	}

	componentDidMount() {
		if(this.props.purpose == "select"){ //if selector field, add autocomplete div
			this.getOptionsList(this.props.apiEndpoint).then((data) => {
		    	this.setState({
		        	optionsList: data //set options state for Autocomplete component
		      	});
				var optionInputs = this.props.default.map((defaultVal, i) => //push proper number of autocomplete inputs into preference block
					<Autocomplete key={i} id={"preference-"+this.props.type+i} options={this.state.optionsList}
					getOptionLabel={(option) => option} style={{width: 300, position: 'relative', margin: '15px 0 20px 30px', display: 'block'}} 
					onInputChange={(event, value) => this.props.onFormInput(event, value)} renderInput={(params) => <TextField {...params} label={defaultVal} variant="outlined"/>}/>
				);
				this.setState({
		        	optionDivs: optionInputs
		      	});
		    });
		}else{ //if text field, add html input div
			var optionInputs = [];
			optionInputs.push(<form noValidate autoComplete="off"><TextField style={{width: 300, position: 'relative', margin: '15px 0 20px 30px', display: 'block'}} 
			id={"preference-"+this.props.type+"0"} type="number" label={this.props.default} value={this.props.value} onInput={(event) => this.props.onFormInput(event)} /></form>);
			this.setState({
	        	optionDivs: optionInputs
	      	});
		}
	}

	render() {
		return (
			<div className="preference-block">
				<div className="preference-title">{this.props.type}</div>
				<div className="preference-text">{this.props.typeText}</div>
				{this.state.optionDivs}
			</div>
        );
	}
}

//User Preferences Component
export default class Preferences extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			prefBlocks: '', flights0: null,
			restaurants0: null, restaurants1: null,
			accommodation0: null, accommodation1: null,
			interests0: null, interests1: null, interests2: null,
			budget0: null
		}
	}

	//handle all select input
	onFormInput(e, value) {
		//product of using @material-ui/core component - ensure target is input
		if(e.target.className[0] == 'M'){
			var state = e.target.id.split('-')[1].toLowerCase();
    		this.setState({
        		[state]: value
      		});
		}
	}

	//handle Budget input
	onFieldInput(e){
		//product of using @material-ui/core component - ensure target is input
		if(e.target.className[0] == 'M'){
			var state = e.target.id.split('-')[1].toLowerCase();
    		this.setState({
        		[state]: e.target.value
      		});
		}
	}

	//if previously logged in user, pull preferences from db and prefill in selectors
	loadUserPrefs(){
		var postData = {'user': sessionStorage.getItem('loggedIn')};
		return new Promise((resolve, reject) => {
			ajaxPost('http://localhost:8786/getPreferences', postData, function(data) {
				var response = JSON.parse(data);
			    resolve(response[0]);
			}, catchAjaxError);
		});
	}

	componentDidMount() {
		this.loadUserPrefs().then((data) => { //load defaults pulled from db; if no defaults, null values not displayed
    		this.setState({
        		flights0: data['leaving_from'],
        		restaurants0: data['restaurants1'],  restaurants1: data['restaurants2'],
        		accommodation0: data['accommodation1'], accommodation1: data['accommodation2'],
				interests0: data['interests1'], interests1: data['interests2'], interests2: data['interests3'],
				budget0: data['budget']
      		});

      		var preferencesBlocks = []; //push preference selectors onto page - ensures dynamic reloading if default preferences are asynchronously added after page load 
      		preferencesBlocks.push(<PreferencesBlock key={1} apiEndpoint={"search"} purpose={"select"} options={this.state.citiesList} type={"Flights"} typeText={"Enter your departure city"} 
				default={this.state.flights0 == null ? ["Closest Major City"] : [this.state.flights0]} onFormInput={this.onFormInput.bind(this)} selectNum={1}/>);
			preferencesBlocks.push(<PreferencesBlock key={2} apiEndpoint={"cuisine"} purpose={"select"} options={this.state.cuisineList} type={"Restaurants"} typeText={"Enter your preferred cuisine types"}
				default={this.state.restaurants0 == null ? ["Cuisine", "Cuisine"] : [this.state.restaurants0, this.state.restaurants1]} onFormInput={this.onFormInput.bind(this)} selectNum={2}/>);
			preferencesBlocks.push(<PreferencesBlock key={3} apiEndpoint={"accommodation"} purpose={"select"} options={this.state.cuisineList} type={"Accommodation"} typeText={"Enter your preferred accommodation types"}
				default={this.state.accommodation0 == null ? ["Accommodation", "Accommodation"] : [this.state.accommodation0, this.state.accommodation1]} onFormInput={this.onFormInput.bind(this)} selectNum={2}/>);
			preferencesBlocks.push(<PreferencesBlock key={4} apiEndpoint={"interests"} purpose={"select"} options={this.state.cuisineList} type={"Interests"} typeText={"Enter a few of your interests"}
				default={this.state.interests0 == null ? ["Interests", "Interests", "Interests"] : [this.state.interests0, this.state.interests1, this.state.interests2]} onFormInput={this.onFormInput.bind(this)} selectNum={3}/>);
			preferencesBlocks.push(<PreferencesBlock key={5} purpose={"input"} options={this.state.cuisineList} type={"Budget"} typeText={"Enter your estimated trip budget ($)"}
				default={this.state.budget0 == null ? ["Budget"] : [this.state.budget0]} onFormInput={this.onFieldInput.bind(this)} value={this.state.budget} selectNum={3}/>);
			this.setState({
        		prefBlocks: preferencesBlocks
      		});
    	})  
	}

	//post selected preferences to db
	handlePrefSubmit(e) {
		var postData = {'leaving_from': this.state.flights0, 
	    'cuisine': [this.state.restaurants0,  this.state.restaurants1],
	    'budget': this.state.budget0,
	    'accommodation': [this.state.accommodation0, this.state.accommodation1],
	    'interests': [this.state.interests0, this.state.interests1, this.state.interests2],
	    'user': sessionStorage.getItem('loggedIn')};

		return new Promise((resolve, reject) => {
			ajaxPost('http://localhost:8786/preferences', postData, function(data) {
			    var response = JSON.parse(data);
			    console.log(response);
			    if(response['response'] == 'success'){
			    	resolve(response['response']);
			    	window.location.href = "/";
			    }else{
			    	reject("error");
			    }
		    }, catchAjaxError);
		});
	}

	render() {
		//ensures that each selector is adequately filled before user can submit
		var completedForm = ((this.state.flights0 == null || this.state.flights0 == "") || 
			(this.state.restaurants0 == null || this.state.restaurants0 == "") || 
			(this.state.restaurants1 == null || this.state.restaurants1 == "") ||
			(this.state.accommodation0 == null || this.state.accommodation0 == "") || 
			(this.state.accommodation1 == null || this.state.accommodation1 == "") || 
			(this.state.interests0 == null || this.state.interests0 == "") ||
			(this.state.interests1 == null || this.state.interests1 == "") ||
			(this.state.interests2 == null || this.state.interests2 == "") ||
			(this.state.budget0 == null || this.state.budget0 == "")) 

		return (
			<div className="Preferences">
        		<br></br>
				<h1 id="page-title">Preferences</h1>
				<img className="planeicon-preferences" id="plane-1" src="plane.png" />
				<img className="planeicon-preferences" id="plane-2" src="plane.png" />
		    	<img className="cloud" id="cloud1-preferences" src="cloudwhite.png" />
		        <img className="cloud" id="cloud2-preferences" src="cloudwhite.png" />
		        <img className="cloud" id="cloud3-preferences" src="cloudwhite.png" />
		        <img className="cloud" id="cloud4-preferences" src="cloudwhite.png" />
		        <img className="cloud" id="cloud5-preferences" src="cloudwhite.png" />
		        <img className="cloud" id="cloud6-preferences" src="cloudwhite.png" />
		        <img className="cloud" id="cloud7-preferences" src="cloudwhite.png" />
				
				{this.state.prefBlocks}

				<Button variant="outlined" className={completedForm ? "" : "activated-pref-button"} id="preference-button" 
				onClick={e => this.handlePrefSubmit(e)} disabled={completedForm}>Submit</Button>
			</div>
        );
	}
}
