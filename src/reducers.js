import { combineReducers } from 'redux';
import CommandLineReducer from './CommandLineReducer'
import UserDetailsReducer from './UserDetailsReducer'
import AppReducer from './AppReducer'

const rootReducer =  combineReducers({
    commandLine: CommandLineReducer,
    userDetails: UserDetailsReducer,
    appState: AppReducer
});

export default rootReducer;