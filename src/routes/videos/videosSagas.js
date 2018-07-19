import { call, put, takeEvery, all, fork } from 'redux-saga/effects';
import { VIDEOS_LOAD, videosLoadDone } from './videosDuck';
import { search } from '../../utils';

export function* videosLoad(action) {
  try {
    const { query, ...options } = action.payload;
    const response = yield call(search, query, options);
    yield put(videosLoadDone(response));
  } catch (e) {
    yield put(videosLoadDone({ items: [], error: e.message }));
  }
}

export function* watchVideosLoad() {
  yield takeEvery(VIDEOS_LOAD, videosLoad);
}

export default function* root() {
  yield all([fork(videosLoad), fork(watchVideosLoad)]);
}
