let svgMap = d3.select("svg#map");

let tooltip = d3.select("body").append("div")
.attr("class", "tooltip")
.style("opacity", 0);

// let year = +d3.select('h2.year').text();

// var unemployment = d3.map();
var zhvi = d3.map();

var path = d3.geoPath();
// var colorMap = d3.scaleQuantize([10000, 600000], d3.schemeBlues[9]);

var colorMap = d3.scaleThreshold()
.domain([50000, 100000, 150000, 200000, 250000, 300000, 350000])
.range(d3.schemeBlues[8])

var x = d3.scaleLinear()
.domain([10000, 400000])
.rangeRound([600, 860]);

var gMap = svgMap.append("g")
.attr("class", "key")
.attr("transform", "translate(0,40)");

gMap.selectAll("rect")
.data(colorMap.range().map(function (d) {
    d = colorMap.invertExtent(d);
    if (d[0] == null) d[0] = x.domain()[0];
    if (d[1] == null) d[1] = x.domain()[1];
    return d;
}))
.enter().append("rect")
.attr("height", 8)
.attr("x", d => x(d[0]))
.attr("width", d => x(d[1]) - x(d[0]))
.attr("fill", d => colorMap(d[0]));

gMap.append("text")
.attr("class", "caption")
.attr("x", x.range()[0])
.attr("y", -6)
.attr("fill", "#000")
.attr("text-anchor", "start")
.attr("font-weight", "bold")
.text("Median House Value (2020)");

gMap.call(d3.axisBottom(x)
.tickSize(13)
.tickFormat((x, i) => i ? format(x) : `$${format(x)}`)
.tickValues(colorMap.domain()))
.select(".domain")
.remove();

var promises = [
    d3.json("https://d3js.org/us-10m.v2.json"),
    // d3.tsv("unemployment.tsv", d => unemployment.set(d.id, +d.rate))
    // d3.csv("data/County_Zhvi_AllHomes.csv", updateZhvi),
    d3.csv("https://raw.githubusercontent.com/usf-cs360-spring2020/project-pkhambat1/gh-pages/data/_County_Zhvi_AllHomes.csv", updateZhvi)
]

Promise.all(promises).then(ready)

function ready([us]) {
    console.log('ready');    
    svgMap.append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter()
    .append("path")
    .attr('class', d => zhvi.get(d.id) ? 'county' : '')
    .attr('fill', d => zhvi.get(d.id) ? colorMap(zhvi.get(d.id).medianPrice) : '')
    .attr("d", path)
    
    svgMap.append("path")
    .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
    .attr("class", "states border interior")
    .attr("d", path);
    
    // draw exterior borders
    svgMap.append("path")
    .datum(topojson.mesh(us, us.objects.states, (a, b) => a === b))
    .attr("class", "border exterior")
    .attr("d", path);
    
    svgMap.selectAll('.county')
    .on("mouseover", function(d) {
        // console.log(d);
        console.log(d.id);
        plotLine(d.id);
        let info = zhvi.get(d.id);
        d3.select('span#county').text(`${info.county} - Median House Value Time Series`).style('font-style', '').style('color', '');
        tooltip.transition()
        .duration(250)
        .style("opacity", 1);
        tooltip.html(`<p><strong>${info.county}</strong>${info.metro ? `, ${info.metro}` : ''}, ${info.state}</p>
        <table>
        <tbody>
        <tr style="border-top: 1px solid grey;">
        <td style="width:220px;">Median House Value in 2020:</td>
        <td style="text-align:right;"><strong>$${format2(info.medianPrice)}</strong></td>
        </tr>
        <tr>
        <td>County Size Rank</td>
        <td style="text-align:right;"><strong>${format2(info.sizeRank)}</strong></td>
        </tr>     
        </tbody>
        </table>`)
        .style("left", `${d3.event.pageX + 15}px`)
        .style("top", `${d3.event.pageY - 28}px`);
        
        d3.select(this)
        .attr("stroke", "red")
        .attr('stroke-width', 1.5)
        .raise();
    })
    .on("mouseout", function(d) {
        tooltip.transition()
        .duration(250)
        .style("opacity", 0);
        
        d3.select(this)
        .attr("stroke", null)
        .lower();
        
        d3.select('span#county').text('Hover over county for Median House Value Details').style('font-style', 'italic').style('color', 'grey');
        clearLine();
    });
}

function updateZhvi(d) {
    // filter out null median price values and get latest median value
    if (!d['Median Price'] || d.Date !== '2020-03-31') {
        return;
    }
    zhvi.set(d['County ID'], wrangle(d));
}

