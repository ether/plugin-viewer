import React from "react";
import Moment from "react-moment";
import momentjs from "moment";
import logo from './logo.svg';

class Plugin extends React.Component {
  render() {
    let Author = null;
    if (this.props.value.author && this.props.value.author.email) {
      Author = <span>Author: <a href={"mailto:" + this.props.value.author.email}>{this.props.value.author.name}</a></span>
    }

    let npmLink = 'https://www.npmjs.org/package/' + this.props.value.name;

    // Use soft-hypen aka &shy;
    let pluginNameShy = this.props.value.name.replace(/_/g, '_\u00AD');


    let downloadPercentage;
    if (this.props.value.downloads < this.props.downloadAverageCount) {
      downloadPercentage = this.props.value.downloads / this.props.downloadAverageCount * 50;
    } else {
      downloadPercentage = 50 + (this.props.value.downloads / this.props.downloadMaxCount * 50);
    }

    let downloadStatsStyle = 'rgb(100, 100, 100) ' + downloadPercentage + '%';
    if (downloadPercentage > 50) {
      downloadStatsStyle = 'rgb(0, 200, 0) ' + downloadPercentage + '%';
    } else if (downloadPercentage > 15) {
      downloadStatsStyle = 'orange ' + downloadPercentage + '%';
    }

    return (
      <section className="plugin">
        <div className="plugin-headline">
          <span className="plugin-name">
            {this.props.value.official === true ? <img src={logo} className="App-official-icon" alt="official etherpad plugin" title="official etherpad plugin"/> : null}
            <a target="_blank" rel="noopener noreferrer" href={npmLink}>{pluginNameShy}</a>
          </span>
          <span className="plugin-version">{this.props.value.version}</span>
          <span title={momentjs(this.props.value.modified).format('lll')}>
            <Moment key={this.props.value.name + '-moment'} className="plugin-time" fromNow>{this.props.value.modified}</Moment>
          </span>
          <div title={this.props.value.downloads + ' downloads last month'} style={{background: "linear-gradient(to right, " + downloadStatsStyle + ", lightgrey 1%)"}} className="plugin-downloads" />
        </div>
        <p>{this.props.value.description}</p>
        <div>
          {
            this.props.value.images ?
              this.props.value.images.map(function(image) {
                return (<Screenshot key={image} src={image}/>);
              }) : ''
          }
        </div>
        <div className="plugin-footer">
          <span className="plugin-author">{Author}</span>
          <span className="plugin-npm-link">
            <a target="_blank" rel="noopener noreferrer" href={npmLink}>npm</a>
          </span>
          <span>License: {this.props.value.license || '-'}</span>
          <p className="plugin-keywords">{this.props.value.keywords ? this.props.value.keywords.map(t => <span key={this.props.value.name + t} className="plugin-keyword">{t}</span>) : ''}</p>
        </div>
      </section>
    );
  }
}

function Screenshot({ src }) {
  return (
    <div style={{ margin: "0.25rem" }}>
      <img
        style={{ maxWidth: "200px", height: "auto" }}
        src={src}
        alt=""
      />
    </div>
  );
}

export default Plugin;