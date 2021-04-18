//////////Written by Scott Theer//////////

import React from 'react';
import {
	BrowserRouter as Router,
	Route,
	Switch
} from 'react-router-dom';
import Home from './Home';
import Navbar from './PageNavbar';
import Footer from './Footer';
import Search from './Search';
import Results from './Results';
import SignUp from './SignUp';
import Login from './Login';
import Preferences from './Preferences';

function App() {
	return (
		<div className="App">
			<Router>
				<Switch>
					<Route exact path="/">
						<Navbar />
						<Home />
						<Footer />
					</Route>
					<Route exact path="/search">
						<Navbar />
						<Search />
						<Footer />
					</Route>
					<Route exact path="/results">
						<Navbar />
						<Results />
						<Footer />
					</Route>
					<Route exact path="/sign up">
						<Navbar />
						<SignUp />
						<Footer />
					</Route>
					<Route exact path="/login">
						<Navbar />
						<Login />
						<Footer />
					</Route>
					<Route exact path="/preferences">
						<Navbar />
						<Preferences />
						<Footer />
					</Route>
				</Switch>
			</Router>
		</div>
	)
}

export default App