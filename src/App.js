import React from 'react';
import Moment from 'react-moment';
import logo from './logo.svg';
import './App.css';

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
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Etherpad plugin list
          </p>
          <p>
            Search for plugins to install
          </p>

          <input type="text" className="plugin-search-input" onChange={this.handleSearchChange} placeholder="Search..." />
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

class Plugin extends React.Component {

  render() {
    let Author = null;
    if (this.props.value.data.author && this.props.value.data.author.email) {
      Author = <span>Author: <a href={"mailto:" + this.props.value.data.author.email}>{this.props.value.data.author.name}</a></span>
    }

    return (
      <section className="plugin">
        <div className="plugin-headline">
          <span className="plugin-name">{this.props.value.name}</span>
          <span className="plugin-version">{this.props.value.version}</span>
          <span title={<Moment format="DD MM YYYY">{this.props.value.data.time[this.props.value.data['dist-tags'].latest]}</Moment>}>
            <Moment className="plugin-time" fromNow>{this.props.value.data.time[this.props.value.data['dist-tags'].latest]}</Moment>
          </span>
        </div>
        <p>{this.props.value.description}</p>
        <div className="plugin-footer">
          <p className="plugin-author">{Author}</p>
          <p className="plugin-npm-link">
            <a target="_blank" href={"https://www.npmjs.org/package/" + this.props.value.name}>Open on npm</a>
          </p>
          <p className="plugin-keywords">{this.props.value.data.keywords ? this.props.value.data.keywords.map(t => <span className="plugin-keyword">{t}</span>) : ''}</p>
        </div>
      </section>
    );
  }


}

export default App;
