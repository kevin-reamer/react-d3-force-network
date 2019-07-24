import React, { Component } from 'react';
import { withStyles, Theme, createStyles, Button, TextField } from '@material-ui/core';
import { Classes } from 'jss';
import DateFnsUtils from "@date-io/date-fns";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";

const styles = (theme: Theme) => createStyles({
  root: {
    padding: theme.spacing(2)
  }
});

interface props {
  classes: Classes;
  handleFilter: Function;
}

class SearchBar extends Component<props> {
  state = {
    to: new Date(),
    from: new Date(),
    fatalities: 0,
    injuries: 0
  }

  handleDateTo = (date: any) => {
    this.setState({
      to: date
    })
  }

  handleDateFrom = (date: any) => {
    this.setState({
      from: date
    })
  }

  handleChange = (type: string) => (event: any) => {
    this.setState({
      [type]: event.target.value
    })
  }

  render() {
    const { classes } = this.props;
    return (
      <section className={classes.root}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <DatePicker label="From" value={this.state.to} onChange={this.handleDateTo} />
          <DatePicker label="To" value={this.state.from} onChange={this.handleDateFrom} />
        </MuiPickersUtilsProvider>
        <TextField label="Fatalities" type="number" onChange={this.handleChange("fatalities")} />
        <TextField label="Injuries" type="number" onChange={this.handleChange("injuries")} />
        <Button onClick={() => this.props.handleFilter(this.state)}>Filter</Button>
      </section>
    )
  }
}

export default withStyles(styles)(SearchBar)