import * as parseGit from "./parseGit";
import path from "path-browserify";

export const gitInitAction = directory => async dispatch => {
  try {
    console.log(await window.pfs.readdir(directory))
    await window.git.init({ dir: path.resolve(directory) });
    const newDirectory = await window.pfs.readdir(directory);
    console.log(newDirectory)
    const NewFilesAction = {
      type: 'UPDATE_FILE_DIRECTORY',
      payload: newDirectory
    }
    dispatch(NewFilesAction)
    const updateGitLogAction = {
      type: "UPDATE_WITH_ONE_GIT_RESPONSE_MESSAGE_LOG",
      payload: `Initialized empty Git repository in /Users${directory}/.git`
    };
    dispatch(updateGitLogAction);
  } catch (error) {
    console.log(error);
  }
};

export const gitLogAction = directory => async dispatch => {
  try {
    const gitLogResponse = await window.git.log({ dir: directory, depth: 1 });
    const appLogData = gitLogResponse.map(logObject => {
      return {
        commit: logObject.oid,
        message: logObject.message,
        author: logObject.author
      };
    });
    const gitLogMessages = parseGit.getLogMessages(appLogData);
    const updateGitLogAction = {
      type: "UPDATE_GIT_LOG",
      payload: appLogData
    };
    const updateGitMessageLogAction = {
      type: "UPDATE_WITH_MULTIPLE_GIT_RESPONSE_MESSAGE_LOG",
      payload: gitLogMessages
    };
    // const sub = await gitLogAction.json();
    dispatch(updateGitLogAction);
    dispatch(updateGitMessageLogAction);
  } catch (error) {
    console.log(error);
  }
};

export const gitCloneAction = (
  directory,
  corsProxy,
  githubUrl,
  ref,
  singleBranch
) => async dispatch => {
  try {
    await window.git.clone({
      dir: directory,
      corsProxy: corsProxy,
      url: githubUrl,
      ref: ref,
      singleBranch: singleBranch,
      depth: 3
    });
    const newfileDirectory = await window.pfs.readdir(directory);
    const currentBranch = await window.git.currentBranch({
      dir: directory
    });
    const fileDirectoryAction = {
      type: "UPDATE_FILE_DIRECTORY",
      payload: newfileDirectory
    };
    const updateCurrentDirectoryAction = {
      type: "GET_CURRENT_DIRECTORY",
      payload: currentBranch
    };
    dispatch(fileDirectoryAction);
    dispatch(updateCurrentDirectoryAction);

  } catch (error) {
    console.log(error);
  }
};

export const touchFileAction = (directory, fileName) => async dispatch => {
  const catchTouchErrors = error => {
    return {
      type: "UPDATE_WITH_ONE_GIT_RESPONSE_MESSAGE_LOG",
      payload: `sorry, there was an error while writing your file.`
    };
  };
  try {
    await window.pfs.writeFile(
      path.join(directory, fileName),
      "dummy text",
      "utf8"
    );
    const data = await window.pfs.readdir(directory);
    if (data.indexOf(fileName) !== -1) {
      const updateGitMessageLogAction = {
        type: "UPDATE_WITH_ONE_GIT_RESPONSE_MESSAGE_LOG",
        payload: `File ${fileName} has been created.`
      };
      dispatch(updateGitMessageLogAction);
      const action = {
        type: "UPDATE_FILE_DIRECTORY",
        payload: data
      };
      dispatch(action);
    }
  } catch (error) {
    dispatch(catchTouchErrors(error));
  }
};

export const getFileGitStatus = async (directory, file) => {
  return await window.git.status({
    dir: directory,
    filepath: file
  });
};

export const getAllFileStatuses = async (directory, files) => {
  return await Promise.all(
    files.map(async file => {
      return {
        fileName: file,
        fileStatus: await getFileGitStatus(directory, file)
      };
    })
  );
};

export const gitStatusAction = (directory, files) => async dispatch => {
  try {
    if (files.length === 0) {
      const action = {
        type: "UPDATE_WITH_ONE_GIT_RESPONSE_MESSAGE_LOG",
        payload:
          "fatal: Not a git repository (or any of the parent directories): .git"
      };
      dispatch(action);
      return;
    }
    const fileStatuses = await getAllFileStatuses(directory, files);
    const message = parseGit.translateStatus(fileStatuses);
    const action = {
      type: "UPDATE_WITH_ONE_GIT_RESPONSE_MESSAGE_LOG",
      payload: message
    };
    dispatch(action);
  } catch (err) {
    console.log(err);
  }
};

const gitAddFile = async (directory, file) => {
  return await window.git.add({
    dir: directory,
    filepath: file
  });
};

const gitAddAllFiles = async (directory, files) => {
  return await Promise.all(
    files.map(async file => {
      return {
        fileName: file,
        fileStatus: await gitAddFile(directory, file)
      };
    })
  );
};

export const gitAddFilesAction = (directory, files) => async dispatch => {
  try {
    await gitAddAllFiles(directory, files);
    const fileStatuses = await getAllFileStatuses(directory, files);
    const message = parseGit.translateStatus(fileStatuses);
    const action = {
      type: "UPDATE_WITH_ONE_GIT_RESPONSE_MESSAGE_LOG",
      payload: message
    };
    dispatch(action);
  } catch (err) {
    console.log(err)
  }
};

