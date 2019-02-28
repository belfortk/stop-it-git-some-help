const initialState = {
  name: "mark",
  email: "mark@gmail.com",
  githubPassword: 'DUMMY_WORD',
  remoteBranch: '',
  remoteRepoURL: 'github.com/remote/repo'
};

export default function UserDetailsReducer(store = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case "UPDATE_NAME": {
      return {
        ...store,
        name: payload
      };
    }

    case "UPDATE_EMAIL": {
      return {
        ...store,
        email: payload
      };
    }

    case "UPDATE_PASSWORD": {
      return {
        ...store,
        githubPassword: payload
      };
    }

    case "UPDATE_REMOTE_REPO_URL": {
      return {
        ...store,
        remoteRepoURL: payload
      };
    }

    case "UPDATE_REMOTE_BRANCH": {
      return {
        ...store,
        remoteBranch: payload
      };
    }

    default: {
      return store;
    }
  }
}
