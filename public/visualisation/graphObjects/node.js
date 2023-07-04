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
    console.log("ID is",d.id);
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