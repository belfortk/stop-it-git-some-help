import React, { Component } from "react";
import { connect } from "react-redux";
import "./App.scss";
import FS from "@isomorphic-git/lightning-fs";
import * as git from "isomorphic-git";
import pify from "pify";
import * as parseGit from "./parseGit";
import * as gitActions from "./GitActions";

import CommandLine from "./CommandLine";
import UserDetails from "./UserDetails";
class App extends Component {
  constructor(props) {
    super(props);
    const { dispatch } = this.props;
    dispatch.bind(this);
    //wipe old file system and initialize new one
    window.FS = new FS("userFS", { wipe: true });
    window.git = git;
    window.git.plugins.set("fs", window.FS);
    console.log(git)
    console.log(window.FS)
    window.pfs = pify(window.FS);


    window.pfs.mkdir(this.props.appState.globals.homeDirectory);
    window.pfs.readdir(this.props.appState.globals.homeDirectory)

  }

  executeCommand = command => {
    const commandArray = command.trim().split(" ");
    if (commandArray[0] === "git") {
      if (this.gitParser[`${commandArray[0]} ${commandArray[1]}`]) {
        this.gitParser[`${commandArray[0]} ${commandArray[1]}`](
          commandArray.slice(2)
        );
      } else {
        this.gitParser.default();
      }
    } else if (commandArray[0] === "touch") {
      this.touchParser(commandArray.slice(1));
    } else {
      this.gitParser.default();
    }
  };

