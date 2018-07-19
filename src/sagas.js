import { all } from 'redux-saga/effects';
import { videosSagas } from './routes';

export default function* rootSaga() {
  yield all([videosSagas()]);
}
