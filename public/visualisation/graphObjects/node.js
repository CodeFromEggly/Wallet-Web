/*
Input [DETAILS ABOUT NODE]  to return the node's colour
*/

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

// Display a textbox with info when clicked
export const nodeClick = function(event, d) {
    // TODO
}