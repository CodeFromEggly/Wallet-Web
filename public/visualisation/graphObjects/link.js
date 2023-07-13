/* 
    Link Presentation
*/
// Input a link's transaction value and return the link's colour
export const linkColour = function (val, links)  {
    

    // Find min and max value of links' objects
    // TODO I might want to do this before I call linkColour and pass [max, min] instead of links. Will have better idea when recursive upgrade in place
    let calculateMinMax = function(links) {
        let max = links[0].value;
        let min = links[0].value;
        links.forEach(link => {
            let curr = link.value;
            if (curr > max) {
                max = curr;
            }
            if (curr < min) {
                min = curr;
            }
        });
        max = max;
        min = min;
        return [max, min];
    };

    let [max, min] = calculateMinMax(links);
  
    // Normalise this value for use in colour scale
    let normal_val = (val - min) / (max - min); 

    // Use d3 colour scale
    const colourScale = d3.interpolateRgb('yellow', 'red');
  
    // Get the colour corresponding to the normalised value
    let colour = colourScale(normal_val);
  
    return colour;
};

/*
    Pointer Events
*/

// Keep track of the clicked links
const clickedLinks = {};
const linkTextElements = {};

// Immediate hide of text
export const linkHide = (event, d) => {
    console.log("hiding");
    const textElement = linkTextElements[d.index];
    console.log(textElement);

    if (textElement) {
        textElement.remove();
        delete linkTextElements[d.index];
    }
}

// Display text
export const linkClick = (svg, event, d) => {
  // Check if the link was clicked previously
  if (!clickedLinks[d.index]) {
    // If not, set the flag to true
    clickedLinks[d.index] = true;
  } else {
    // If yes, first hide the text immediately and then set the flag to false
    linkHide(event, d);
    clickedLinks[d.index] = false;
  }
}

// Display text (triggers linkUnHover)
export const linkHover = (g, event, d, currentZoomScale) => {
  console.log("received Zoom",currentZoomScale);
  // Only show the text if the link is not clicked
  if (!clickedLinks[d.index]) {
    // Calculate the coordinates for the text
    const x = (d.source.x + d.target.x) / 2;
    const y = (d.source.y + d.target.y) / 2;

    // Append the text to the SVG and store the reference
    const textElement = g.append("text")
      .attr("x", x)
      .attr("y", y)
      .attr("class", "link-hover-text")
      .text(`${d.value} ETH`)
      .style("font-size", (currentZoomScale < 1 ? 20 * currentZoomScale : 20 / currentZoomScale) + "px") // Couldn't tell you why I chose this but it looks how I want it to
      .style("fill", "white");

    // Store the reference to the text element
    linkTextElements[d.index] = textElement;
    console.log("zoom creating a font size of", 20 / currentZoomScale);

  }
}

// Removes text after 2 seconds
export const linkUnHover = (event, d) => {
    // Only fade the text if the link is not clicked
    // Retrieve the text element reference and fade it out
    if (clickedLinks[d.index] != true)
    {
        const textElement = linkTextElements[d.index];
        if (textElement) {
        textElement.transition().duration(2000)
            .style("opacity", 0)
            .remove();
        // Remove the reference from the object
        delete linkTextElements[d.index];
        console.log("Removed text element for link", d.index);

        }
    }
    
}

// Reroutes browser to Etherscan page for transcaction hash
export const linkDblClick = (event, d) => {
    window.location.href = 'https://etherscan.io/tx/' + encodeURIComponent(d.hash);
  }