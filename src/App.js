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
      downloadMaxCount: 0,
      downloadCount: 0,
      downloadAverageCount: 0,
      sortKey: 'downloads'
    }

    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleSortChangeClick = this.handleSortChangeClick.bind(this);
  }

  handleSearchChange(event) {
    this.setState({searchKeyword: event.target.value});
  }

  handleSortChangeClick(event) {
    this.setState({sortKey: event.target.value});
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
        let downloadMaxCount = 0;
        let downloadCount = 0;

        let regex = /\b(https?:\/\/[\S]+?(?:png|jpe?g|gif))\b/;

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
          downloadCount += plugin.downloads || 0;
          if (plugin.downloads > downloadMaxCount) {
            downloadMaxCount = plugin.downloads;
          }


          if (plugin.data.readme) {
            let results = plugin.data.readme.match(regex);
            if (results) {
              results.forEach(function (item, i) {
                results[i] = item.replace('http://', 'https://');
              })
              list[index].images = results.filter((e, pos) => pos === results.indexOf(e));
            }
          }

          // Use soft-hypen aka &shy;
          list[index].name = plugin.name.replace(/_/g, '_\u00AD');
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
          list: list,
          downloadMaxCount: downloadMaxCount,
          downloadCount: downloadCount,
          downloadAverageCount: downloadCount / list.length,
        });
      })
      .catch(error => {
        console.log("error", error);
      });
  }

  render() {
    let searchKeywordNormalized = this.state.searchKeyword.toUpperCase();
    let filteredList = this.state.list.filter(function(value, index) {
      if (value.data.keywords) {
        for (let i = 0; i < value.data.keywords.length; i++) {
          let keyword = value.data.keywords[i];
          if (keyword.toUpperCase().indexOf(searchKeywordNormalized) > -1) {
            return true;
          }
        }
      }

      return value.name.toUpperCase().indexOf(searchKeywordNormalized) > -1 ||
        value.description.toUpperCase().indexOf(searchKeywordNormalized) > -1;
    });

    let sortKey = this.state.sortKey;

    filteredList.sort(function(a, b) {
      if (sortKey === 'newest') {
        if (a.data.time.created === undefined) {
          return 1;
        } else if (b.data.time.created === undefined) {
          return -1;
        }
        return a.data.time.created < b.data.time.created ? 1 : -1;
      } else {
        return a.downloads < b.downloads ? 1 : -1;
      }
    });

    return (
      <div className="App">
        <header className="App-header">
          <div className="App-logobar">
            <img src={logo} className="App-logo" alt="etherpad logo" />
            <h1>
              Etherpad plugin list
            </h1>
          </div>
          <div>
            {this.state.downloadCount} downloads of {this.state.list.length} plugins in the last month.<br/>
            For more information about Etherpad visit <a href="https://etherpad.org">https://etherpad.org</a>.
          </div>
          <div className="App-searchbar">
            <p>
              Search for plugins to install
            </p>
            <input type="text" className="plugin-search-input" onChange={this.handleSearchChange} placeholder="Search..." />
          </div>
        </header>
        <div className="plugin-list">
          <div className="plugin-list-sort">
            Sort by: <select onChange={this.handleSortChangeClick}>
              <option value="downloads">Downloads</option>
              <option value="newest">Created</option>
            </select>
          </div>
          <h2>
            Plugins
          </h2>
          <ul>
            {filteredList.map(item => (
              <li key={item.name}>
                <Plugin key={'plugin-' + item.name} value={item} downloadAverageCount={this.state.downloadAverageCount} downloadMaxCount={this.state.downloadMaxCount}/>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default App;
