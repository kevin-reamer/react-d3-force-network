import React, { Component, SyntheticEvent } from 'react';
import { withStyles, Theme, createStyles, TextField } from '@material-ui/core';
import { Classes } from 'jss';

const styles = (theme: Theme) => createStyles({
  root: {
    padding: theme.spacing(2)
  }
});

interface props {
  classes: Classes;
  handleSearch: Function;
}

class SearchBar extends Component<props> {
  state = {
    search: ""
  }

  handleSearchChange = (event: any) => {
    this.setState({
      search: event.target.value
    })
  }

  handleSearchKeyPress = (event: any) => {
    if (event.key === 'Enter') {
      this.props.handleSearch(this.state.search)
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <TextField
        className={classes.root}
        onChange={this.handleSearchChange}
        onKeyPress={this.handleSearchKeyPress}
        fullWidth
        placeholder="Search"
      />
    )
  }
}

export default withStyles(styles)(SearchBar)