const initialState = {
  command: "git init",
  text: "$ git init",
  caretOffset: 132,
  caretColor: true
};

export default function CommandLineReducer(store = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case "ENTER_COMMAND": {
      return {
        ...store,
        command: payload
      };
    }

    case "UPDATE_COMMAND": {
      return {
        ...store,
        text: payload.text,
        caretOffset: payload.offset,
        command: payload.command
      };
    }

    case "UPDATE_CARET_COLOR": {
      return {
        ...store,
        caretColor: payload
      }
    }

    default: {
      return store;
    }
  }
}
