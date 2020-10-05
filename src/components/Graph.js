import React from 'react'
import * as d3dag from 'd3-dag';
import * as d3 from 'd3';
import ColorHash from "color-hash";
import {Grid, Label, List, Segment} from "semantic-ui-react";
import Moment from "react-moment";

const hash = new ColorHash({lightness: [0.35, 0.5, 0.65]})

const jobsExample = [{
    "id": "1424026a-a3e4-4af2-9ac7-b910f98f213d",
    "status": "Ready",
    "startedAt": null,
    "endedAt": null,
    "exception": null,
    "notebook": {
      "id": "a92b824decc7b369180f4c30241e91f149c20e96",
      "path": "blueprint/tests/1.ipynb",
      "commitId": "b1c4d0db22fcd94ae0718319756d979f3c62490a",
      "fetchUrl": "/api/v1/repositories/9bf7399763ff968e4dbaf1bef11ad7b8f5a75c09/commits/b1c4d0db22fcd94ae0718319756d979f3c62490a/notebooks/a92b824decc7b369180f4c30241e91f149c20e96",
      "inputs": ["/START"],
      "outputs": ["/A", "/B"]
    },
    "previousJobs": []
  }, {
    "id": "399b29ca-ed1b-4052-994c-aef55a39fb4b",
    "status": "Ready",
    "startedAt": null,
    "endedAt": null,
    "exception": null,
    "notebook": {
      "id": "fececd88044240b980f7b392a89b5493c8201e23",
      "path": "blueprint/tests/2.ipynb",
      "commitId": "b1c4d0db22fcd94ae0718319756d979f3c62490a",
      "fetchUrl": "/api/v1/repositories/9bf7399763ff968e4dbaf1bef11ad7b8f5a75c09/commits/b1c4d0db22fcd94ae0718319756d979f3c62490a/notebooks/fececd88044240b980f7b392a89b5493c8201e23",
      "inputs": ["/A"],
      "outputs": ["/C", "/D", "/F"]
    },
    "previousJobs": ["1424026a-a3e4-4af2-9ac7-b910f98f213d"]
  }, {
    "id": "b6271f43-5eea-417b-9538-8e017926712e",
    "status": "Ready",
    "startedAt": null,
    "endedAt": null,
    "exception": null,
    "notebook": {
      "id": "3f545669d5726660f1f8b4e29379f3d03a37b003",
      "path": "blueprint/tests/3.ipynb",
      "commitId": "b1c4d0db22fcd94ae0718319756d979f3c62490a",
      "fetchUrl": "/api/v1/repositories/9bf7399763ff968e4dbaf1bef11ad7b8f5a75c09/commits/b1c4d0db22fcd94ae0718319756d979f3c62490a/notebooks/3f545669d5726660f1f8b4e29379f3d03a37b003",
      "inputs": ["/B", "/C"],
      "outputs": ["/E"]
    },
    "previousJobs": ["399b29ca-ed1b-4052-994c-aef55a39fb4b", "1424026a-a3e4-4af2-9ac7-b910f98f213d"]
  }, {
    "id": "323a8080-6449-47d0-877b-fb6f679a5b77",
    "status": "Ready",
    "startedAt": null,
    "endedAt": null,
    "exception": null,
    "notebook": {
      "id": "fe699b6dde2e8fd27ca22f6c8c97b8a8cbf9463d",
      "path": "blueprint/tests/4.ipynb",
      "commitId": "b1c4d0db22fcd94ae0718319756d979f3c62490a",
      "fetchUrl": "/api/v1/repositories/9bf7399763ff968e4dbaf1bef11ad7b8f5a75c09/commits/b1c4d0db22fcd94ae0718319756d979f3c62490a/notebooks/fe699b6dde2e8fd27ca22f6c8c97b8a8cbf9463d",
      "inputs": ["/D", "/E", "/F"],
      "outputs": ["/END"]
    },
    "previousJobs": ["399b29ca-ed1b-4052-994c-aef55a39fb4b", "b6271f43-5eea-417b-9538-8e017926712e", "1424026a-a3e4-4af2-9ac7-b910f98f213d"]
  }]

