import path from 'path';

import express from 'express';
const app = express();

// ES6 way to get __dirname
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Functions used for making Etherscan requests
import { layeredSearch } from './helpers.js';

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
  const SOURCE = params.sourceWallet;
  console.log("original params",params);
  params.sourceWallet = params.sourceWallet.toLowerCase();
  //const processedData = await getAndProcessData(params);

  // GET search data, until depth is met
  const allData = await layeredSearch(params);

  // Process allData into nodes and links (and wallets, still, to see if it differs to the allData.wallets from layeredSearch)
  let processedData = processData(allData.raw);

  // Add sourceWallet for later:
  processedData.sourceWallet = SOURCE; // TODO may not be necessary as allData.wallets[0] is source
  
  res.render('visualisation', {title: 'Visualisation', data: processedData});
});


app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});


/* 
Functions // TODO tidy these up, move to other files
*/


// Process data into Nodes and Links
const processData = (data) => {

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
      value: (val.value / 10e18), // TODO Convert Wei to ETH here
      hash: val.hash
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


function duplicateCheck(all, new_data) {
    ['wallets', 'nodes', 'links'].forEach(key => {
        new_data[key] = new_data[key].filter((item) => { // Filters items based upon the truthy-ness of the return statement
            return !_.find(all[key], (existingItem) => _.isEqual(existingItem, item));
        });
    });
}

