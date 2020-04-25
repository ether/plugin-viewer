import React from "react";
import Moment from "react-moment";
import momentjs from "moment";

class Plugin extends React.Component {
  render() {
    let Author = null;
    if (this.props.value.data.author && this.props.value.data.author.email) {
      Author = <span>Author: <a href={"mailto:" + this.props.value.data.author.email}>{this.props.value.data.author.name}</a></span>
    }

    let downloadPercentage = this.props.value.downloads / this.props.downloadMaxCount * 100;
    let downloadStatsStyle = 'rgb(100, 100, 100) ' + downloadPercentage + '%';
    if (downloadPercentage > 50) {
      downloadStatsStyle = 'rgb(0, 200, 0) ' + downloadPercentage + '%';
    } else if (downloadPercentage > 15) {
      downloadStatsStyle = 'orange ' + downloadPercentage + '%';
    }

    return (
      <section key={this.props.value.name} className="plugin">
        <div className="plugin-headline">
          <span className="plugin-name">
            <a target="_blank" rel="noopener noreferrer" href={"https://www.npmjs.org/package/" + this.props.value.name}>{this.props.value.name}</a>
          </span>
          <span className="plugin-version">{this.props.value.version}</span>
          <span title={momentjs(this.props.value.data.time[this.props.value.data['dist-tags'].latest]).format('lll')}>
            <Moment className="plugin-time" fromNow>{this.props.value.data.time[this.props.value.data['dist-tags'].latest]}</Moment>
          </span>
          <div title={this.props.value.downloads + ' downloads last month'} style={{background: "linear-gradient(to right, " + downloadStatsStyle + ", lightgrey 1%)"}} className="plugin-downloads" />
        </div>
        <p>{this.props.value.description}</p>
        <div className="plugin-footer">
          <span className="plugin-author">{Author}</span>
          <span className="plugin-npm-link">
            <a target="_blank" rel="noopener noreferrer" href={"https://www.npmjs.org/package/" + this.props.value.name}>npm</a>
          </span>
          <p className="plugin-keywords">{this.props.value.data.keywords ? this.props.value.data.keywords.map(t => <span key={this.props.value.name + t} className="plugin-keyword">{t}</span>) : ''}</p>
        </div>
      </section>
    );
  }
}

export default Plugin;