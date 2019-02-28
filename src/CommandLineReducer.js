const initialState = {
  command: ""
};

export default function CommandLineReducer(store = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case "UPDATE_COMMAND": {
      return {
        command: payload
      };
    }

    case "CLEAR_COMMAND_LINE": {
      return {
        command: ""
      };
    }
    default: {
      return store;
    }
  }
}