// apparently this is kind of thing is unsupported...
// const gitCommitFile = async (directory, file, user, commitMessage) => {
//   return await window.git.commit({
//     dir: file,
//     author: user,
//     message: commitMessage
//   });
// };

const gitCommitAllFiles = async (directory, files, user, commitMessage) => {
  return await Promise.all(
    files.map(async file => {
      return {
        fileName: file,
        fileStatus: await window.git.commit({
          dir: directory,
          author: user,
          message: commitMessage
        })
      };
    })
  );
};

export const gitCommitFilesAction = (
  directory,
  files,
  user,
  commitMessage
) => async dispatch => {
  try {
    //determine which files will be commmitted
    const currentFileStatus = await getAllFileStatuses(directory, files);
    const filesToBeCommitted = currentFileStatus.filter(fileObj =>
      parseGit.filterCommitted(fileObj.fileStatus)
    );
    const numFilesChanges = filesToBeCommitted.length;
    let responseString = "";
    filesToBeCommitted.forEach(fileObj => {
      const mode =
        fileObj.fileStatus === "added" ? "created" : fileObj.fileStatus;
      responseString += `${mode}:    ${fileObj.fileName}
      `;
    });
    responseString = `${numFilesChanges} ${
      numFilesChanges > 1 ? "files" : "file"
    } changed
    ${responseString}`;

    await gitCommitAllFiles(directory, filesToBeCommitted, user, commitMessage);
    //if want to error handle =>
    // const fileStatuses = await getAllFileStatuses(directory, files);
    // const message = parseGit.translateStatus(fileStatuses, true);
    // console.log("message", message);
    const action = {
      type: "UPDATE_WITH_ONE_GIT_RESPONSE_MESSAGE_LOG",
      payload: responseString
    };
    dispatch(action);
  } catch (err) {
    console.log(err);
  }
};

export const gitCheckoutAction = (directory, branchName) => async dispatch => {
  try {
    await window.git.checkout({
      dir: directory,
      ref: branchName
    });
    const currentBranch = await window.git.currentBranch({
      dir: directory
    });
    const updateCurrentDirectoryAction = {
      type: "GET_CURRENT_DIRECTORY",
      payload: currentBranch
    };
    dispatch(updateCurrentDirectoryAction);
    const updateGitMessageLogAction = {
      type: "UPDATE_WITH_ONE_GIT_RESPONSE_MESSAGE_LOG",
      payload: `Switched to branch '${currentBranch}'`
    };
    dispatch(updateGitMessageLogAction);
  } catch (err) {
    console.log(err);
    const updateGitMessageLogAction = {
      type: "UPDATE_WITH_ONE_GIT_RESPONSE_MESSAGE_LOG",
      payload: `error: pathspec ${branchName} did not match any file(s) known to git.`
    };
    dispatch(updateGitMessageLogAction);
  }
};

export const gitBranchListAction = (directory, branch) => async dispatch => {
  try {
    const data = await window.git.listBranches({
      dir: directory
    });
    const currentBranch = await window.git.currentBranch({
      dir: directory
    });
    data[data.indexOf(currentBranch)] = `*${currentBranch}`;
    const branchesWithNewLine = data.map(branch => `${branch}\n`);
    const message = branchesWithNewLine;
    const updateGitMessageLogList = {
      type: "UPDATE_WITH_ONE_GIT_RESPONSE_MESSAGE_LOG",
      payload: message
    };
    dispatch(updateGitMessageLogList);
  } catch (err) {}
};

export const gitBranchCreate = (directory, branch) => async dispatch => {
  try {
    await window.git.branch({ dir: directory, ref: branch });
    const createAction = {
      type: "UPDATE_WITH_ONE_GIT_RESPONSE_MESSAGE_LOG",
      payload: `branch ${branch} has been created. Type git branch to see all branches.`
    };
    dispatch(createAction);
  } catch (err) {}
};

export const gitBranchDelete = (directory, branch) => async dispatch => {
  try {
    await window.git.deleteBranch({
      dir: directory,
      ref: branch
    });
    const deleteAction = {
      type: "UPDATE_WITH_ONE_GIT_RESPONSE_MESSAGE_LOG",
      payload: `branch ${branch} has been deleted. Type git branch to see all branches.`
    };
    dispatch(deleteAction);
  } catch (err) {
    console.log(err);
  }
};

export const gitPushAction = (
  directory,
  user,
  branch,
  corsProxy,
  remote
) => async dispatch => {
  console.log(directory, corsProxy, remote);
  try {
    const pushResponse = await window.git.push({
      dir: directory,
      remote: "origin",
      ref: branch,
      corsProxy: corsProxy,
      username: user.email,
      password: user.githubPassword
    });
    console.log(pushResponse);
    const pushAction = {
      type: "UPDATE_WITH_ONE_GIT_RESPONSE_MESSAGE_LOG",
      payload: `successful push to origin/${branch} @ ${remote}`
    };
    dispatch(pushAction);
  } catch (err) {
    console.log(err);
  }
};
