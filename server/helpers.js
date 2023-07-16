// -
// Functions for import into server.js
// -

import fetch from 'node-fetch'; // getEtherscanData()
import _ from 'lodash'; // layeredSearch()


/*
GET request to Etherscan API
Uses URl built from the response from HTML form on homepage
*/
export const getAndProcessData = async (params) => {
  const data = await getEtherscanData(params);
  return processData(data);
};

const getEtherscanData = async (params) => {  // TODO DC params and use it in a better way
  var API_ADDRESS = "https://api.etherscan.io/api?module=account&action=txlist&address=" +
  params.sourceWallet +
  "&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=" +
  params.etherscanApi;
  // TODO add other params, i.e., amount of transactions returned

  try {
      const response = await fetch(API_ADDRESS);
      var data = await response.json();

  } catch (error) {
    console.error(error);
    // TODO Handle errors as they be passed on to processData() as undefined
    return null;
  }
  return data.result;
};

// Process data into Nodes and Links
export const processData = (data) => {

  // Accumulate list of addresses that transacted
  var wallets = data.reduce((acc, val) => {
    if (!acc.includes(val.to)){
      acc.push(val.to);
    }
    if (!acc.includes(val.from)) {
      acc.push(val.from);
    }
    return acc;
    }, []);
  
  // Generate nodes for the graph from each wallet
  var nodes = [];
  wallets.forEach(wallet => {
    var nodeObject = {
      id: wallet,
    };
    // To find the original data object where this wallet is a source:
    //let originalObject = data.find((item) => item.from === wallet);
    
    nodes.push(nodeObject);
  });

  // create links for d3 which required numerical IDs not names
  var links = data.map((val) => {
    let link = {
      // D3 wants list indices as source and target. These are calculated in linksPostProcess()
      source: wallets.indexOf(val.from),
      target: wallets.indexOf(val.to),
      value: (val.value / 10e17), // TODO Convert Wei to ETH here
      hash: val.hash
     };
     return link;
  });
  
  // Send results for using in D3.js:     
  let postProcess = {wallets, nodes, links};
  return postProcess;
};

/*
Search through progressive layers of transactions
continues until reaching the specified depth,
  i.e., degrees of seperation from source wallet
*/
export const layeredSearch = async (params) => {
  // TODO This is disgusting. Sort it out.
  // Search the source wallet
  var p = _.cloneDeep(params);

  // Exclude searched wallets from further searches
  var excludes = [];

  // 'all' will hold every search result
  var all = {
    raw: [],
    wallets: []
  };

  // Initialise previous layer using source data
  var prev_layer = {
    raw: [],
    new_wallets: [p.sourceWallet]
  };

  var layer = 0;  // Current layer of search
  var depth_limit = p.depth;

  // Begin while loop
  while (layer < depth_limit) {
    layer += 1;

    // Results of the current layer will be be held in one object
    var curr_layer = {
      raw:[],
      new_wallets:[],
    };

    // Iterate through every wallet returned from the searches of the previous layer
    for ( let address of prev_layer.new_wallets) {
      // Is the wallet in the exclusion list? // TODO preemptively remove addresses from previous layer? 
      if (excludes.includes(address)) {
        continue; // Skip to next wallet
      }
      // Set the new wallet in params
      p.sourceWallet = address;

      // Search data on this new wallet
      var new_data = await getEtherscanData(p);
      excludes.push(address);
       
      // Add the raw data to the current layer's data list
      curr_layer.raw = curr_layer.raw.concat(_.cloneDeep(new_data)); // TODO may have to remove duplicates first

    }
    // From this raw data, find the wallets to use for enxt layer
    curr_layer.new_wallets = (generateWallets(curr_layer.raw));

    // If one of the new wallets has already been checked, exclude it
    curr_layer.new_wallets = curr_layer.new_wallets.filter(function (wallet) {
        return !(excludes.includes(wallet));
    });
    // Add raw data to all

    all.raw = all.raw.concat(_.cloneDeep(curr_layer.raw)); // TODO remove duplicates? there dont seem to be any
    all.wallets = all.wallets.concat(_.cloneDeep(curr_layer.new_wallets));

    //  Next iteration's previous layer will be this current one
    prev_layer = _.cloneDeep(curr_layer); 
  }
  // Return all raw data
  return all;
};

const generateWallets = (data) => {
    // Accumulate list of addresses that transacted
    var wallets = data.reduce(function (acc, val) {
      if (acc.indexOf(val.to) === -1) {
        acc.push(val.to);
      }
      if (acc.indexOf(val.from) === -1) {
        acc.push(val.from);
      }
      return acc;
    }, []);
    return wallets;
}