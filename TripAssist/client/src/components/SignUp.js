//////////Written by Scott Theer//////////

import React from 'react';
import '../style/SignUp.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from "@material-ui/core";
import { ajaxPost } from "./util.js";
import { catchAjaxError } from "./util.js";

//Sign Up Block component containing page functionality
class SignUpBlock extends React.Component {

	constructor(props) {
		super(props);
    	this.state = {
    		username: '',
    		password: '',
    		incorrectSignIn: false
    	}
  	}

  	componentDidMount() {}

  	//login button clicked - send to login page
	handleLoginClick(e) {
		window.location.href = "/login";
	}

	//post input login info to server for validation, return in async promise
	handleSignUpSend(e) {
		var signUpData = {
			'user_email': this.state.username, 
			'user_password': this.state.password
		}
		return new Promise((resolve, reject) => {
			ajaxPost('http://localhost:8786/Sign Up', signUpData, function(data) {
			    var response = JSON.parse(data);
			    console.log(response);
			    if(response['response'] == 'success'){
			    	resolve(response['response']);
			    }else if(response['response'] == 'failure'){
			    	resolve(response['response']);
			    }else{
			    	reject("error");
			    }
		    }, catchAjaxError);
		});
	}

	//await validation of signup info and accept or reject signup
	handleSignUpClick(e) {
		this.handleSignUpSend(e).then((data) => {
			if(data == "success"){
				this.setState({
					incorrectSignIn: false //do not show replicated signup message
				});
				sessionStorage.setItem('loggedIn', this.state.username);
				window.location.href = "/preferences"; //if signup accepted, redirect to preferences page
			}else if(data == "failure"){
				this.setState({
					incorrectSignIn: true //show replicated signup message
				});
			}
    	});
	}

	handleLoginChange(e) {
		if(e.target.name == 'email'){ //if email input, update username otherwise password states
			this.setState({
		      username: e.target.value
		    });
		}else{
			this.setState({
		      password: e.target.value
		    });
		}
	}

	render() {    
		return (
			<div id="sign-up-top">
				<div id="sign-up-container">
					<span id="sign-up-header">Create your free account</span>
					<div id="sign-up-info">
						<label for="email" className="input-title" id="email">Email</label>
						<span className="input-span"><input name="email" type="text" className="info-input" id="email-input" placeholder = "john" value={this.state.username} onChange={e => this.handleLoginChange(e)}/></span>
						<br></br>

						<label for="password" className="input-title" id="password">Password</label>
						<span className="input-span"><input name="password" type="text" className="info-input" id="password-input" placeholder = "doe123" value={this.state.password} onChange={e => this.handleLoginChange(e)}/></span>
						<br></br>

					<Button variant="outlined" id="submit-signup" onClick={e => this.handleSignUpClick(e)} disabled={this.state.username.trim() == "" || this.state.password.trim() == ""} className={this.state.username.trim() == "" || this.state.password.trim() == "" ? "button" : "button-active"}>Create Account</Button>

					<div id="incorrect-signup" className={!this.state.incorrectSignIn ? "hide" : ""}>Login Email Already Exists!</div>

					</div>

					<div id="log-in-div">
						<span className="login-prompt">Already have an account?</span>
						<Button variant="outlined" id="login-button" onClick={e => this.handleLoginClick(e)}>Log In</Button>
					</div>
	        	</div>
	        </div>
	    );
	}
}

//Sign Up Screen component
export default class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount() {}

  render() {    
    return (
      <div className="SignUp">
      	<div id="sign-up">
      		<img className="planeicon" src="plane.png" />
      		<img className="cloud" id="cloud1" src="cloudwhite.png" />
		    <img className="cloud" id="cloud2" src="cloudwhite.png" />
		    <img className="cloud" id="cloud3" src="cloudwhite.png" />
		    <img className="cloud" id="cloud4" src="cloudwhite.png" />
      		<SignUpBlock />
      	</div>
      </div>
    );
  }
}