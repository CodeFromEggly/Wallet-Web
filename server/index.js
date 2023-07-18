import path from 'path';

import express from 'express';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cookieParser());


// ES6 way to get __dirname
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Functions used for making Etherscan requests
import { layeredSearch, processData, getAndProcessData} from './helpers.js';

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
  // Check for API key in cookies:
  let etherscanApi = req.cookies.etherscanApi;
  console.log("hompage cookie:", etherscanApi);


  res.render('homepage', { title: 'Homepage', etherscanApi: etherscanApi });
});


/*
Routes
*/

// Route to handle form submission
app.post('/submit', async (req, res) => {
  const params = req.body;
  console.log(params);

  // Store api key as cookie
  let checked = params.checkbox;
  console.log("checked,",checked);
  if (checked) {
    res.cookie('etherscanApi', params.etherscanApi, {maxAge: (1000 * 60 * 2)}); // Stored for 2 hours
  }

  // Save the source wallet for later
  const SOURCE = params.sourceWallet;
  params.sourceWallet = SOURCE.toLowerCase();
  //const processedData = await getAndProcessData(params);

  // GET search data, until depth is met
  const allData = await layeredSearch(params); // TODO send the specific paramters that we want, maybe (i.e. not checkbox)

  // Process allData into nodes and links (and wallets, still, to see if it differs to the allData.wallets from layeredSearch)
  let processedData = processData(allData.raw);

  // Add sourceWallet for later:
  processedData.sourceWallet = SOURCE; // TODO may not be necessary as allData.wallets[0] is source
  
  res.render('visualisation', {title: 'Visualisation', data: processedData});
});

/* Recives POST requests from the visualisation for new data */
app.post('/newData', async (req, res) => {
  console.log("new data requested");
  // Receive source wallet
  let sourceWallet = req.body.address;
  console.log("received address", sourceWallet);
  // API key is stored in cookies 
  let cooKEY = req.cookies.etherscanApi;
  console.log("retrieved cooKEY",cooKEY);
  // GET data from etherscan
  let params = {sourceWallet: sourceWallet, etherscanApi: cooKEY};
  let processedData = await getAndProcessData(params);

  // TODO send new data as response
  res.json(processedData);
});


app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});


/* 
Functions // TODO tidy these up, move to other files
*/





function duplicateCheck(all, new_data) {
    ['wallets', 'nodes', 'links'].forEach(key => {
        new_data[key] = new_data[key].filter((item) => { // Filters items based upon the truthy-ness of the return statement
            return !_.find(all[key], (existingItem) => _.isEqual(existingItem, item));
        });
    });
}

