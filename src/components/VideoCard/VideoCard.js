import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import ButtonFavorite from '../ButtonFavorite';
import YoutubeVideo from '../YoutubeVideo';
const styles = {
  colorPrimary: { backgroundColor: '#ffe2e2' },
  barColorPrimary: {
    backgroundColor: '#f00'
  }
};
const VideoCard = ({
  video,
  onLoad,
  isLoaded,
  favoriteVideos,
  undoFavoriteVideos,
  favoriteVideoIds,
  responsive,
  classes: { colorPrimary, barColorPrimary }
}) => {
  const videoId = video.id.videoId;
  return (
    <Grid item {...responsive}>
      <Paper
        style={{
          position: 'relative',
          paddingBottom: '56.25%' /* 16:9 */,
          paddingTop: '25px',
          height: 0
        }}
      >
        <YoutubeVideo
          video={video}
          style={{
            opacity: !isLoaded ? 0.3 : 1
          }}
          onLoad={onLoad}
        />
        {!isLoaded ? null : (
          <ButtonFavorite
            style={{
              position: 'absolute',
              top: 0,
              right: '20%'
            }}
            onClick={() => {
              if (!favoriteVideoIds.includes(videoId)) {
                favoriteVideos([videoId]);
              } else {
                undoFavoriteVideos([videoId]);
              }
            }}
            checked={favoriteVideoIds.includes(videoId)}
          />
        )}
        {!isLoaded ? (
          <LinearProgress
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%'
            }}
            classes={{ colorPrimary, barColorPrimary }}
          />
        ) : null}
      </Paper>
    </Grid>
  );
};

VideoCard.propTypes = {
  isLoaded: PropTypes.bool,
  favoriteVideoIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  favoriteVideos: PropTypes.func.isRequired,
  undoFavoriteVideos: PropTypes.func.isRequired,
  video: PropTypes.object.isRequired
};
VideoCard.defaultProps = {
  isLoaded: false
};

export default withStyles(styles)(VideoCard);
