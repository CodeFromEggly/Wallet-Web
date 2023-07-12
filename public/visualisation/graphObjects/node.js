/*
    Node Presentation
*/
// Changes colour of source node
export const nodeColour = function(node, sourceWallet) {
    // Highlight the source wallet
    if (node.id.toLowerCase() == sourceWallet.toLowerCase()) {
        return "#f32212";
    }
    else {
        return "#FFFFFF";
    }
}

// Size a node dependent on its depth
export const nodeSize = function(node) { // TODO implement this
    return 20 / node.depth;

}

/*
    Pointer Events
*/

// Display a textbox with info when clicked
export const nodeClick = (event, d) => {
    // d is the data associated with the clicked node
    const walletAddress = d.id; // Assuming the id field contains the wallet address
    const etherscanUrl = `https://etherscan.io/address/${walletAddress}`; // Modify this if the structure of the URL is different

    // Clear the info div and populate new info
    const infoDiv = document.querySelector('#info');
    infoDiv.innerHTML = '';

    // Create and append wallet address paragraph
    const walletInfo = document.createElement('p');
    walletInfo.textContent = `Wallet Address: ${walletAddress}`;
    infoDiv.appendChild(walletInfo);

    // Create and append etherscan link
    const etherscanLink = document.createElement('a');
    etherscanLink.href = etherscanUrl;
    etherscanLink.textContent = 'View on Etherscan';
    etherscanLink.target = '_blank'; // Open in a new tab
    infoDiv.appendChild(etherscanLink);

    // Create and append use as source button
    const sourceButton = document.createElement('button');
    sourceButton.textContent = 'Use as Source';
    sourceButton.onclick = function() {
        // TODO handle source switching to run /submit with wallet as source
        // Make a GET request to the / route with the node's id as a query parameter
        console.log("button clicked");
        window.location.href = `/?sourceWallet=${walletAddress}`
    };
    infoDiv.appendChild(sourceButton);

    // Scroll the #info div into view
    infoDiv.scrollIntoView({ behavior: 'smooth' });
}


// Enlarge node and place options within it
export const nodeHover = (event, d) => {
    //
    console.log("hover");
}

// Shrink node and remove options
export const nodeUnHover = (event, d) => {
    //
    console.log("unhover");
}

// Reroute to Etherscan page for Node
export const nodeDblCLick = (event, d) => {
    //
    window.location.href = 'https://etherscan.io/address/' + encodeURIComponent(d.id);

}