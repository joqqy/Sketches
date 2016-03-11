// Home.js

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import ExperimentList from './ExperimentList';

class Home extends Component {
	constructor(props) {
		super(props)
	}

	render() {
		return (
			<div className="App">
				<Link to="/Sketches/about">ABOUT</Link>
				<ExperimentList 
					experiments = {this.props.experiments}
				/>
				{this.props.children}
			</div>

		);
	}
} 

function mapStateToProps(state, ownProps) {
	return {experiments:state.experiments};
}

export default connect(mapStateToProps)(Home);