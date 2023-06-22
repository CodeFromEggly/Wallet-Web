/*
Input [DETAILS ABOUT NODE]  to return the node's colour
*/

export const nodeColour = function(node, sourceWallet) {
    // Highlight the source wallet
    if (node.id.toLowerCase() == sourceWallet.toLowerCase()) {
        return "#f32212";
    }
    else {
        return "#000000";
    }
}