const express = require('express');
const path = require('path');
const app = express();

// Set the view engine to pug
app.set('view engine', 'pug');

// Set the views directory
app.set('views', path.join(__dirname, '../views'));

// Set the static files directory
app.use(express.static(path.join(__dirname, '../public')));


// Define a route to render the homepage
app.get('/', (req, res) => {
    res.render('visualisation', { title: 'Homepage' });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
