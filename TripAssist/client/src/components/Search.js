//////////Written by Scott Theer//////////

import React from 'react';
import '../style/Search.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Autocomplete from './AutoComplete.js';
import { postAndRedirect } from "./util.js";


//Select component within Select Search Div
class SelectForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      options: [],
      selectedVal: null
    }
  }

  componentDidMount() {
    fetch("http://localhost:8786/"+this.props.formType,
    {
      method: 'GET'
    }).then(res => {
      return res.json();
    }, err => {
      console.log(err);
    }).then((optionList) => {
      if (!optionList) return;
      var selectOptions;
      selectOptions = [];
      for(var i = 0; i < optionList[this.props.formType].length; i++){
        selectOptions.push(<option key={i} value={optionList[this.props.formType][i]}>{optionList[this.props.formType][i]}</option>); //get select options from db and push into select compoenent
      }
      selectOptions.unshift(<option key={999} disabled value selected></option>); //add blank option as current selected
      this.setState({
        options: selectOptions
      });
    }, err => {
      console.log(err);
    });
  }

  render() {
    return (
      <select className="form-control" id={"form-"+this.props.formType+this.props.formNum} selected={this.props.formType+this.props.formNum} onChange={e => this.props.onFormInput(e)} disabled={this.props.disabled}>{this.state.options}</select>
    );
  }
}

//Search component with SelectForm statement block
class SelectDiv extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formNumber: 1,
      addClicked: false
    }
  }

  componentDidMount() {}

  onAddClick(e) {
    this.setState({
      addClicked: true,
      formNumber: this.state.formNumber + 1 //add button will deactivate once formNumber == maxForms prop
    });
  }

  render() {
    var divName = this.props.searchType;

    return (
      //non-active search divs are hidden from user; div becomes active after "next-arrow" click
      <div className={this.props.disabled ? "search-div" :  "search-div search-div-active"} id={"search-div-"+this.props.searchType} hidden={this.props.disabled}>
        <div className="h5">{divName.charAt(0).toUpperCase() + divName.slice(1)}</div>
        <div className="form-group" id={"form-group-"+this.props.searchType}>
          <SelectForm formType={this.props.searchType} formNum={1} onFormInput={e => this.props.onFormInput(e)} disabled={this.props.disabled}/>
          {
              this.state.addClicked && this.state.formNumber >= 2? //testing react if statement - adds additional div if conditions met
              <SelectForm formType={this.props.searchType} formNum={2} onFormInput={e => this.props.onFormInput(e)}/>
              :
              <div></div>
          }
          {
              this.state.addClicked && this.state.formNumber >= 3? //testing react if statement - adds additional div if conditions met
              <SelectForm formType={this.props.searchType} formNum={3} onFormInput={e => this.props.onFormInput(e)}/>
              :
              <div></div>
          }
        </div>
        <button className={(this.state.formNumber < this.props.maxForms) && this.props.selectedVal ? "add button button-active" : "add button"} id={"add-"+this.props.searchType} onClick={e => this.onAddClick(e)} disabled={!this.props.selectedVal || this.state.formNumber >= this.props.maxForms}>+</button>
      </div>
    );
  }
}

//Search Div with autocomplete or input html block
class InputDiv extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount() {
    this.loadCityList().then((data) => {
      this.setState({
        cityList: data
      });
    });
  }

  //to preload "leaving from" selector, pull distinct destinations from db
  loadCityList() {
    return new Promise((resolve, reject) => {
      fetch("http://localhost:8786/search",
      {
        method: 'GET'
      }).then(res => {
        return res.json();
      }, err => {
        console.log(err);
      }).then(cityList => {
        console.log(cityList);
        if (!cityList) return;
        let cities = cityList.map((city, i) => city.city1);
        resolve(cities);
      }, err => {
        console.log(err);
        reject("error");
      });
    });
  }

  render() {
    var divName = this.props.searchType;
    if(divName == "leavingFrom"){divName = "Leaving From"}
    if(divName == "budget"){divName = "Budget ($)"}

    return (
      //non-active search divs are hidden from user; div becomes active after "next-arrow" click
      <div className={this.props.disabled ? "search-div" :  "search-div search-div-active"} id={"search-div-"+this.props.searchType} hidden={this.props.disabled}>
        <div className="h5">{divName}</div>
        <div className="form-group" id={"form-group-"+this.props.searchType}>
         {
              this.props.inputType == "text"? //if input is text, add city select autcomplete
              <Autocomplete locations={this.state.cityList} onSelectLocation={e => this.props.onFormInput(e)} className={"form-control"} id={"form-"+this.props.searchType} value={this.props.selectedVal}/>
              :
              <div></div>
          }
          {
              this.props.inputType == "number"? //if input is text, add budget input
              <div>
                <input className="form-control" type="number" min="0" step="1" id={"form-"+this.props.searchType} autocomplete="off" onChange={e => this.props.onFormInput(e)} value={this.props.selectedVal} disabled={this.props.disabled}/>
                <div className={this.props.budgetFlag == false ? "hidden" : "incorrect-num"}>Please Enter a Positive Value Less Than $10000</div>
              </div> //if invalid budget entry display error message and prevent progress 
              :
              <div></div>
          }
        </div>
      </div>
    );
  }
}

