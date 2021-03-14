import React from 'react';
import logo from './brand.svg';
import './App.css';
import Plugin from './Plugin';
import Moment from 'react-moment';
import momentjs from "moment";
import { Helmet } from 'react-helmet';

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
      sortKey: 'downloads',
      filterOfficial: false,
      lastModified: null
    }

    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleSortChangeClick = this.handleSortChangeClick.bind(this);
    this.handleOfficialFilterClick = this.handleOfficialFilterClick.bind(this);
  }

  handleSearchChange(event) {
    this.setState({searchKeyword: event.target.value});
  }

  handleSortChangeClick(event) {
    this.setState({sortKey: event.target.value});
  }

  handleOfficialFilterClick(event) {
    this.setState({filterOfficial: event.target.checked});
  }

  componentDidMount() {
    this.loadJson();
  }

  loadJson() {
    let lastModified;
    fetch('/plugins.full.json')
      .then(response => {
        lastModified = Date.parse(response.headers.get('last-modified'))
        return response.json()
      })
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
          lastModified: lastModified,
        }, () => {
          let script = document.createElement('script');
          script.type = 'application/ld+json';
          script.innerText = JSON.stringify(this.formatPluginsAsJsonLd())
          document.head.appendChild(script)
        });
      })
      .catch(error => {
        console.log("error", error);
      });
  }

  formatPluginsAsJsonLd() {
    let structure = {
      "@context": "http://schema.org",
      "@type":"Dataset",
      "name": "Etherpad plugins",
      "description": "Etherpad plugin list of all available plugins for etherpad hosted on npm",
      "url": "https://static.etherpad.org/plugins.html",
      "hasPart" : [],
    }

    this.state.list.forEach((plugin) => {
      structure.hasPart.push({
        "@type": "Dataset",
        "name": plugin.name,
        "description": plugin.description.replace(/"/g, '&quot;'),
        "license" : plugin.data.license || "https://creativecommons.org/publicdomain/zero/1.0/",
        "url": 'https://www.npmjs.org/package/' + plugin.name
      })
    })

    return structure;

  }

  render() {
    let filterOfficial = this.state.filterOfficial;
    let searchKeywordNormalized = this.state.searchKeyword.toUpperCase();
    let filteredList = this.state.list.filter(function(value, index) {
      if (filterOfficial && value.official === false) {
        return false;
      }
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
      } else if (sortKey === 'updated') {
        if (a.data.time.modified === undefined) {
          return 1;
        } else if (b.data.time.modified === undefined) {
          return -1;
        }
        return a.data.time.modified < b.data.time.modified ? 1 : -1;
      } else {
        return a.downloads < b.downloads ? 1 : -1;
      }
    });

    return (
      <div className="App">
        <header className="App-header">
          <div className="App-logobar">
            <img src={logo} className="App-logo" alt="Etherpad" />
            <h1>Etherpad plugins</h1>
          </div>
          <div>
            This page lists all available plugins for etherpad hosted on npm.<br/>
            {this.state.list.length > 0 ? <React.Fragment>{this.state.downloadCount} downloads of {this.state.list.length} plugins in the last month.<br/></React.Fragment> : null}
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
          <input type="checkbox" name="filter-official-plugins" onChange={this.handleOfficialFilterClick}/>
          <label htmlFor="filter-official-plugins">Only official plugins</label>
          <div className="plugin-list-sort">
            Sort by: <select onChange={this.handleSortChangeClick}>
              <option value="downloads">Downloads</option>
              <option value="newest">Created</option>
              <option value="updated">Updated</option>
            </select>
          </div>
          <h2>
            Plugins ({filteredList.length})
          </h2>
          <ul>
            {filteredList.map(item => (
              <li key={item.name}>
                <Plugin key={'plugin-' + item.name} value={item} downloadAverageCount={this.state.downloadAverageCount} downloadMaxCount={this.state.downloadMaxCount}/>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <span>This list of npm plugins is filtered by the following criteria:</span>
          <ol>
            <li>"ep_" prefix</li>
            <li>"repository" information set in package.json</li>
            <li>Last updated within last 5 years</li>
          </ol>
        </div>
        {this.state.lastModified !== null
          ? <div>
            Last updated: <Moment interval={0} format="lll">{this.state.lastModified}</Moment> (UTC)
            <Helmet>
              <meta property="article:modified_time" content={momentjs(this.state.lastModified).format()} />
            </Helmet>
          </div>
          : null}
      </div>
    );
  }
}

export default App;
