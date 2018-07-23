import React from 'react';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Search from '@material-ui/icons/Search';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import PropTypes from 'prop-types';
import { debounce } from '../../utils';
import {
  loadVideos,
  favoriteVideos,
  undoFavoriteVideos,
  getVideos,
  getVideosPageInfo,
  getFavoriteVideoIds
} from './videosDuck';
import PaginationActions from '../../components/PaginationActions';
import VideoCard from '../../components/VideoCard';

const styles = {
  root: {
    flexGrow: 1,
    padding: 10
  },
  searchInput: {
    padding: '0 10px',
    textAlign: 'center'
  },
  pagination: {
    textAlign: 'right'
  }
};

class Videos extends React.Component {
  static defaultProps: {
    videos: [],
    pageInfo: null
  };
  static propTypes = {
    classes: PropTypes.object.isRequired,
    favoriteVideoIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    favoriteVideos: PropTypes.func.isRequired,
    loadVideos: PropTypes.func.isRequired,
    pageInfo: PropTypes.shape({
      nextPageToken: PropTypes.string,
      prevPageToken: PropTypes.string
    }),
    videos: PropTypes.array,
    undoFavoriteVideos: PropTypes.func.isRequired
  };
  state = {
    query: '',
    resultsPerPage: 9,
    page: 0,
    loaded: {}
  };
  constructor(props) {
    super(props);
    if (window.location.search) {
      const {
        q: query = this.state.query,
        p: page = this.state.page,
        c: resultsPerPage = this.state.resultsPerPage
      } = window.location.search
        .substr(1)
        .split('&')
        .reduce((obj, param) => {
          const [name, value] = param.split('=');
          return {
            ...obj,
            [name]: value
          };
        }, {});
      const resultsPerPageOptions = this.getResultsPerPageOptions(
        resultsPerPage
      );
      this.state = { query, page, resultsPerPage, resultsPerPageOptions };
    } else {
      const resultsPerPageOptions = this.getResultsPerPageOptions(
        this.state.resultsPerPage
      );
      this.state.resultsPerPageOptions = resultsPerPageOptions;
    }
  }
  getResultsPerPageOptions = resultsPerPage =>
    new Array(3).fill(0).map((item, index) => (index + 1) * resultsPerPage);
  search = pageToken => {
    const { loadVideos } = this.props;
    loadVideos({
      query: this.state.query,
      maxResults: this.state.resultsPerPage,
      pageToken
    });
  };
  handleChangePage = (e, page) => {
    const { pageInfo } = this.props;
    if (!pageInfo || page === this.state.page) {
      return;
    }
    const pageToken =
      this.state.page < page ? pageInfo.nextPageToken : pageInfo.prevPageToken;
    this.search(pageToken);
    this.setState({
      page
    });
  };
  handleChangeRowsPerPage = (e, resultsPerPage) => {
    this.setState({
      resultsPerPage
    });
  };
  handleChange(input) {
    return e => this.setState({ [input]: e.target.value });
  }
  render() {
    const {
      videos,
      classes,
      pageInfo,
      favoriteVideoIds,
      favoriteVideos,
      undoFavoriteVideos
    } = this.props;
    return (
      <div className={classes.root}>
        <Input
          value={this.state.password}
          onChange={e => {
            e.persist();
            debounce(() => {
              this.handleChange('query')(e);
            }, 500)();
          }}
          style={{
            marginBottom: 20
          }}
          onKeyUp={e => {
            if (e.key !== 'Enter') {
              return;
            }
            this.search();
          }}
          classes={{ input: classes.searchInput }}
          fullWidth={true}
          placeholder="Find youtube videos related to..."
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="Toggle password visibility"
                onClick={() => this.search()}
              >
                <Search />
              </IconButton>
            </InputAdornment>
          }
          defaultValue={this.state.query}
        />
        {!pageInfo ? null : (
          <Typography className={classes.title} color="textSecondary">
            Displayed <strong>{pageInfo.resultsPerPage || 0}</strong>
            &nbsp;in <strong>
              {pageInfo.totalResults || 0}
            </strong> video{pageInfo.totalResults !== 1 ? 's' : ''} found.
          </Typography>
        )}
        <Grid container spacing={8}>
          {!videos
            ? null
            : videos.map(video => {
                if (!video || !video.id || !video.id.videoId) {
                  return null;
                }
                const videoId = video.id.videoId;
                return (
                  <VideoCard
                    favoriteVideoIds={favoriteVideoIds}
                    favoriteVideos={favoriteVideos}
                    isLoaded={this.state.loaded[videoId]}
                    key={videoId}
                    onLoad={() => {
                      this.setState({
                        loaded: {
                          ...this.state.loaded,
                          [videoId]: true
                        }
                      });
                    }}
                    responsive={{ xs: 12, sm: 6, md: 4 }}
                    undoFavoriteVideos={undoFavoriteVideos}
                    video={video}
                  />
                );
              })}
        </Grid>
        {!pageInfo || !pageInfo.totalResults ? null : (
          <div className={classes.pagination}>
            <Table>
              <TableBody>
                <TableRow>
                  <TablePagination
                    count={pageInfo.totalResults}
                    rowsPerPage={pageInfo.resultsPerPage}
                    rowsPerPageOptions={this.state.resultsPerPageOptions}
                    page={this.state.page}
                    onChangePage={this.handleChangePage}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    ActionsComponent={PaginationActions}
                  />
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    );
  }
}

export default connect(
  (state, props) => ({
    videos: getVideos(state, props),
    favoriteVideoIds: getFavoriteVideoIds(state, props),
    pageInfo: getVideosPageInfo(state, props)
  }),
  {
    loadVideos,
    favoriteVideos,
    undoFavoriteVideos
  }
)(withStyles(styles)(Videos));
