import React, { Component } from 'react';
import { withStyles, Theme, createStyles } from '@material-ui/core';
import { Classes } from 'jss';
import * as d3 from "d3";

const styles = (theme: Theme) => createStyles({
  root: {
    display: "flex"
  },
  text: {
    color: theme.palette.grey[700]
  }
});

interface props {
  classes: Classes;
  data: any;
  additions: any;
  subtractions: any;
  handleDoubleClick: Function;
}

class D3ForceNetwork extends Component<props> {
  state = {
    height: window.innerHeight - 144,
    width: window.innerWidth
  }

  simulation: any;
  svg: any;
  g: any;
  nodes: any;
  links: any;
  linkForce: any;
  linkGroup: any;
  nodeGroup: any;
  textGroup: any;
  linkElements: any;
  nodeElements: any;
  textElements: any;

  scale = d3.scaleOrdinal()
    .range(["#F2C029","#F2780C","#BF3A0A","#757170","#98A1A6","#BEBDBF","#646E8C","#5D75A6","#BF8494","#734838","#A68780","#7D8C79"]);

  componentDidMount() {
    this.chart(this.props.data)
  }

  componentWillReceiveProps(nextProps: props) {
    this.updateData(nextProps.additions, nextProps.subtractions)
  }

  componentWillUnmount() {
    if (this.simulation) {
      this.simulation.stop()
    }
  }

