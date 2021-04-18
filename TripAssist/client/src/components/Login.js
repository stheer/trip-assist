//////////Written by Scott Theer//////////

import React from 'react';
import '../style/Login.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from "@material-ui/core";
import { ajaxPost } from "./util.js";
import { catchAjaxError } from "./util.js";

//Login Block component containing page functionality
class LoginBlock extends React.Component {

	constructor(props) {
		super(props);
    	this.state = {
    		username: '',
    		password: '',
    		incorrectLogin: false
    	}
  	}

  	componentDidMount() {}

  	//sign-up button clicked - send to sign up page
	handleSignUpClick(e) {
		window.location.href = "/sign up";
	}

	//post input login info to server for validation, return in async promise
	handleLoginSend(e) {
		var loginData = {
			'user_email': this.state.username, 
			'user_password': this.state.password
		}
		return new Promise((resolve, reject) => {
			ajaxPost('http://localhost:8786/login', loginData, function(data) {
			    var response = JSON.parse(data);
			    console.log(response);
			    if(response[0] == null){
			    	resolve("failure");
			    }else{
			    	resolve("success");
			    }
		    }, catchAjaxError);
		});
	}

	//await validation of login info and accept or reject login
	handleLoginClick(e) {
		this.handleLoginSend(e).then((data) => {
			if(data == "success"){
				this.setState({
					incorrectLogin: false //do not show incorrect login message
				});
				sessionStorage.setItem('loggedIn', this.state.username); //set session variable confirming login
				window.location.href = "/";
			}else if(data == "failure"){
				this.setState({
					incorrectLogin: true //show incorrect login message
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
			<div id="login-up-top">
				<div id="login-container">
					<span id="login-header">Login</span>
					<div id="login-info">
						<label for="email" className="input-title" id="email">Email</label>
						<span className="input-span-login"><input name="email" type="text" className="info-input-login" id="email-input-login" placeholder = "john" value={this.state.username} onChange={e => this.handleLoginChange(e)}/></span>
						<br></br>

						<label for="password" className="input-title" id="password">Password</label>
						<span className="input-span-login"><input name="password" type="text" className="info-input-login" id="password-input-login" placeholder = "doe123" value={this.state.password} onChange={e => this.handleLoginChange(e)}/></span>
						<br></br>

					<Button variant="outlined" id="submit-login" onClick={e => this.handleLoginClick(e)} disabled={this.state.username.trim() == "" || this.state.password.trim() == ""} className={this.state.username.trim() == "" || this.state.password.trim() == "" ? "button" : "button-active"}>Login</Button>

					<div id="incorrect-login" className={!this.state.incorrectLogin ? "hide" : ""}>Incorrect Login!</div>
					</div>

					<div id="signup-div">
						<span className="signup-prompt">Don't have an account?</span>
						<Button variant="outlined" id="signup-button" onClick={e => this.handleSignUpClick(e)}>Sign Up</Button>
					</div>
	        	</div>
	        </div>
	    );
	}
}

//Login Screen component
export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount() {}

  render() {    
    return (
      <div className="Login">
      	<div id="login">
      		<img className="planeicon-login" src="plane.png" />
      		<img className="cloud" id="cloud1-login" src="cloudwhite.png" />
		    <img className="cloud" id="cloud2-login" src="cloudwhite.png" />
		    <img className="cloud" id="cloud3-login" src="cloudwhite.png" />
		    <img className="cloud" id="cloud4-login" src="cloudwhite.png" />
		    <img className="cloud" id="cloud5-login" src="cloudwhite.png" />
      		<LoginBlock />
      	</div>
      </div>
    );
  }
}