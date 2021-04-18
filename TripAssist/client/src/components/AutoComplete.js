

import React from 'react';
import '../style/AutoComplete.css';

export default class Autocomplete extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            suggestions: [],
            text: '',
        };
    }

    //filter options list based on user preferences
    onInputChange = (e) => {
        const items = this.props.locations;
        const value = e.target.value;
        let suggestions = [];
        if (value.length > 0){
            const regex = new RegExp(`^${value}`, 'i');
            suggestions = items.sort().filter(v => regex.test(v));
        }
        this.setState(() => ({ suggestions, text: value}));
    }

    //add options to autcomplete
    renderSuggestions () {
        const { suggestions } = this.state;
        if (suggestions.length === 0) {
            return null;
        }
        return (
        <ul>
            {suggestions.map((suggestion, i) => <li key={i} onClick={() => this.select(suggestion)}>{suggestion}</li>)}
        </ul>
        )
    }

    //handle user select click on filtered option list
    select (value) {
        this.props.onSelectLocation(value);
        this.setState(() => ({
            text: value,
            suggestions: [],
        }))
    }

    render(){
        const { text } = this.state;
        return (
            <div className="AutoCompleteBox">
                <input value={text} onChange={this.onInputChange}autocomplete="off" className={this.props.className} id={this.props.id} type="text" placeholder={this.props.placeholder}/>
                {this.renderSuggestions()}
            </div>
        )
    }

}