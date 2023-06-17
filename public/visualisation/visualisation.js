console.log("Visualising data");

/*
Unpack data
*/

const SOURCE = data.sourceWallet;
var nodes = data.nodes;
var links = data.links;
var wallets = data.wallets;

console.log(nodes);
console.log(links);



/*
Visualising the results
*/

// Display SVG in 3/4 of the window size
const height = window.innerHeight * 0.75;
const width = window.innerWidth * 0.75;
const nodeRadius = 5;

// force-directed graph layout
const force = d3.forceSimulation(nodes) // nodes repel each other
  .force("charge", d3.forceManyBody().strength(-220)) 
  .force("link", d3.forceLink(links).distance(100))
  .force("center", d3.forceCenter(width / 2, height / 2));

// Give the force layout a chance to move the nodes a bit
for (let i = 0; i < 300; ++i) force.tick();

// Here is where D3 begins to manipulate the DOM
const svg = d3.select("#root").append("svg")
  .attr("width", width)
  .attr("height", height);


const link =  svg.selectAll(".link")
  .data(links)
  .join("line")
  //.attr("class", "link")
  .attr("stroke", "#f80a0a");

const node = svg.selectAll(".node")
  .data(nodes)
  .join("circle")
  //.attr("class", "node")
  .attr("stroke","#f80a0a")
  .attr("r", nodeRadius);

force.on("tick", function () {
  link
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);

    node
    // Create a bounding box to contain the nodes within a nodeRadius margin of the SVG
    .attr("cx", function(d) { return d.x = Math.max(nodeRadius, Math.min(width - nodeRadius, d.x)); })
    .attr("cy", function(d) { return d.y = Math.max(nodeRadius, Math.min(height - nodeRadius, d.y)); });

});