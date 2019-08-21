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
  to: Date;
  from: Date;
  fatalities: number;
  injuries: number;
  handleChange: Function;
}

class SearchBar extends Component<props> {
  state = {
    minDate: new Date("02/09/1968"),
    maxDate: new Date("12/31/2009"),
    format: "dd MMM yyyy"
  }

  render() {
    const { classes, to, from, handleChange } = this.props;
    return (
      <section className={classes.root}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <DatePicker label="From" format={this.state.format} minDate={this.state.minDate} maxDate={this.state.maxDate} value={from} onChange={handleChange("from")} />
          <DatePicker label="To" format={this.state.format} minDate={this.state.minDate} maxDate={this.state.maxDate} value={to} onChange={handleChange("to")} />
        </MuiPickersUtilsProvider>
        <TextField label="Fatalities" type="number" inputProps={{min: 0}} onChange={handleChange("fatalities")} />
        <TextField label="Injuries" type="number" inputProps={{min: 0}} onChange={handleChange("injuries")} />
        <Button onClick={() => this.props.handleFilter(this.state)}>Filter</Button>
      </section>
    )
  }
}

export default withStyles(styles)(SearchBar)