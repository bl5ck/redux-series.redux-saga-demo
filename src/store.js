import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { videosReducer as videos } from './routes';
import rootSaga from './sagas';

let composeEnhancers = compose;
if (process.env.NODE_ENV !== 'production') {
  if (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  }
}
const sagaMiddleware = createSagaMiddleware();

// create the saga middleware
const middlewares = [sagaMiddleware];

const store = createStore(
  combineReducers({
    videos
  }),
  composeEnhancers(applyMiddleware(...middlewares))
);

sagaMiddleware.run(rootSaga);

export default store;
