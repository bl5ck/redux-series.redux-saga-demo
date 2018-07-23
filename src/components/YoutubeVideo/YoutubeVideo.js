import React from 'react';
import PropTypes from 'prop-types';

const YoutubeVideo = ({
  video: {
    id: { videoId },
    snippet: { title }
  },
  style,
  onLoad,
  ...props
}) => (
  <iframe
    title={title}
    src={`https://www.youtube.com/embed/${videoId}`}
    frameBorder="0"
    allow="autoplay; encrypted-media"
    allowFullScreen
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      transition: 'opacity linear .3s',
      ...style
    }}
    onLoad={onLoad}
    {...props}
  />
);
YoutubeVideo.propTypes = {
  video: PropTypes.shape({
    id: PropTypes.shape({
      videoId: PropTypes.string.isRequired
    }).isRequired,
    snippet: PropTypes.shape({
      title: PropTypes.string.isRequired
    }).isRequired
  })
};
export default YoutubeVideo;
