import React, { Component } from "react";
import { connect } from "react-redux";

class CommandLine extends Component {
  // constructor(props) {
  //   super(props);
  // }

  handleSubmit = e => {
    e.preventDefault();
    this.props.execute(this.props.store.command);
    this.props.dispatch({
      type: 'CLEAR_COMMAND_LINE',
    })
  };
  
  handleChange = e => {
    const { dispatch } = this.props;
    const action = {
      type: "UPDATE_COMMAND",
      payload: e.target.value
    };
    dispatch(action);
  };

  render() {
    return (
      <form className="level" onSubmit={this.handleSubmit}>
        <input
          className="level-left input git-command-input"
          placeholder="Try a git command (git status)..."
          type="text"
          value={this.props.store.command}
          onChange={this.handleChange}
        />
        <button className="level-right button is-success" type="submit">
          Run
        </button>
      </form>
    );
  }
}

function mapStateToProps(store) {
  return {
    store: store.commandLine
  };
}

export default connect(mapStateToProps)(CommandLine);
