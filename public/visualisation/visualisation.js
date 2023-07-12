console.log("Visualising data");

/*
Unpack data
*/

const SOURCE = data.sourceWallet;
console.log("The source wallet is,", SOURCE);
var nodes = data.nodes;
var links = data.links;
var wallets = data.wallets;


console.log(nodes);
console.log(links);

/*
Visualising the results
*/

// Display SVG in 3/4 of the window size
const height = window.innerHeight * 0.6;
const width = window.innerWidth * 0.6;
const nodeRadius = 5;
const linkWidth = 3;

/*
Stylise the objects in the graph
*/
// Links:
import { linkColour, linkClick, linkHover, linkUnHover, linkDblClick } from './graphObjects/link.js'; // Input transaction value return the colour
// Nodes:
import { nodeColour, nodeSize, nodeClick, nodeHover, nodeUnHover, nodeDblCLick } from './graphObjects/node.js'; // Highlight source



// force-directed graph layout
const force = d3.forceSimulation(nodes) // nodes repel each other
  .force("charge", d3.forceManyBody().strength(-80)) // Prev. -220
  .force("link", d3.forceLink(links).distance(50))   // Prev. 100
  .force("center", d3.forceCenter(width / 2, height / 2));

// Give the force layout a chance to move the nodes a bit
for (let i = 0; i < 300; ++i) force.tick();

/*
  Create graph objects by manipulating DOM
*/
const svg = d3.select("#root")
  .append("svg")
  .attr("viewBox", `0 0 ${width} ${height}`);

const link =  svg.selectAll(".link")
  .data(links)
  .join("line")
  .attr("stroke", d => linkColour(d.value, links))
  .attr("stroke-width", linkWidth);

const node = svg.selectAll(".node")
  .data(nodes)
  .join("circle")
  .attr("stroke","#000000")
  .style("fill", d => nodeColour(d, SOURCE))
  .attr("r", nodeRadius);


/*
  Add Event Listeners
*/

// NODES:
node.on("mouseover",(event, d) => nodeHover(svg, event, d))
  .on("mouseout", nodeUnHover)
  .on("click", nodeClick)
  .on("dblclick", nodeDblCLick);

// LINKS: 


link.on("mouseover", (event, d) => linkHover(svg, event, d)) // svg isn't yet defined so can't be called immediately
  .on("mouseout", linkUnHover)
  .on("click", (event, d) => linkClick(svg, event, d))
  .on("dblclick", linkDblClick);





/*
  Start Force Simulation
*/
force.on("tick", function () {
  link
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);

    node
    // Create a bounding box to contain the nodes within a nodeRadius margin of the SVG
    .attr("cx", function(d) { return Math.max(nodeRadius, Math.min(width - nodeRadius, d.x)); }) // TODO Nodes still crowd the border of the box
    .attr("cy", function(d) { return Math.max(nodeRadius, Math.min(height - nodeRadius, d.y)); })
    .append("title") // Add a tooltip with the node's label
    .text(d => d.id);

});


