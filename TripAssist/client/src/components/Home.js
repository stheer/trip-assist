//////////Written by Scott Theer//////////

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/Home.css';

//Home Screen component
export default class Home extends React.Component {
	constructor(props) {
		super(props);
		this.state = {}
	}

	componentDidMount() {}

	//send user to search page
	handleSearchClick() {
		window.location.href = "/search";
	}

	render() {
		return (
			<div className="Home">
				<div className="home-options">
					<h1 className="welcome"><span className="title" id="top">Let the <span className="underline">perfect trip</span>
					</span><span className="title" id="bottom">find you.</span></h1>
					<button className="search-botton-home" onClick={this.handleSearchClick}>Search Trips</button>
				</div>
				<img className="planeicon" id="plane-home" src="plane.png" />
				<img className="cloud" id="cloud1-home" src="cloudwhite.png" />
	        	<img className="cloud" id="cloud2-home" src="cloudwhite.png" />
	        	<img className="cloud" id="cloud3-home" src="cloudwhite.png" />
	        	<img className="cloud" id="cloud5-home" src="cloudwhite.png" />
			</div>
        );
	}

}