const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');

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
    const processedData = await getAndProcessData(params);

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

  try {
      const response = await fetch(API_ADDRESS);
      var data = await response.json();
      //console.log("Response data", data);

  } catch (error) {
    console.error(error);
    // TODO Handle errors as they be passed on to processData() as undefined
  }

  // Add the original wallet address to data for later
  data.sourceWallet = params.sourceWallet;
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
  // TODO arrow notation using 'for each'

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
      source: wallets.indexOf(val.from),
      target: wallets.indexOf(val.to),
      value: val.value
     };
     return link;
  });
  
  console.log('nodes,',nodes);
  console.log('links,',links);
  
  // Send results for using in D3.js:     
  let postProcess = {wallets, nodes, links};
  return postProcess;
};


const getAndProcessData = async (params) => {
  const data = await getEtherscanData(params);
  return processData(data);
};