const JobListItem = ({id, status, startedAt, endedAt, path}) => (
  <List.Item>
    <List.Content>
      <List.Header>
        <Label style={{background: hash.hex(id)}} horizontal>
          {id.substring(0, 7)}
        </Label>
        {path}
      </List.Header>
      <List.Description>
        <List.Icon name='sync alternate' loading/>
        started <Moment unix fromNow>{startedAt}</Moment>
      </List.Description>
    </List.Content>
  </List.Item>
)

export const DirectedAcyclicGraph = ({nodes}) => {
  return (
    <Segment>
      <Grid columns={2} stackable divided>
        <Grid.Column width={5}>
          <List divided relaxed>
            {jobsExample.map(job => (
              <JobListItem
                key={job.id}
                id={job.notebook.id}
                path={job.notebook.path}
                status={job.status}
                startedAt={job.startedAt}
                endedAt={job.endedAt}
              />
            ))}
          </List>
        </Grid.Column>
        <Grid.Column>
          <D3Dag/>
        </Grid.Column>
      </Grid>
    </Segment>)
}

const layerings = {
  "Simplex (slow)": d3dag.layeringSimplex(),
  "Longest Path (fast)": d3dag.layeringLongestPath(),
  "Coffman Graham (medium)": d3dag.layeringCoffmanGraham(),
}

const decrossings = {
  "Optimal (slow)": d3dag.decrossOpt(),
  "Two Layer Opt (medium)": d3dag.decrossTwoLayer().order(d3dag.twolayerOpt()),
  "Two Layer Median (flast)": d3dag.decrossTwoLayer().order(d3dag.twolayerMedian()),
  "Two Layer Mean (flast)": d3dag.decrossTwoLayer(),
}

const seps = {
  "Constant Separation": () => 1,
  "Edge Aware Separation": (left, right) => +!(left instanceof d3dag.SugiDummyNode) + +!(right instanceof d3dag.SugiDummyNode),
}

const coords = {
  "Vertical (slow)": d3dag.coordVert(),
  "Minimum Curves (slow)": d3dag.coordMinCurve(),
  "Greedy (medium)": d3dag.coordGreedy(),
  "Center (fast)": d3dag.coordCenter(),
};

class D3Dag extends React.Component {

  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  componentDidMount() {

    // TODO: Move to props
    const dag = d3dag.dagStratify()
      .id(n => n.id)
      .parentIds(n => n.previousJobs)
    (jobsExample)


    const {
      clientHeight: height,
      clientWidth: width,
    } = this.myRef.current;

    const svgSelection = d3.select(this.myRef.current);
    const defs = svgSelection.append('defs');

    d3dag.sugiyama()
      .size([width, height])
      .layering(layerings["Coffman Graham (medium)"])
      .decross(decrossings["Two Layer Mean (flast)"])
      .coord(coords["Center (fast)"])
      .separation(seps["Constant Separation"])(dag)

    // How to draw edges
    const line = d3.line()
      .curve(d3.curveCatmullRom)
      .x(d => d.x)
      .y(d => d.y);

    // Plot edges
    svgSelection.append('g')
      .selectAll('path')
      .data(dag.links())
      .enter()
      .append('path')
      .attr('d', ({points}) => line(points))
      .attr('fill', 'none')
      .attr('stroke-width', 3)
      .attr('stroke', ({source, target}) => {
        console.log(source)
        const gradId = `${source.id}-${target.id}`;
        const grad = defs.append('linearGradient')
          .attr('id', gradId)
          .attr('gradientUnits', 'userSpaceOnUse')
          .attr('x1', source.x)
          .attr('x2', target.x)
          .attr('y1', source.y)
          .attr('y2', target.y);
        grad.append('stop').attr('offset', '0%').attr('stop-color', hash.hex(source.data.notebook.id));
        grad.append('stop').attr('offset', '100%').attr('stop-color', hash.hex(target.data.notebook.id));
        return `url(#${gradId})`;
      });

    // Select nodes
    const nodes = svgSelection.append('g')
      .selectAll('g')
      .data(dag.descendants())
      .enter()
      .append('g')
      .attr('transform', ({x, y}) => `translate(${x - 30}, ${y - 13})`);

    nodes.append('rect')
      .attr('width', 60)
      .attr('height', 26)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('fill', n => hash.hex(n.data.notebook.id));
  }


  render() {
    return (
      <svg ref={this.myRef} width='400px' height='400px' viewBox='-20 -20 440 440'>
      </svg>
    );
  }

}

export default D3Dag;