//Arrow component button to advance search progress
class NextArrow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount() {}

  render() {
    return (
      //button is deactivated if previous inputs have not been adequately filled
      <input className={this.props.disabled ? "arrow button" : "arrow button button-active"} type="image" src="arrow.png" id={this.props.id} onClick={e => this.props.onClick(e)} disabled={this.props.disabled} hidden={this.props.disabled}/>
    );
  }
}

//Search Screen component
export default class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      leavingFrom: null,
      cuisine1: null, cuisine2: null,
      budget: '',
      accommodation1: null, accommodation2: null,
      interests1: null, interests2: null, interests3: null,
      group1_disabled: false, group2_disabled: true, group3_disabled: true
    }
  }

  componentDidMount() {}

  //on any form input on page, update state in parent component
  onFormInput(e, val) {
    var state = e.target.id.split('-')[1];
    var target;
    if (val == null){target = e.target.value;}
    else{target = val;}

    this.setState({
      [state]: target
    });
  }

  //custom handler to set autcomplete value in parent component
  onSelectLocation(val){
    this.setState({
      leavingFrom: val
    });
  }

  //handle next arrow click; advances user progress on search page
  onNextArrow(e){
    if(e.target.id.includes("first")){
      this.setState({
        group2_disabled: false
      });
    }else{
      this.setState({
        group3_disabled: false
      });
    }
  }

  //handle form submit and redirect to results page with search parameteres
  submitForm(e) {
    console.log()
    postAndRedirect('/results', this.state);
  }

  render() {    
    return (
      <div className="Search">

        <br></br>
        <div className="options-container">

          <div className="column">
            <InputDiv searchType="leavingFrom" inputType={"text"} placeholder={"Closest Major City"} onFormInput={this.onSelectLocation.bind(this)} selectedVal={this.state.leavingFrom}/>
            
            <img className="plane-icon" id="first-plane" src="plane.png" />

            <SelectDiv searchType="cuisine" sqlQuery={false} maxForms={2} onFormInput={this.onFormInput.bind(this)} selectedVal={this.state.cuisine1} disabled={this.state.group1_disabled}/>
          </div>

          <div className="column arrow-column">
            <NextArrow id="first-arrow-img" disabled={!this.state.cuisine1 || !this.state.leavingFrom} onClick={this.onNextArrow.bind(this)}/>
          </div>

          <div className="column">
            <InputDiv searchType="budget" inputType={"number"} onFormInput={this.onFormInput.bind(this)} budgetFlag={this.state.budget == '' || (this.state.budget < 10000 && this.state.budget > 0) ? false : true} disabled={this.state.group2_disabled}/>

            <img className="plane-icon" id="second-plane" src="plane.png" hidden={this.state.group2_disabled}/>

            <SelectDiv searchType="accommodation" sqlQuery={false} maxForms={2} onFormInput={this.onFormInput.bind(this)} selectedVal={this.state.accommodation1} disabled={this.state.group2_disabled}/>
          </div>

          <div className="column arrow-column">
            <NextArrow id="second-arrow-img" disabled={this.state.budget == '' || (this.state.budget > 10000 || this.state.budget <= 0) || !this.state.accommodation1} onClick={this.onNextArrow.bind(this)}/>
          </div>

          <div className="column">
            <div id="search-div-submit" className={!this.state.interests1 ? "search-div" : "search-div submit-div-active"} onClick={e => this.submitForm(e)} hidden={this.state.group3_disabled || this.state.budget == '' || (this.state.budget > 10000 || this.state.budget <= 0)}>
              <img className="cloud" id="cloud-2" src="cloudwhite.png" />
              <div className="h5" id="submit">Submit</div>
            </div>

            <img className="plane-icon" id="third-plane" src="plane.png" hidden={this.state.group3_disabled}/>

            <SelectDiv searchType="interests" sqlQuery={false} maxForms={3} active="" onFormInput={this.onFormInput.bind(this)} selectedVal={this.state.interests1} disabled={this.state.group3_disabled}/>
            
          </div>

          <br></br>
        </div>

          <img className="cloud" id="cloud1-search" src="cloudwhite.png" />
          <img className="cloud" id="cloud2-search" src="cloudwhite.png" />
          <img className="cloud" id="cloud3-search" src="cloudwhite.png" />
          <img className="cloud" id="cloud4-search" src="cloudwhite.png" />
          <img className="cloud" id="cloud5-search" src="cloudwhite.png" />
      </div>
    );
  }
}