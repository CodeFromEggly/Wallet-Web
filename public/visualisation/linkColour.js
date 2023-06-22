/* 
Input a link's transaction value and return the link's colour
*/
export const linkColour = function (val, links)  {
    

    // Find min and max value of links' objects
    // TODO I might want to do this before I call linkColour and pass [max, min] instead of links. Will have better idea when recursive upgrade in place
    let calculateMinMax = function(links) {
        let max = BigInt(links[0].value);
        let min = BigInt(links[0].value);
        links.forEach(link => {
            let curr = BigInt(link.value);
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
    val = BigInt(val);

    const denom = BigInt(10e6);    // Used to make BigInts smaller in next step so can convert to Number for division.
    let normal_val = Number((val - min) / denom) / Number((max - min) / denom); 

    // Use d3 colour scale
    const colourScale = d3.interpolateRgb('yellow', 'red');
  
    // Get the colour corresponding to the normalised value
    let colour = colourScale(normal_val);
  
    return colour;
};
