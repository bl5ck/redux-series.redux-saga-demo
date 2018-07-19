import { handleActions, createAction } from 'redux-actions';
import { APP_PREFIX } from '../../config';

const VIDEOS = `${APP_PREFIX}/VIDEOS`;
export const VIDEOS_LOAD = `${VIDEOS}/LOAD`;
export const VIDEOS_LOAD_DONE = `${VIDEOS_LOAD}/DONE`;

export const videosLoad = createAction(VIDEOS_LOAD);
export const videosLoadDone = createAction(VIDEOS_LOAD_DONE);
export const getVideos = (state, props) => state.videos.videos;
export const getVideosPageInfo = (state, props) => state.videos.pageInfo;

const defaultState = { videos: [] };

export default handleActions(
  {
    [VIDEOS_LOAD_DONE]: (
      state,
      {
        payload: {
          prevPageToken,
          nextPageToken,
          items,
          pageInfo,
          resultsPerPage,
          error
        }
      }
    ) => ({
      ...state,
      pageInfo: {
        ...pageInfo,
        nextPageToken,
        prevPageToken
      },
      resultsPerPage,
      videos: items
    })
  },
  defaultState
);
