import store from "./index";

export const parseCommit = params => {
  let message = "";
  let buildMessage = false;
  let messageStart = false;
  let messageEnd = false;
  let error = false;
  params.forEach(param => {
    if (!buildMessage && param === "-m" && !messageEnd) {
      buildMessage = true;
    }
    if (buildMessage) {
      if (messageStart) {
        message += param;
        if (
          param[param.length - 1] === messageStart ||
          param[param.length - 1] === messageStart
        ) {
          //in end of message
          buildMessage = false;
          messageEnd = true;
        } else {
          message += " ";
        }
      } else {
        if (param[0] === '"' || param[0] === "'") {
          //message started
          messageStart = param[0];
          message += param;
          if (
            param[param.length - 1] === messageStart ||
            param[param.length - 1] === messageStart
          ) {
            buildMessage = false;
            messageEnd = true;
          } else {
            message += " ";
          }
        }
      }
    }
  });
  if (!messageEnd) {
    error = true;
  }
  return error ? "error" : message;
};

export const translateStatus = (
  arrayOfIsoGitStatuses,
  simpleStatus = false
) => {
  const { appState } = store.getState();
  const ignore = ["ignored", "unmodified"];
  const gitStatuses = [
    "*modified",
    "*deleted",
    "*added",
    "absent",
    "modified",
    "deleted",
    "added",
    "*unmodified",
    "*absent"
  ];
  let isoGitStatus;
  let modified = false;
  const gitFileStatuses = arrayOfIsoGitStatuses.map(file => file.fileStatus);
  gitFileStatuses.forEach(modificationStatus => {
    if (gitStatuses.indexOf(modificationStatus) > -1) {
      modified = true;
    }
  });
  if (!modified) {
    isoGitStatus = "unmodified";
  } else {
    isoGitStatus = "modified";
  }
  if (simpleStatus) {
    return isoGitStatus;
  } else {
    return buildStatusString(isoGitStatus, arrayOfIsoGitStatuses, appState);
  }
};

const buildStatusString = (isoGitStatus, arrayOfIsoGitStatuses, appState) => {
  switch (isoGitStatus) {
    case "unmodified": {
      return `On branch ${appState.gitCurrentBranch}\n
      Your branch is up to date with 'origin/${appState.gitCurrentBranch}'.\n
      nothing to commit, working tree clean\n`;
    }
    case "modified": {
      const hashOfModifiedGitFiles = {
        unstagedModifiedFiles: [],
        unstagedAddedFiles: [],
        unstagedDeletedFiles: [],
        stagedModifiedFiles: [],
        stagedAddedFiles: [],
        stagedDeletedFiles: [],
        ignored: []
      };
      arrayOfIsoGitStatuses.forEach(file => {
        switch (file.fileStatus) {
          case "*modified": {
            hashOfModifiedGitFiles.unstagedModifiedFiles.push(file.fileName);
            break;
          }
          case "*deleted": {
            hashOfModifiedGitFiles.unstagedDeletedFiles.push(file.fileName);
            break;
          }
          case "*added": {
            hashOfModifiedGitFiles.unstagedAddedFiles.push(file.fileName);
            break;
          }
          case "modified": {
            hashOfModifiedGitFiles.stagedModifiedFiles.push(file.fileName);
            break;
          }
          case "deleted": {
            hashOfModifiedGitFiles.stagedDeletedFiles.push(file.fileName);
            break;
          }
          case "added": {
            hashOfModifiedGitFiles.stagedAddedFiles.push(file.fileName);
            break;
          }
          default: {
            break;
          }
        }
      });
      let gitStatusResponseString = `On branch ${appState.gitCurrentBranch}\n`;
      if (hashOfModifiedGitFiles.unstagedAddedFiles.length > 0) {
        gitStatusResponseString += addUnstagedUnTrackedFileMessage(
          gitStatusResponseString
        );
        hashOfModifiedGitFiles.unstagedAddedFiles.forEach(f => {
          gitStatusResponseString += `${f}\n`;
        });
      }
      if (hashOfModifiedGitFiles.unstagedModifiedFiles.length > 0) {
        gitStatusResponseString += addUnstagedModifiedAndDeletedFileMessage(
          gitStatusResponseString
        );
        hashOfModifiedGitFiles.unstagedModifiedFiles.forEach(file => {
          gitStatusResponseString += `modified:    ${file}\n`;
        });
      }
      if (hashOfModifiedGitFiles.unstagedDeletedFiles.length > 0) {
        gitStatusResponseString += addUnstagedModifiedAndDeletedFileMessage(
          gitStatusResponseString
        );
        hashOfModifiedGitFiles.unstagedDeletedFiles.forEach(file => {
          gitStatusResponseString += `deleted:    ${file}\n`;
        });
      }
      if (hashOfModifiedGitFiles.stagedModifiedFiles.length > 0) {
        gitStatusResponseString += addChangesToBeCommittedMessage(
          gitStatusResponseString
        );
        hashOfModifiedGitFiles.stagedModifiedFiles.forEach(file => {
          gitStatusResponseString += `modified:    ${file}\n`;
        });
      }
      if (hashOfModifiedGitFiles.stagedDeletedFiles.length > 0) {
        gitStatusResponseString += addChangesToBeCommittedMessage(
          gitStatusResponseString
        );
        hashOfModifiedGitFiles.stagedDeletedFiles.forEach(file => {
          gitStatusResponseString += `deleted:    ${file}\n`;
        });
      }
      if (hashOfModifiedGitFiles.stagedAddedFiles.length > 0) {
        gitStatusResponseString += addChangesToBeCommittedMessage(
          gitStatusResponseString
        );
        hashOfModifiedGitFiles.stagedAddedFiles.forEach(file => {
          gitStatusResponseString += `new file:    ${file}\n`;
        });
      }
      return gitStatusResponseString;
    }
    default:
      return "We dont understand this git command";
  }
};

