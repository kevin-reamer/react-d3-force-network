import React, { Component } from 'react';
import { withStyles, Theme, createStyles } from '@material-ui/core';
import { Classes } from 'jss';
import * as d3 from "d3";
import * as topojson from "topojson";
import worldmap from "../../assets/50m.json";
import { countryIDs } from "../../data/data";

const styles = (theme: Theme) => createStyles({
  root: {
    display: "flex",
    position: "fixed",
    top: 60,
    right: 200,
    fill: "none",
    pointerEvents: "none"
  },
  text: {
    color: theme.palette.grey[700]
  },
  tooltip: {   
    position: "absolute",           
    textAlign: "center",           
    width: 60,                  
    height: 28,                 
    padding: 2,  
    font: "12px sans-serif",        
    background: "white",  
    border: 0,           
    pointerEvents: "none"         
 }
});

interface props {
  classes: Classes;
  data: any;
}

class D3WorldMap extends Component<props> {
  state = {
    height: 200,
    width: 420,
    margin: {top: 20, right: 20, bottom: 20, left: 20}
  }

  svg: any;
  g: any;
  color: any;
  path: any;

  componentDidMount() {
    this.chart(this.props.data)
  }

  componentWillReceiveProps(nextProps: props) {
    this.g.selectAll("*").remove();
    this.updateData(nextProps.data);
  }

  chart = (data: any) => {
    this.svg
      .attr("width", this.state.width + this.state.margin.left + this.state.margin.right)
      .attr("height", this.state.height + this.state.margin.top + this.state.margin.bottom)
      .style("pointer-events", "none")
      .style("fill", "none")
    
    this.g = this.svg.append("g")
        .attr("transform", "translate(" + this.state.margin.left + "," + this.state.margin.top * 2 + ")")
        .style("pointer-events", "none")
        .style("fill", "none");

    const projection = d3.geoNaturalEarth1()
      .translate([this.state.width / 2, this.state.height / 2])
      .scale(100);
        
    // Define path generator
    this.path = d3.geoPath()
      .projection(projection);

    // Define linear scale for output
    this.color = d3.scaleOrdinal()
			  .range(["#8C867B","#8C4318","#F2F2F2","#261B11"]);

    this.updateData(data)
  }

  updateData = (data: any) => {
    const countriesAttacked = this.getCountries(data);
    const countryPaths: any = topojson.feature(worldmap as any, worldmap.objects.countries as any)
    this.g.selectAll("path")
      .data(countryPaths.features)
      .enter().append("path")
        .attr("d", this.path)
        .style("fill", (d: any) => {
          const countryFromId = countryIDs.find(country => country.id === d.id)
          if (countryFromId !== undefined) {
            if (countriesAttacked.indexOf(countryFromId.country) > -1) {
              return this.color(1)
            }
          }
          return this.color(0)
        });
  }

  getCountries = (data: any) => {
    let countries: any[] = [];
    const cities = data.filter((item: any) => item.type === "City")
    cities.forEach((city: any) => {
      const country = city.id.split(", ")[1]
      if (countries.indexOf(country) === -1) {
        countries.push(country)
      }
    })
    return countries;
  }

  legend = () => {
    const legendRectSize = 10;
    const legendSpacing = 5
    const legend = this.g.selectAll('.legend')
      .data(this.color.domain())
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d: any, i: number) => {
        const width = legendRectSize + legendSpacing + 60;
        const horz = (this.state.width / 2) + (i * width);
        const vert = this.state.height + 55;
        return 'translate(' + horz + ',' + vert + ')';
      });

    legend.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('fill', this.color)
      .style('stroke', this.color);
      
    legend.append('text')
      .attr('x', - legendRectSize + legendSpacing)
      .attr('y', legendRectSize - (legendSpacing / 4))
      .style('fill', "black")
      .style('text-anchor', "end")
      .style('font-size', "12px")
      .text((d: any) => d);
  }

  render() {
    const { classes, data } = this.props
    return (
      <div className={classes.root}>
        {
          data ? 
          <svg height={this.state.height} width={this.state.width} ref={handle => (this.svg = d3.select(handle))}></svg>
          :
          null
        }
      </div>
    )
  }
  
}

export default withStyles(styles)(D3WorldMap);