  gitParser = {
    "git init": async () => {
      // TODO: get init working
      // gitActions.gitInitAction(this.props.appState.globals.homeDirectory)(
      //   this.props.dispatch
      // );
      this.sendUnsupportedMessage();
    },
    "git status": async fileName => {
      gitActions.gitStatusAction(
        this.props.appState.globals.homeDirectory,
        this.props.appState.files
      )(this.props.dispatch);
    },
    "git log": async () => {
      gitActions.gitLogAction(this.props.appState.globals.homeDirectory)(
        this.props.dispatch
      );
    },
    "git branch": async params => {
      const { branchName, branchCommand } = parseGit.filterBranchCommand(
        params
      );
      switch (branchCommand) {
        case "list":
          gitActions.gitBranchListAction(
            this.props.appState.globals.homeDirectory,
            branchName
          )(this.props.dispatch);
          break;
        case "create":
          gitActions.gitBranchCreate(
            this.props.appState.globals.homeDirectory,
            branchName
          )(this.props.dispatch);
          break;
        case "delete":
          gitActions.gitBranchDelete(
            this.props.appState.globals.homeDirectory,
            branchName
          )(this.props.dispatch);
          break;
        default:
          const updateGitMessageLogAction = {
            type: "UPDATE_WITH_ONE_GIT_RESPONSE_MESSAGE_LOG",
            payload: "There is a error with the branch command"
          };
          this.props.dispatch(updateGitMessageLogAction);
          break;
      }
    },
    "git commit": async params => {
      const updateGitMessageLogAction = {
        type: "UPDATE_WITH_ONE_GIT_RESPONSE_MESSAGE_LOG"
      };
      if (!this.props.userDetails.email || !this.props.userDetails.name) {
        updateGitMessageLogAction.payload =
          "You need a name and email address to commit. This can be fake.";
        this.props.dispatch(updateGitMessageLogAction);
        return;
      }
      const commitMessage = parseGit.parseCommit(params);
      if (commitMessage === "error") {
        updateGitMessageLogAction.payload = "There is a error with the commit";
        this.props.dispatch(updateGitMessageLogAction);
        return;
      }

      try {
        const validity = parseGit.checkIfCommitParamsAreValid(
          params,
          this.props.appState.files
        );

        if (!validity.valid) {
          updateGitMessageLogAction.payload = `There is a error with the commit. ${
            validity.message
          }`;
          this.props.dispatch(updateGitMessageLogAction);
          return;
        }
        if (params[0] === "." || params[0] === "-m") {
          gitActions.gitCommitFilesAction(
            this.props.appState.globals.homeDirectory,
            this.props.appState.files,
            this.props.userDetails,
            commitMessage
          )(this.props.dispatch);
        } else {
          if (validity.valid) {
            gitActions.gitCommitFilesAction(
              this.props.appState.globals.homeDirectory,
              this.props.appState.files,
              this.props.userDetails,
              commitMessage
            )(this.props.dispatch);
          } else {
            this.sendUnsupportedMessage();
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    "git add": async params => {
      if (params[0] === "." && params.length === 1) {
        console.log('in add .')
        gitActions.gitAddFilesAction(
          this.props.appState.globals.homeDirectory,
          this.props.appState.files
        )(this.props.dispatch);
      } else {
        //filter through files names
        let valid = true;
        for (let i = 0; i < params.length; i++) {
          if (params[i].indexOf(".") === -1) {
            valid = false;
            break;
          }
        }
        if (valid) {
          gitActions.gitAddFilesAction(
            this.props.appState.globals.homeDirectory,
            params
          )(this.props.dispatch);
        } else {
          this.sendUnsupportedMessage();
        }
      }
    },
    "git checkout": async params => {
      const checkoutCommand = parseGit.filterCheckoutCommand(params);
      if (checkoutCommand.command === "error") {
        this.sendUnsupportedMessage();
      } else if (checkoutCommand.command === "create") {
        await gitActions.gitBranchCreate(
          this.props.appState.globals.homeDirectory,
          checkoutCommand.branchName
        )(this.props.dispatch);
        gitActions.gitCheckoutAction(
          this.props.appState.globals.homeDirectory,
          checkoutCommand.branchName
        )(this.props.dispatch);
      } else {
        gitActions.gitCheckoutAction(
          this.props.appState.globals.homeDirectory,
          checkoutCommand.branchName
        )(this.props.dispatch);
      }
    },
    "git push": async params => {
      gitActions.gitPushAction(
        this.props.appState.globals.homeDirectory,
        this.props.userDetails,
        this.props.appState.gitCurrentBranch,
        this.props.appState.globals.corsProxy,
        this.props.appState.globals.githubUrl
      )(this.props.dispatch);
    },
    default: error => {
      this.sendUnsupportedMessage();
    }
  };

  touchParser = async params => {
    const fileName = params[0];
    if (params.length > 1) {
      this.sendUnsupportedMessage();
    } else if (fileName.indexOf(".") === -1) {
      const updateGitMessageLogAction = {
        type: "UPDATE_WITH_ONE_GIT_RESPONSE_MESSAGE_LOG",
        payload:
          "Not a valid file name. Please add a file extension. Ex: .txt)."
      };
      this.props.dispatch(updateGitMessageLogAction);
    } else {
      gitActions.touchFileAction(
        this.props.appState.globals.homeDirectory,
        fileName
      )(this.props.dispatch);
    }
  };

  sendUnsupportedMessage = () => {
    const updateGitMessageLogAction = {
      type: "UPDATE_WITH_ONE_GIT_RESPONSE_MESSAGE_LOG",
      payload: "sorry, we dont understand/support that command yet"
    };
    this.props.dispatch(updateGitMessageLogAction);
  };

  render() {
    return (
      <div className="section app-container">
        <div className="container files-container">
          {this.props.appState.files.length === 0
            ? `~/User${this.props.appState.globals.homeDirectory}`
            : "Files:"}
          {this.props.appState.files.map((item, i) => (
            <li className="file" key={i}>
              {this.props.appState.globals.homeDirectory}/{item}
            </li>
          ))}
        </div>

        <UserDetails handleUpdate={this.handleDetailsChange} />

        <div className="container console-container">
          Git Some Help
          <CommandLine execute={this.executeCommand} />
          <div className="git-logs">
            {this.props.appState.gitResponseMesssages.map(item => (
              <p className="message" key={item.id}>
                > {item.text}
              </p>
            ))}
          </div>
        </div>
        <div className="help-container" />
      </div>
    );
  }
}

function mapStateToProps(store) {
  return {
    appState: store.appState,
    userDetails: store.userDetails
  };
}

export default connect(mapStateToProps)(App);