  chart = (data: any) => {
    this.links = data.links.map((link: any) => Object.create(link));
    this.nodes = data.nodes.map((node: any) => Object.create(node));

    this.linkForce = d3
      .forceLink()
      .id((link: any) => link.id)
      .strength((link: any) => link.type === "perpetrator" ? 1 : 0.5)

    this.simulation = d3
      .forceSimulation()
      .force('link', this.linkForce)
      .force('charge', d3.forceManyBody().strength(-40))
      .force('center', d3.forceCenter(this.state.width / 2, this.state.height / 2))
    
    const zoomed = () => {
      this.g.attr("transform", d3.event.transform);
    };

    this.svg
      .attr("viewBox", [0, 0, this.state.width, this.state.height])

    this.svg.append("rect")
      .attr("width", this.state.width)
      .attr("height", this.state.height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .call(d3.zoom()
        .scaleExtent([1 / 4, 4])
        .on("zoom", zoomed)); 

    this.g = this.svg.append("g");

    this.linkGroup = this.g.append('g').attr('class', 'links');
    this.nodeGroup = this.g.append('g').attr('class', 'nodes');
    this.textGroup = this.g.append('g').attr('class', 'text');

    this.updateSimulation();

    return this.svg.node();
  }

  fade = (opacity: number) => {
    return (node: any) => {
      this.nodeElements.style('stroke-opacity', (o: any) => {
        const thisOpacity = (this.getNeighbors(node.id, this.links) && o.selected) ? 1 : (this.getNeighbors(node.id, this.links) || o.selected) ? 0.5 : opacity;
        return thisOpacity;
      });

      this.linkElements.style('stroke-opacity', (o: any) => {
        return (o.source === node || o.target === node) && (o.source.selected && o.target.selected) ? 1 : (o.source === node || o.target === node) || (o.source.selected && o.target.selected) ? 0.5 : opacity
      });

    };
  }

  selectNode = (selectedNode: any) => {
    let neighbors: any[] = []
    if (isNaN(selectedNode.id)) {
      neighbors = this.getNeighborsOfNeighbors(this.getNeighbors(selectedNode.id, this.links), this.links);
    }
    else {
      neighbors = this.getNeighbors(selectedNode.id, this.links);
    }
    this.nodeElements.attr('fill-opacity', (node: any) => this.getOpacity(node, neighbors))
    this.textElements.attr('fill-opacity', (node: any) => this.getOpacity(node, neighbors))
    this.linkElements.attr('stroke-opacity', (link: any) => this.getLinkOpacity(selectedNode, link))
  }

  getOpacity = (node: any, neighbors: Array<any>) => {
    if (neighbors.indexOf(node.id) >= 0) {
      return 1
    }
    return 0.25
  }

  getLinkOpacity = (node: any, link: any) => {
    return this.isNeighborLink(node, link) ? 1 : 0.25
  }

  color = (type: string) => {
    switch(type) {
      case "perpetrator": return '#D97D0D';
      case "target city": return '#8596A6';
    }
  }

  updateData = (addData: any, removeData: any) => {
    addData.nodes.forEach((node: any) => this.nodes.push(node))
    addData.links.forEach((link: any) => this.links.push(link))
    removeData.nodes.forEach((node: any) => this.nodes = this.nodes.filter((item: any) => item.id !== node.id))
    removeData.links.forEach((link: any) => {
      let index = this.links.findIndex((item: any) => item.source.id === link.source && item.target.id === link.target)
      if (index > -1) { 
        this.links.splice(index, 1) 
      }
    })
    this.updateSimulation()
  }

  updateGraph = () => {
    // links
    this.linkElements = this.linkGroup.selectAll('line').data(this.links, (link: any) => link.target.id + link.source.id)
    this.linkElements.exit().remove()

    const linkEnter = this.linkElements
      .enter()
      .append('line')
        .attr('stroke-width', 2)
        .attr("stroke", (d: any) => this.color(d.type))
      
    linkEnter
      .append("title")
        .text((link: any) => `${link.date} ${link.type} ${link.target.id}: ${link.fa} fatalities, ${link.in} injuries`);

    this.linkElements = linkEnter.merge(this.linkElements)

    // nodes
    this.nodeElements = this.nodeGroup.selectAll('circle').data(this.nodes, (node: any) => node.id)
    this.nodeElements.exit().remove()

    const nodeEnter = this.nodeElements
      .enter()
      .append("circle")
        .attr("r", (node: any) => node.fa ? 10 + Math.sqrt(node.fa) + (Math.sqrt(node.in) / 2) : 10)
        .attr("fill", (d: any) => {
          switch(d.type) {
            case "Terrorist Group": return "#8C2B07";
            case "City": return "#DBDAD5";
            default: return this.scale(d.type);
          }
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .call(this.drag)
        .on('mouseover', this.selectNode)
        .on('dblclick', (node: any) => this.props.handleDoubleClick(node.id))
      
    nodeEnter
      .append("title")
        .text((node: any) => (node.fa >= 0 || node.in >= 0) ? `${node.date} (${node.type}): ${node.fa} fatalities, ${node.in} injuries` : `${node.id} (${node.type})`)

    this.nodeElements = nodeEnter.merge(this.nodeElements)
    
    // text
    this.textElements = this.textGroup.selectAll('text').data(this.nodes, (node: any) => node.id)
    this.textElements.exit().remove()

    const textEnter = this.textElements
      .enter()
      .append('text')
        .text((node: any) => isNaN(node.id) ? node.id : "")
        .attr('font-size', 12)
        .style('fill', '#000')
        .style('pointer-events', 'none')
        .style('user-select', 'none')
        .attr('dx', 15)
        .attr('dy', 4)

    this.textElements = textEnter.merge(this.textElements)
  
  }
  
  updateSimulation = () => {
    this.updateGraph()
  
    if (this.simulation) {
      this.simulation.nodes(this.nodes).on('tick', () => {
        this.nodeElements.attr('cx', (node: any) => node.x).attr('cy', (node: any) => node.y)
        this.textElements.attr('x', (node: any) => node.x).attr('y', (node: any) => node.y)
        this.linkElements
          .attr('x1', (link: any) => link.source.x)
          .attr('y1', (link: any) => link.source.y)
          .attr('x2', (link: any) => link.target.x)
          .attr('y2', (link: any) => link.target.y)
      });
      
      this.simulation.force('link').links(this.links)
      this.simulation.alphaTarget(0.5).restart()
      setTimeout(() => {
        this.simulation.alphaTarget(0)
      }, 1000)
    }    
  }

  getNeighbors = (nodeId: any, links: any) => {
    return links.reduce(
      (neighbors: any, link: any) => {
        if (link.target.id === nodeId) {
          neighbors.push(link.source.id)
        } else if (link.source.id === nodeId) {
          neighbors.push(link.target.id)
        }
        return neighbors
      },
      [nodeId]
    )
  }

  getNeighborsOfNeighbors = (nodes: any[], links: any) => {
    let neighbors: any[] = [];
    nodes.forEach(node => {
      neighbors = [...neighbors, ...this.getNeighbors(node, links)]
    })
    return neighbors;
  }
  
  isNeighborLink = (node: any, link: any) => {
    return link.target.id === node.id || link.source.id === node.id
  }

  drag = d3.drag().on('start', (node: any) => {
    node.fx = node.x
    node.fy = node.y
  }).on('drag', (node: any) => {
    this.simulation.alphaTarget(0.7).restart()
    node.fx = d3.event.x
    node.fy = d3.event.y
  }).on('end', (node: any) => {
    if (!d3.event.active) {
      this.simulation.alphaTarget(0)
    }
    node.fx = null
    node.fy = null
  })

  render() {
    const { classes, data } = this.props;
    return (
      <div className={classes.root}>
        {
          data ? 
          <svg height={this.state.height} width={this.state.width} ref={handle => (this.svg = d3.select(handle))}></svg>
          :
          null
        }
      </div>
    );
  }
}

export default withStyles(styles)(D3ForceNetwork);