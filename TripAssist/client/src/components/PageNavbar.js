//////////Written by Scott Theer//////////

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/Navbar.css';

export default class PageNavbar extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			navDivs: [],
			loggedIn: sessionStorage.getItem('loggedIn') //check if session variable present
		}
	}

	componentDidMount() {
		var pageList;
		if(this.state.loggedIn != null){
			pageList = [this.state.loggedIn, 'search'];
		}else{
			pageList = ['search', 'Sign Up', 'login']; //site page list in navbar
		}
		

		let navbarDivs = pageList.map((page, i) => {
			if (page == this.state.loggedIn){ //if logged in, add logged in username to navbar
				return <a className="nav-item nav-link user-nav" key={i} href={"/preferences"}>{page}</a>
			}
			if (window.location.href.includes(page.split(" ")[0])) {
				return <a className="nav-item nav-link active" key={i} href={"/" + page}>{page.charAt(0).toUpperCase() + page.substring(1, page.length)}</a>
			}
			else {
				return <a className="nav-item nav-link" key={i} href={"/" + page}>{page.charAt(0).toUpperCase() + page.substring(1, page.length)}</a> //push each value in page list to navbar with proper casing
			}
		});

		this.setState({
			navDivs: navbarDivs
		});
	}

	render() {
		return (
			<div className="PageNavbar">
				<nav className="navbar navbar-expand-lg navbar-light navbar-custom">
				<nav className="navbar-brand" href="/">
					<a href="/">
				      <img src="logo.png" className="logo" alt=""/>
				      <div className="logo-text-wrap">
				      	<span className="logo-text">Trip Assist</span>
				      </div>
				    </a>
			    </nav>
			      <div className="navbar-collapse justify-content-end" id="navbarNavAltMarkup">
			        <div className="navbar-nav">
			        	{this.state.navDivs}
			        </div>
			      </div>
			    </nav>
			</div>
        );
	}
}