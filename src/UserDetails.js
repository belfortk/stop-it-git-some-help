import React, { Component } from "react";
import { connect } from "react-redux";
import * as gitActions from './GitActions'

class UserDetails extends Component {

  handleUpdate = e => {
    const { dispatch } = this.props;
    const action = {
      type: `UPDATE_${e.target.id}`,
      payload: e.target.value
    };
    dispatch(action);
  };

  handleClonePlayRepo = () =>{
    gitActions.gitClone(
      this.props.globals.homeDirectory,
      this.props.globals.corsProxy,
      this.props.globals.githubUrl,
      "develop"
    )(this.props.dispatch);
  }
  
  render() {
    return (
      <div className="container user-details-container">
        <input
          className="input level user-detail"
          id="NAME"
          value={this.props.userDetails.name}
          onChange={this.handleUpdate}
          placeholder="name"
        />
        <input
          className="input level user-detail"
          id="EMAIL"
          value={this.props.userDetails.email}
          onChange={this.handleUpdate}
          placeholder="email"
        />
        <input
          className="input level user-detail"
          id="PASSWORD"
          type="password"
          value={this.props.userDetails.githubPassword}
          onChange={this.handleUpdate}
          placeholder="github password (for git push)"
        />
        <p>Click this button to clone the develop branch of a provided dummy repo</p>
        <p>Github link: {this.props.globals.repoUrl}</p>
        <button className="level button is-link is-outlined" onClick={this.handleClonePlayRepo} type="submit">
          Clone play repo
        </button>
      </div>
    );
  }
}

function mapStateToProps(store) {
  return {
    userDetails: store.userDetails,
    globals: store.appState.globals
  };
}

export default connect(mapStateToProps)(UserDetails);
