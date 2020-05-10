const parseTime = d3.timeParse("%Y-%m-%d");
const format = d3.format(".2s");
const format2 = d3.format(",");
let gData;
    
function wrangle(d) {
    return {
        metro: d.Metro,
        date: parseTime(d.Date),
        medianPrice: +d['Median Price'],
        county: d['Region Name'],
        countyId: d['County ID'],
        sizeRank: +d['Size Rank'],
        state: d.State
    };
}