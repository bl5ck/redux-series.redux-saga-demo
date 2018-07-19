import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
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
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import { debounce } from '../../utils';
import { videosLoad, getVideos, getVideosPageInfo } from './videosDuck';

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

const actionsStyles = theme => ({
  root: {
    flexShrink: 0,
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing.unit * 2.5
  }
});

class PaginationActions extends React.Component {
  handleFirstPageButtonClick = event => {
    this.props.onChangePage(event, 0);
  };

  handleBackButtonClick = event => {
    this.props.onChangePage(event, this.props.page - 1);
  };

  handleNextButtonClick = event => {
    this.props.onChangePage(event, this.props.page + 1);
  };

  handleLastPageButtonClick = event => {
    this.props.onChangePage(
      event,
      Math.max(0, Math.ceil(this.props.count / this.props.rowsPerPage) - 1)
    );
  };

  render() {
    const {
      classes,
      count,
      page,
      rowsPerPage,
      theme,
      hasFirstNavigation,
      hasLastNavigation
    } = this.props;

    return (
      <div className={classes.root}>
        {!hasFirstNavigation ? null : (
          <IconButton
            onClick={this.handleFirstPageButtonClick}
            disabled={page === 0}
            aria-label="First Page"
          >
            {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
          </IconButton>
        )}
        <IconButton
          onClick={this.handleBackButtonClick}
          disabled={page === 0}
          aria-label="Previous Page"
        >
          {theme.direction === 'rtl' ? (
            <KeyboardArrowRight />
          ) : (
            <KeyboardArrowLeft />
          )}
        </IconButton>
        <IconButton
          onClick={this.handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="Next Page"
        >
          {theme.direction === 'rtl' ? (
            <KeyboardArrowLeft />
          ) : (
            <KeyboardArrowRight />
          )}
        </IconButton>
        {!hasLastNavigation ? null : (
          <IconButton
            onClick={this.handleLastPageButtonClick}
            disabled={page >= Math.ceil(count / rowsPerPage) - 1}
            aria-label="Last Page"
          >
            {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
          </IconButton>
        )}
      </div>
    );
  }
}

PaginationActions.propTypes = {
  classes: PropTypes.object.isRequired,
  count: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  theme: PropTypes.object.isRequired,
  hasFirstNavigation: PropTypes.bool,
  hasLastNavigation: PropTypes.bool
};

PaginationActions.defaultProps = {
  hasFirstNavigation: true,
  hasLastNavigation: true
};
const PaginationActionsWrapped = withStyles(actionsStyles, {
  withTheme: true
})(PaginationActions);

class Videos extends React.Component {
  static defaultProps: {
    videos: []
  };
  state = {
    query: '',
    resultsPerPage: 9,
    page: 0
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
      console.log(resultsPerPage, resultsPerPageOptions);
      this.state = { query, page, resultsPerPage, resultsPerPageOptions };
    } else {
      const resultsPerPageOptions = this.getResultsPerPageOptions(
        this.state.resultsPerPage
      );
      this.state.resultsPerPageOptions = resultsPerPageOptions;
    }
  }
  componentWillMount() {
    this.search();
  }
  getResultsPerPageOptions = resultsPerPage =>
    new Array(3).fill(0).map((item, index) => (index + 1) * resultsPerPage);
  search = pageToken => {
    const { videosLoad } = this.props;
    videosLoad({
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
    const { videos, classes, pageInfo } = this.props;
    return (
      <div className={classes.root}>
        <Input
          value={this.state.password}
          onChange={e => {
            e.persist();
            debounce(() => this.handleChange('query')(e), 500);
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
                onClick={this.search}
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
            : videos.map(({ id: { videoId }, snippet: { title } }) => (
                <Grid item xs={12} sm={6} md={4} key={videoId}>
                  <Paper
                    style={{
                      position: 'relative',
                      paddingBottom: '56.25%' /* 16:9 */,
                      paddingTop: '25px',
                      height: 0
                    }}
                  >
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
                        height: '100%'
                      }}
                    />
                  </Paper>
                </Grid>
              ))}
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
                    ActionsComponent={PaginationActionsWrapped}
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
    pageInfo: getVideosPageInfo(state, props)
  }),
  {
    videosLoad
  }
)(withStyles(styles)(Videos));
