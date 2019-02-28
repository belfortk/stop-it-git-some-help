const initialState = {
  name: "mark",
  email: "mark@gmail.com",
  githubPassword: 'DUMMY_WORD'
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

    default: {
      return store;
    }
  }
}
