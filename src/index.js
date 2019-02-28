import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux'
import { applyMiddleware, createStore  } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunkMiddleware from 'redux-thunk'

import rootReducer from './reducers'
import './index.css';
import "bulma/css/bulma.css";
import App from './App';

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

const middleware = composeWithDevTools((applyMiddleware(thunkMiddleware)));

const store = createStore(rootReducer, undefined, middleware);

ReactDOM.render(
<Provider store={store}> 
  <App />
</Provider>, document.getElementById('root'));

export default store;