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
    to: new Date("12/31/2009"),
    from: new Date("02/09/1968"),
    minDate: new Date("02/09/1968"),
    maxDate: new Date("12/31/2009"),
    format: "dd MMM yyyy",
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
          <DatePicker label="From" format={this.state.format} minDate={this.state.minDate} maxDate={this.state.maxDate} value={this.state.from} onChange={this.handleDateFrom} />
          <DatePicker label="To" format={this.state.format} minDate={this.state.minDate} maxDate={this.state.maxDate} value={this.state.to} onChange={this.handleDateTo} />
        </MuiPickersUtilsProvider>
        <TextField label="Fatalities" type="number" inputProps={{min: 0}} onChange={this.handleChange("fatalities")} />
        <TextField label="Injuries" type="number" inputProps={{min: 0}} onChange={this.handleChange("injuries")} />
        <Button onClick={() => this.props.handleFilter(this.state)}>Filter</Button>
      </section>
    )
  }
}

export default withStyles(styles)(SearchBar)