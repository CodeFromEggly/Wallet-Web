console.log("Loading http request");
import { APIKEY } from '../api.js';
// TODO import api from .env which means loading api calls server-side

// Source wallet:
const SOURCE = "0xDa06d7bF334bc5cCec9CB76de194565937378140";

// Create query address using SOURCE and apikey
const API_ADDRESS = `https://api.etherscan.io/api?module=account&action=txlist&address=${SOURCE}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${APIKEY}`;


(async () => {
  try {
    const response = await fetch(API_ADDRESS);
    var data = await response.json();
    console.log(data);
    var numTrans = data.result.length;
  
    // Prepare data for D3:
    var wallets = data.result.reduce(function (acc, val) {
      if (acc.indexOf(val.to) === -1) {
        acc.push(val.to);
      }
      return acc;
    }, []);
  
    // When creating Link D3 appears to need the source wallet also
    // Insert source wallet at start
    wallets.unshift(SOURCE)
  
  
    // Generate nodes for the graph from each wallet
    var nodes = [];
    wallets.forEach(function (wallet) {
      var nodeObject = {
        name: wallet
      }
      nodes.push(nodeObject);
    });

    // create links for d3 which required numerical IDs not names
    var links = data.result.map(function (val) {
      return {
        source: nodes[0], // source node is the same for all links
        target: nodes[wallets.indexOf(val.to)] // target node is the node that has the same index as val.to in the wallets array
      };
    });
  
    console.log(`Wallets: ${wallets} and Nodes: ${nodes}`);
    console.log(`Links: ${links}`);
    // TODO convert to arrow notation to be 5exy
    /*
    wallets.array.forEach(element => {
    
    });
    */
  
    // Visualise the results using D3.js:
    createVisualisation(nodes, links);
  } catch (error) {
    console.error(error);
  }
})();


/*
Visualising the results
*/

function createVisualisation(nodes, links) {

  console.log("createVisualisation");
  console.log(d3.version);
  
  const height = 800;
  const width = 800;
  const nodeRadius = 5;

  // force-directed graph layout
  const force = d3.forceSimulation(nodes) // nodes repel each other
    .force("charge", d3.forceManyBody().strength(-220)) 
    .force("link", d3.forceLink(links).distance(100))
    .force("center", d3.forceCenter(width / 2, height / 2));

  // Give the force layout a chance to move the nodes a bit
  for (let i = 0; i < 300; ++i) force.tick();

  // Log nodes to see their current x and y properties
  console.log(nodes);
  console.log(links);

  // Here is where D3 begins to manipulate the DOM
  const svg = d3.select("#root").append("svg")
    .attr("width", width)
    .attr("height", height);

  const link =  svg.selectAll(".link")
    .data(links)
    .join("line")
    .attr("class", "link");

  const node = svg.selectAll(".node")
    .data(nodes)
    .join("circle")
    .attr("class", "node")
    .attr("r", nodeRadius);

  force.on("tick", function () {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);
  });

}
