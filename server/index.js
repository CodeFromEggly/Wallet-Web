const fetch = require('node-fetch');
const path = require('path');
const _ = require('lodash'); // For deep cloning and filtering used for duplicateCheck();

const express = require('express');
const app = express();

// Set the view engine to pug
app.set('view engine', 'pug');

// Set the views directory
app.set('views', path.join(__dirname, '../views'));

// Set the static files directory
app.use(express.static(path.join(__dirname, '../public')));

// Set up body-parser middleware to handle HTML form
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Define a route to render the homepage
app.get('/', (req, res) => {
    res.render('homepage', { title: 'Homepage' });
});


/*
Routes
*/

// Route to handle form submission
app.post('/submit', async (req, res) => {
    const params = req.body;
    console.log("original params",params);
    //const processedData = await getAndProcessData(params);
    const processedData = await layeredSearch(params);
    

    // Add sourceWallet for later:
    processedData.sourceWallet = params.sourceWallet;
    res.render('visualisation', {title: 'Visualisation', data: processedData});
  });


app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});


/* 
Functions
*/


const getEtherscanData = async (params) => {
  console.log("Loading http request via getEtherscanData");

  var API_ADDRESS = "https://api.etherscan.io/api?module=account&action=txlist&address=" +
  params.sourceWallet +
  "&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=" +
  params.etherscanApi;
  // TODO add other params, i.e., amount of transactions returned

  console.log("built URL,",API_ADDRESS)

  try {
      const response = await fetch(API_ADDRESS);
      var data = await response.json();
      console.log("data recieved from etherscan");

  } catch (error) {
    console.error(error);
    // TODO Handle errors as they be passed on to processData() as undefined
    return null;
  }

  return data;
};


const processData = (data) => {
  // Process data into Nodes and Links

  // Accumulate list of addresses that transacted
  var wallets = data.result.reduce(function (acc, val) {
      if (acc.indexOf(val.to) === -1) {
        acc.push(val.to);
      }
      if (acc.indexOf(val.from) === -1) {
        acc.push(val.from);
      }
      return acc;
      }, []);
  
  
  // Generate nodes for the graph from each wallet
  var nodes = [];
  wallets.forEach(wallet => {
      var nodeObject = {
        id: wallet
      }
      nodes.push(nodeObject);
  });

  // create links for d3 which required numerical IDs not names
  var links = data.result.map(val => {
    let link = {
      // D3 wants list indices as source and target. These are calculated in linksPostProcess()
      source: val.from,
      target: val.to,
      value: val.value
     };
     return link;
  });
  
  // Send results for using in D3.js:     
  let postProcess = {wallets, nodes, links};
  return postProcess;
};


const getAndProcessData = async (params) => {
  const data = await getEtherscanData(params);
  return processData(data);
};



/* objects in lists contain references (they are not simple data types like numbers or strings), the references will be copied.
That means change in object in the wallets list in data1 will also be visible in the wallets list in data3. 
To avoid need to need to deep-clone the objects when copy them.
*/
function mergeData(data1, data2) {
  let data3 = {};
  // TODO check for duplicate data ( maybe before calling mergeData?)

  data3.wallets = [...data1.wallets, ...data2.wallets];
  data3.links = [...data1.links, ...data2.links];
  data3.nodes = [...data1.nodes, ...data2.nodes];

  return data3;
}


// Search through progressive layers of transactions until reaching the specified depth
const layeredSearch = async (params) => {
  // Search the source wallet
  var sourceData = await getAndProcessData(params);

  // Exclude the source wallet from further searches
  var excludes = [params.sourceWallet.toLowerCase()];

  // Add source results to All
  var all = _.cloneDeep(sourceData); // Data returned from the next layers will be merged into all  

  // Initialise previous layer using source data
  var prev_layer = _.cloneDeep(sourceData);
  var layer = 1;  // Current layer of search
  var depth = params.depth;

  // Begin while loop
  while (layer < depth) {
    var curr_layer = {
      wallets: [],
      links: [],
      nodes: []
    };

    // Iterate through every wallet returned from the searches of the previous layer
    for (wallet of prev_layer.nodes) {
      // Is the wallet in the exclusion list?
      if (excludes.includes(wallet.id)) {
        continue; // Skip to next wallet
      }
      // Set the new wallet in params
      console.log("new wallet address being set to,",wallet.id);
      params.sourceWallet = wallet.id;

      // Search data on this new wallet
      let new_data = await getAndProcessData(params);
      // TODO during processing, link to and from value is linked to the indice of the wallet as it was within tbe function
      // TODO ... this means it doesn't fit the index as it stands in the all object.
      // TODO mayve change val.to to being just the address in processDAta(). post process the links to match the updated indicies
      
      // Merge data into the current layer of of results (checking for duplicate data)
      duplicateCheck(all, new_data);
      curr_layer = mergeData(curr_layer, new_data);

    }
    // Now that each results in the previous layer has been parsed, add the new results to all
    // TODO should i duplicate check again? change curr_layer to prev? who knows
    all = mergeData(all, curr_layer);

    //  Prepare next layer
    prev_layer = _.cloneDeep(curr_layer);
    layer += 1;
  }
  console.log("layer == depth");
  // TODO Convert link .source and .target to indices of the address in all.wallets
  linksPostProcess(all);

  // Remove any Wallets that have source '', links that connect, or nodes generated from it
  console.log("wallets, how many have ''?", all.wallets);

  /* remove blanks
  */ // TODO clean this up and do at a more efficient point in the whole process
  let noBlanks = {
    wallets: all.wallets.filter(wallet => wallet !== ''),
    nodes: all.nodes.filter(node => node.id !== ''),
    links: all.links.filter(link => !(link.source == '' || link.target == '')),
    }
  // 

  

  // Return all the layer which has been gathered
  console.log("no blanks",noBlanks);
  console.log("number of wallets, nodes, link",noBlanks.wallets.length,noBlanks.nodes.length,noBlanks.links.length);

  return noBlanks;
};


function duplicateCheck(all, new_data) {
    ['wallets', 'nodes', 'links'].forEach(key => {
        new_data[key] = new_data[key].filter((item) => { // Filters items based upon the truthy-ness of the return statement
            return !_.find(all[key], (existingItem) => _.isEqual(existingItem, item));
        });
    });
}


// Replace the target and source addresses with the location of said address in wallets list
function linksPostProcess(all) {
  console.log("post processing links");
  for (link of all.links) {
    //
    link.target = all.wallets.indexOf(link.target);
    link.source = all.wallets.indexOf(link.source);
  }
}