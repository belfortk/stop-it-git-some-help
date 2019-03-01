import React, { Component } from "react";
import { connect } from "react-redux";
const WebFont = require('webfontloader');

export class CommandLine extends Component {
  constructor() {
    super();
  }

  componentDidMount = () => {
    this.canvas = this.refs.canvas;
    this.canvas.focus();
    this.ctx = this.canvas.getContext("2d");
    window.setInterval(() => {
      let caret = true;
      if (this.canvas === document.activeElement && document.hasFocus()) {
        caret = !this.props.store.caretColor;
      }
      const { dispatch } = this.props;
      const action = {
        type: "UPDATE_CARET_COLOR",
        payload: caret
      };
      dispatch(action);
    }, 500)
    WebFont.load({
      google: {
        families: ['IBM Plex Mono']
      },
      active: this.draw
    });
  }

  componentDidUpdate() {
    this.draw();
  }

  draw = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.beginPath();
    this.ctx.fillStyle = '#23D160';
    this.ctx.font = `20px "IBM Plex Mono"`;
    this.ctx.fillText(this.props.store.text, 10, 30);
    if (this.props.store.caretColor) {
      this.ctx.rect(this.props.store.caretOffset, 10, 15, 25);
      this.ctx.fill();
    } else {
      this.ctx.clearRect(this.props.store.caretOffset, 10, 15, 25);
    }
  }

  handleKeyDown = e => {
    let newText = '';
    let newCommand = '';
    if (e.key.toLowerCase() === "backspace") {
      newText = this.props.store.text.slice(0, -1);
      newCommand = this.props.store.command.slice(0, -1);
      if (newText === '$') {
        newText = '$ ';
        newCommand = '';
      }
    } else if (e.key.toLowerCase() === "enter") {
      this.props.execute(this.props.store.command);
      newText = '$ ';
      newCommand = '';
      const offset = this.ctx.measureText(`${newText}`).width;
      const { dispatch } = this.props;
      const action = {
        type: "ENTER_COMMAND",
        payload: {text: newText, offset: offset, command: newCommand} 
      };
      dispatch(action);
    }
    if (newText !== '') {
      const offset = this.ctx.measureText(`${newText} `).width;
      const { dispatch } = this.props;
      const action = {
        type: "UPDATE_COMMAND",
        payload: {text: newText, offset: offset, command: newCommand} 
      };
      dispatch(action);
    }
  }

  handleKeyPress = e => {
    let newText = '';
    let newCommand = '';
    if (e.key.toLowerCase() !== "enter") {
      newText = `${this.props.store.text}${e.key}`;
      newCommand = `${this.props.store.command}${e.key}`;
    }
    if (newText !== '') {
      const offset = this.ctx.measureText(`${newText} `).width;
      const { dispatch } = this.props;
      const action = {
        type: "UPDATE_COMMAND",
        payload: {text: newText, offset: offset, command: newCommand} 
      };
      dispatch(action);
    }
  }

  render() {
    return(<canvas className="command-canvas" ref="canvas" tabIndex="0" onKeyDown={this.handleKeyDown} onKeyPress={this.handleKeyPress} width={1344} height={50}/>);
  }
}

function mapStateToProps(store) {
  return {
    store: store.commandLine,
  };
}

export default connect(mapStateToProps)(CommandLine);
