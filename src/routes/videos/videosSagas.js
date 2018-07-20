import { call, put, takeEvery, all, fork } from 'redux-saga/effects';
import { VIDEOS_LOAD, loadVideosDone } from './videosDuck';
import { search } from '../../utils';

export function* loadVideos(action = { payload: { query: '' } }) {
  try {
    const { query, ...options } = action.payload;
    const response = yield call(search, query, options);
    yield put(loadVideosDone(response));
  } catch (e) {
    yield put(loadVideosDone({ items: [], error: e.message }));
  }
}

export function* watchVideosLoad() {
  yield takeEvery(VIDEOS_LOAD, loadVideos);
}

export default function* root() {
  yield all([fork(loadVideos), fork(watchVideosLoad)]);
}
