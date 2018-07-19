import { handleActions, createAction } from 'redux-actions';
import { APP_PREFIX } from '../../config';

const VIDEOS = `${APP_PREFIX}/VIDEOS`;
export const VIDEOS_LOAD = `${VIDEOS}/LOAD`;
export const VIDEOS_LOAD_DONE = `${VIDEOS_LOAD}/DONE`;
export const VIDEOS_FAVORITE = `${VIDEOS}/FAVORITE`;
export const VIDEOS_UNDO_FAVORITE = `${VIDEOS}/UNDO_FAVORITE`;

export const loadVideos = createAction(VIDEOS_LOAD);
export const loadVideosDone = createAction(VIDEOS_LOAD_DONE);
export const favoriteVideos = createAction(VIDEOS_FAVORITE);
export const undoFavoriteVideos = createAction(VIDEOS_UNDO_FAVORITE);
export const getVideos = (state, props) => state.videos.videos;
export const getVideosPageInfo = (state, props) => state.videos.pageInfo;
export const getFavoriteVideoIds = (state, props) =>
  state.videos.favoriteVideos;

const defaultState = { videos: [], favoriteVideos: [] };

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
    }),
    [VIDEOS_FAVORITE]: (state, { payload: videoIds }) => ({
      ...state,
      favoriteVideos: [...new Set([...state.favoriteVideos, ...videoIds])]
    }),
    [VIDEOS_UNDO_FAVORITE]: (state, { payload: videoIds }) => ({
      ...state,
      favoriteVideos: state.favoriteVideos.filter(id => !videoIds.includes(id))
    })
  },
  defaultState
);
