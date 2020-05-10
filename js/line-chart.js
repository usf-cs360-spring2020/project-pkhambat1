let svgLine = d3.select("svg#line-chart"),
margin = {
    top: 20,
    right: 80,
    bottom: 30,
    left: 50
},
width = svgLine.attr("width") - margin.left - margin.right,
height = svgLine.attr("height") - margin.top - margin.bottom,
g = svgLine.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

var colorLine = d3.scaleOrdinal(d3.schemeCategory10);

var plotLine = (countyId) => {
    clearLine();
    let data = gData.filter(d =>
        d.countyId === countyId 
        && d.medianPrice > 0);
        data.sort((a, b) => a.date - b.date);
        console.log(data);
        var xLine = d3.scaleTime().range([0, width]),
        yLine = d3.scaleLinear().range([height, 0]);
        
        var xAxis = d3.axisBottom(xLine)
        .ticks(20);
        
        var yAxis = d3.axisLeft(yLine)
        .ticks(5, '.0s');
        
        // https://github.com/d3/d3-shape#lines
        var line = d3.line()
        .curve(d3.curveBasis)
        .x(d => xLine(d.date))
        .y(d => yLine(d.medianPrice));
        xLine.domain(d3.extent(data, d => d.date));
        
        yLine.domain(d3.extent(data, d => d.medianPrice));
        
        // make it really clear where the plot area is inside the svg
        var rect = g.append("rect")
        .attr("id", "plot")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height);
        
        
        g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .attr("color", "gray");
        
        g.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis)
        .attr("color", "gray")
        // ooo fancy text stuff so we can label our axis!
        .append("text")
        // we have seen translate transforms already
        // we can also rotate, but this form rotates around 0,0
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .text("Median Price, (USD)");
        
        // okay now we create a group per county
        // verify this in the elements view!
        var county = g.selectAll(".county")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "county");
        county.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", d => line(d))
        .style("stroke", d => colorLine(d.countyId));
    } 
    
    function clearLine() {
        g.selectAll('*').remove();
    }
    
    d3.csv('data/_County_Zhvi_AllHomes.csv', wrangle).then(data => gData = data);
