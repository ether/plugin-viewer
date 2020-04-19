import React from 'react';
import logo from './logo.svg';
import './App.css';
import Plugin from './Plugin';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      keywords: [],
      searchKeyword: '',
    }

    this.handleSearchChange = this.handleSearchChange.bind(this);
  }

  handleSearchChange(event) {
    this.setState({searchKeyword: event.target.value});
  }

  componentDidMount() {
    this.loadJson();
  }

  loadJson() {
    //fetch('https://static.etherpad.org/plugins.full.json')
    fetch('/plugins.full.json')
      .then(response => response.json())
      .then((result) => {

        let list = Object.values(result);
        let keywordsTmp = [];

        list.forEach(function(plugin, index) {
          if (plugin.data.keywords) {
            plugin.data.keywords.forEach(function(key, index) {
              if (keywordsTmp[key]) {
                keywordsTmp[key]++
              } else {
                keywordsTmp[key] = 1
              }
            })
          }
        })

        let tmp = {};
        for (let key in keywordsTmp) {
          let count = keywordsTmp[key]
          let name = key;
          if (count > 1) {
            tmp[name] = count
          }
        }

        this.setState({
          list: list
        });
      })
      .catch(error => {
        console.log("error", error);
      });
  }

  render() {
    let serachKeywordNormalized = this.state.searchKeyword.toUpperCase();
    let filteredList = this.state.list.filter(function(value, index) {
      if (value.data.keywords) {
        for (let i = 0; i < value.data.keywords.length; i++) {
          let keyword = value.data.keywords[i];
          if (keyword.toUpperCase().indexOf(serachKeywordNormalized) > -1) {
            return true;
          }
        }
      }

      return value.name.toUpperCase().indexOf(serachKeywordNormalized) > -1 ||
        value.description.toUpperCase().indexOf(serachKeywordNormalized) > -1;
    });


    filteredList.sort(function(a, b) {
      return a.data.time[a.data['dist-tags'].latest] < b.data.time[b.data['dist-tags'].latest] ? 1 : -1;
    });

    return (
      <div className="App">
        <header className="App-header">
          <div className="App-logobar">
            <img src={logo} className="App-logo" alt="etherpad logo" />
            <p>
              Etherpad plugin list
            </p>
          </div>
          <div className="App-searchbar">
            <p>
              Search for plugins to install
            </p>
            <input type="text" className="plugin-search-input" onChange={this.handleSearchChange} placeholder="Search..." />
          </div>
        </header>
        <div className="plugin-list">
          <ul>
            {filteredList.map(item => (
              <li>
                <Plugin value={item}/>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default App;
