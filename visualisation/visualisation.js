console.log("Loading http request");
import { APIKEY } from '../api.js';


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
  
  
    // create links for d3 which required numerical IDs not names
    var links = data.result.map(function (val) {
      // The source wallet is the same for all
      val.source = 0;
      // example uses "val.target" so i think i need "val.to"
      val.target = wallets.indexOf(val.to);
      return val;
    });
  
  
    // Generate nodes for the graph from each wallet
    var nodes = [];
    wallets.forEach(function (wallet) {
      var nodeObject = {
        name: wallet
      }
      nodes.push(nodeObject);
    });
  
    console.log(`Wallets: ${wallets} and Nodes: ${nodes}`);
    // TODO convert to arrow notation to be 5exy
    /*
    wallets.array.forEach(element => {
    
    });
    */
  
    // TODO createVisualisation(nodes, links);
  } catch (error) {
    console.error(error);
  }
})();