const addUnstagedModifiedAndDeletedFileMessage = string => {
  return string.indexOf("Changes not staged for commit:") === -1
    ? `
  Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)\n
  `
    : "";
};

const addUnstagedUnTrackedFileMessage = string => {
  return string.indexOf("Untracked files:") === -1
    ? `
    Untracked files:
    (use "git add <file>..." to include in what will be committed)\n
    `
    : "";
};

const addChangesToBeCommittedMessage = string => {
  return string.indexOf("Changes to be committed:") === -1
    ? `
    Changes to be committed:
    (use "git reset HEAD <file>..." to unstage)\n
    `
    : "";
};

export const getLogMessages = gitLogDataArray => {
  let messageArray = gitLogDataArray.map(gitLogObj =>
    constructGitLogMessage(gitLogObj)
  );
  return messageArray;
};

export const constructGitLogMessage = gitLogObj => {
  const message = `commit ${gitLogObj.commit}\n
                   Author: ${gitLogObj.author.name} <${
    gitLogObj.author.email
  }>\n
                   Date: ${new Date(gitLogObj.author.timestamp * 1000)}\n
                   message: ${gitLogObj.message}`;

  return message;
};

export const filterBranchCommand = params => {
  let branchName = "";
  let branchCommand = "";
  params.forEach(param => {
    if (param === "--list" && !branchCommand) {
      branchCommand = "list";
    } else if ((!branchCommand && param[0] !== "-") || params[0] === "-b") {
      branchCommand = "create";
      branchName = param;
    } else if ((param === "-d" || param === "-D") && !branchCommand) {
      branchCommand = "delete";
    } else if (branchCommand === "delete" && param[0] !== "-") {
      branchName = param;
    } else {
      branchCommand = "error";
    }
  });
  if (!branchCommand) {
    branchCommand = "list";
  }
  return {
    branchName: branchName,
    branchCommand: branchCommand
  };
};

export const filterCheckoutCommand = params => {
  let branchName = "";
  let command = "checkout";
  if (params.length === 1) {
    branchName = params[0];
  } else if (params.length === 2 && params[0] === "-b") {
    branchName = params[1];
    command = "create";
  } else {
    command = "error";
    branchName = params[1];
  }

  return {
    branchName: branchName,
    command: command
  };
};

export const filterCommitted = status => {
  return status === "added" || status === "modified" || status === "deleted";
};

export const checkIfCommitParamsAreValid = (params, files) => {
  let valid = true;
  const validResponseObj = {};
  const indexOfM = params.indexOf("-m");
  if (indexOfM === -1) {
    valid = false;
    validResponseObj.message = "missing -m";
  } else if (indexOfM === params.length - 1) {
    valid = false;
    validResponseObj.message = "no commit message";
  } else {
    const filesParam = params.slice(0, indexOfM);
    let badFiles = filesParam.filter(file => files.indexOf(file) === -1);
    if (badFiles.length > 0) {
      valid = false;
      validResponseObj.message = "files not found";
      return validResponseObj;
    }
    const message = parseCommit(params);
    validResponseObj.message = message;
  }

  validResponseObj.valid = valid;
  return validResponseObj;
};
