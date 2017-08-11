// @flow weak

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, createStyleSheet } from 'material-ui/styles';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Avatar from 'material-ui/Avatar';
import AccountCircleIcon from 'material-ui-icons/AccountCircle';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

const styleSheet = createStyleSheet(theme => ({
  paper: theme.mixins.gutters({
    paddingTop: 16,
    paddingBottom: 16,
  }),
  root: {
    width: '100%',
    background: theme.palette.background.paper,
  },
  title: {
    flex: '0 0 auto',
  },
}));

function FolderList(props) {
  const classes = props.classes;
  return (
    <Paper className={classes.paper} elevation={4}>
      <div className={classes.title}>
        <Typography type="title">{"Recent Activities"}</Typography>
      </div>
      <div className={classes.root}>
        <List>
          <ListItem dense button>
            <Avatar>
              <AccountCircleIcon />
            </Avatar>
            <ListItemText primary="Ben Gao - bengao committed changeset d73c6137414c156333154e3fae13b8c108c24b90 saying:FLEAT-3043 tax invoice to AWS S3 " secondary="Jan 9, 2016" />
          </ListItem>
          <Divider />
          <ListItem dense button>
            <Avatar>
              <AccountCircleIcon />
            </Avatar>
            <ListItemText primary="Work" secondary="Jan 7, 2016" />
          </ListItem>
        </List>
      </div>
    </Paper>
  );
}

FolderList.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styleSheet)(FolderList);
