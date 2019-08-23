import React, { Component } from 'react';
import { withStyles, Theme, createStyles, TextField } from '@material-ui/core';
import { Classes } from 'jss';

const styles = (theme: Theme) => createStyles({
  root: {
    padding: theme.spacing(2),
    width: `calc(100% - ${theme.spacing(4)}px)`
  }
});

interface props {
  classes: Classes;
  handleSearch: Function;
}

class SearchBar extends Component<props> {
  state = {
    search: "Kabul, Afghanistan"
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
        defaultValue={this.state.search}
        fullWidth
        placeholder="Search"
      />
    )
  }
}

export default withStyles(styles)(SearchBar)