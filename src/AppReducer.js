const initialState = {
  files: [],
  gitResponseMesssages: [],
  gitCurrentBranch: "",
  gitLog: [],
  messageCount: 0,
  globals: {
    homeDirectory: "/dev",
    corsProxy: "https://cors.isomorphic-git.org",
    githubUrl: "https://github.com/StopItGitSomeHelp/githelpstarter.git",
    repoUrl: 'https://github.com/StopItGitSomeHelp/githelpstarter',
    commandClick: false
  }
};

export default function AppReducer(store = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case "UPDATE_FILE_DIRECTORY": {
      return {
        ...store,
        files: payload
      };
    }

    case "UPDATE_GIT_LOG": {
      return {
        ...store,
        gitLog: payload
      };
    }

    case "GET_CURRENT_DIRECTORY": {
      return {
        ...store,
        gitCurrentBranch: payload
      };
    }

    case "UPDATE_WITH_ONE_GIT_RESPONSE_MESSAGE_LOG": {
      const message = {
        id: store.messageCount,
        text: payload
      };
      return {
        ...store,
        gitResponseMesssages: [message, ...store.gitResponseMesssages],
        store: store.messageCount++
      };
    }

    case "UPDATE_WITH_MULTIPLE_GIT_RESPONSE_MESSAGE_LOG": {
      const messagePayload = payload.map(message => {
        const messageObject = {
          id: store.messageCount,
          text: message
        };
        store.messageCount++; //TODO: not great because this introduces a side-effect. Try to think of better way.
        return messageObject;
      });
      return {
        ...store,
        gitResponseMesssages: [...messagePayload, ...store.gitResponseMesssages]
      };
    }

    default: {
      return store;
    }
  }
}
