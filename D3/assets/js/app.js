// Define the radius of the state circles.  Then use that radius
// to calculate the font size we should use within those circles.
// This should be roughly 85% of the circle size.
const circleRadius = "10";
function getCircleFont(radius){
    var fontSize = Math.round(+circleRadius * 0.85);
    return fontSize;
}

var circleFontSize = getCircleFont(circleRadius);

console.log(`Circle Radius: ${circleRadius}`);
console.log(`Circle Font Size: ${circleFontSize}`);

// Set the initial x and y variables.
var xVar = 'poverty';
var yVar = 'healthcare';

// Create a descriptions to go with each of the x and y variables
// Set those to blank here (so they are global).  
var xVarDesc = '';
var yVarDesc = '';

// Create a function to set (or reset) the description.
function getDesc(varIn){
    if (varIn === 'poverty'){
        var desc = '% in Poverty';
    }
    else if (varIn === 'age'){
        var desc = 'Median Age';
    }
    else if (varIn === 'income'){
        var desc = 'Median Income';
    }
    else if (varIn === 'healthcare'){
        var desc = '% without Health Care';
    }
    else if (varIn === 'obesity'){
        var desc = '% Obese';
    }
    else {
        var desc = '% Smokers';
    }

    return desc;
}

// Use the function to populate the initial values of the descriptions.
xVarDesc = getDesc(xVar);
yVarDesc = getDesc(yVar);

// Define the chart's margins as an object
var margin = {
  top: 40,
  right: 120,
  bottom: 140,
  left: 120
};


function setXLinear(dataIn,xVar,chartWidth){

    // set the linear scale for the xaxis based on the variable selected
    // Go a little past the high/low value to allow for circle radius to be within the chart.
    var xLinearScale = d3.scaleLinear()
        .range([0, chartWidth])
        .domain([d3.min(dataIn, d => d[xVar])*0.85,d3.max(dataIn, d => d[xVar])*1.15]);

    return xLinearScale;
}


function setYLinear(dataIn,yVar,chartHeight){

    // set the linear scale for the yaxis based on the variable selected
    // Go a little past the high/low value to allow for circle radius to be within the chart.
    var yLinearScale = d3.scaleLinear()
        .range([chartHeight,0])
        .domain([d3.min(dataIn, d => d[yVar])*0.85,d3.max(dataIn, d => d[yVar])*1.15]);

    return yLinearScale;
}

function resetXAxis(newXScale, xAxis) {

    var newXAxis = d3.axisBottom(newXScale);

    xAxis.transition()
      .duration(1000)
      .call(newXAxis);
  
    return xAxis;
}

function resetYAxis(newYScale,yAxis2Use){

    // Create the variable for the y axis
    var newYAxis = d3.axisLeft(newYScale);

    // create or transition to this new y axis
    yAxis2Use.transition()
        .duration(1200)
        .call(newYAxis);

    return yAxis2Use;
}

function resetCircleLocation(makeCircles,newXScale,newXVar,newYScale,newYVar){

    // Go to the existing circles and transition to the new x/y locations
    makeCircles.transition()
        .duration(1200)
        .attr("cx", d => newXScale(d[newXVar]))
        .attr("cy", d => newYScale(d[newYVar]));

    return makeCircles;

}

function resetCircleText(makeCircleText,newXScale,newXVar,newYScale,newYVar){

    // Go to the existing circles text and transition to the new x/y locations
    makeCircleText.transition()
        .duration(1200)
        .attr("x", d => newXScale(d[newXVar]))
        .attr("y", d => newYScale(d[newYVar]));

    return makeCircleText;

}

function setPopUps(makeCircles,newXVar,newYVar){

    // Add tooltip text
    if (newXVar === 'income'){
        var toolTip = d3.tip()
            .html(d =>
                `${d.state}<br>
                ${xVarDesc}: $${d[newXVar].toLocaleString()}<br>
                ${yVarDesc}: ${d[newYVar]}`
            )
            .attr('class','d3-tip');
    }
    else {
        var toolTip = d3.tip()
            .html(d =>
                `${d.state}<br>
                ${xVarDesc}: ${d[newXVar]}<br>
                ${yVarDesc}: ${d[newYVar]}`
            )
            .attr('class','d3-tip');
    }

    // Bind the tool tip to the circles.
    makeCircles.call(toolTip);

    // Create "mouseover" event listener to display tooltip
    makeCircles.on("mouseover", toolTip.show)
        .on("mouseout",toolTip.hide);

    return toolTip;
}


// The makeResponsive function will do several things:
// 1. It reads in the data and generates our initial graph
// 2. It automatically detects the window size and fits the 
//    graph to that window.
// 3. It is run whenever the window is resized so that the 
//    graph will always be the right size for the window.
function makeResponsive() {
  
  // Select the div from the HTML file that holds the scatter plot.
  // Remove any contents from previous re-sizes (if any).
  var scatterArea = d3.select("#scatter") 
    .append("div")
    .classed("chart",true)
    .remove();

  var svgArea = d3.select(".chart").remove();

  
  // Define SVG area dimensions as the height and width of the window.
  var svgHeight = 3 * window.innerHeight /4;
  var svgWidth = 3 * window.innerWidth /4;

  // Define dimensions of the chart area
  var chartWidth = svgWidth - margin.left - margin.right;
  var chartHeight = svgHeight - margin.top - margin.bottom;

  console.log( `resize chart to ${chartWidth} x ${chartHeight}`);

  // Now that we have an empty scatter area and know our dimensions,
  // we can append a div with class chart (from css).
  var chartHolder =  d3.select("#scatter")
    .append("div")
    .classed("chart",true)

  // Now add the svg element to the page. Set height and width 
  // according to svg dimensions and margins.
  var svgHolder = chartHolder.append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // Create a chart group area.  Use transformand translate determine axis placement.
  var chartGroup = svgHolder.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Load data from the csv file
  d3.csv("assets/data/data.csv").then(function(dataIn) {

    //if (error) throw error;

    // Cast key variables as a number using the unary + operator
    dataIn.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    // Use functions to set the linear scales.
    var xScale2Use = setXLinear(dataIn,xVar,chartWidth);
    var yScale2Use = setYLinear(dataIn,yVar,chartHeight);

    // Set intial axes.
    var bottomAxis = d3.axisBottom(xScale2Use);
    var leftAxis = d3.axisLeft(yScale2Use);

    // append axes
    var xAxis2Use = chartGroup.append("g")
        .classed("x-axis",true)
        .attr("transform", `translate(0,${chartHeight})`)
        .call(bottomAxis);

    var yAxis2Use = chartGroup.append("g")
        .classed("y-axis",true)
        .call(leftAxis); 

    // append circles
    var makeCircles = chartGroup.selectAll("circle")
        .data(dataIn)
        .enter()
        .append("circle")
        .attr("cx", d => xScale2Use(d[xVar]))
        .attr("cy", d => yScale2Use(d[yVar]))
        .attr("r",circleRadius)
        .classed("stateCircle",true);
        
    // append text within the circles
    var makeCircleText = chartGroup.selectAll(".stateText")
        .data(dataIn)
        .enter()
        .append("text")
        .classed("stateText",true)
        .attr("x", d => xScale2Use(d[xVar]))
        .attr("y", d => yScale2Use(d[yVar]))
        .attr("dy",3)
        .attr("font-size",`${circleFontSize}px`)
        .text(d => d.abbr);
 
    // Add tooltip text and bind to the too tip
    var toolTip = setPopUps(makeCircles,xVar,yVar);
        
    // Create the x-axis links and labels.  
    // Center this midway along the x-axis (using chart width) and
    //   below the x-axis (using chart height)
    var xChoices = chartGroup.append("g")
        .attr("transform",`translate(${chartWidth/2},${chartHeight + 20 + margin.top})`);

    // Start adding the actual choices as text.  Since we start with poverty,
    // set that to active and the others to inactive.
    var xChoice1 = xChoices.append("text")
        .text(getDesc('poverty'))
        .attr('value','poverty')
        .attr("x",0)
        .attr("y",20)
        .classed("active",true)
        .classed("aText",true)
    var xChoice2 = xChoices.append("text")
        .text(getDesc('age'))
        .attr('value','age')
        .attr("x",0)
        .attr("y",40)
        .classed("inactive",true)
        .classed("aText",true)
    var xChoice3 = xChoices.append("text")
        .text(getDesc('income'))
        .attr('value','income')
        .attr("x",0)
        .attr("y",60)
        .classed("inactive",true)
        .classed("aText",true)

    // Similar to the x-choices, create and populate y choices
    // Space these mid-way along the left axis and rotated 90 degrees counter clockwise
    var yChoices = chartGroup.append("g")
        .attr("transform", `translate(${0 - margin.left/4}, ${(chartHeight/2)})`);

    var yChoice1 = yChoices.append("text")
        .text(getDesc('healthcare'))
        .attr('value','healthcare')
        .attr("x",0)
        .attr("y", -20)
        .attr("transform","rotate(270)")
        .classed("active",true)
        .classed("aText",true)
    var yChoice2 = yChoices.append("text")
        .text(getDesc('smokes'))
        .attr('value','smokes')
        .attr("x",0)
        .attr("y", -40)
        .attr("transform","rotate(270)")
        .classed("inactive",true)
        .classed("aText",true)
    var yChoice3 = yChoices.append("text")
        .text(getDesc('obesity'))
        .attr('value','obesity')
        .attr("x",0)
        .attr("y", -60)
        .attr("transform","rotate(270)")
        .classed("inactive",true)
        .classed("aText",true)

    // Set up an event listener to "hear" and respond to a click on any of the x axis choices.
    xChoices.selectAll("text").on("click",function(){

        // determine what was clicked
        var xClicked = d3.select(this).attr('value');
        console.log(`X-Axis changed to ${xClicked}.`);

        // If this is something OTHER than the active xVar 
        // then we need to reset everything associated with that xVar.
        if (xClicked != xVar){

            // Update the values of variables.
            xVar = xClicked;
            xVarDesc = getDesc(xVar);
            xScale2Use = setXLinear(dataIn,xVar,chartWidth);
          
            // Use the reset functions to transition the display.
            makeCircles = resetCircleLocation(makeCircles,xScale2Use,xVar,yScale2Use,yVar);
            makeCircleText = resetCircleText(makeCircleText,xScale2Use,xVar,yScale2Use,yVar);
            var tooTip = setPopUps(makeCircles,xVar,yVar);
            xAxis2Use = resetXAxis(xScale2Use, xAxis2Use);

            // Reset the x-axis labels with the newly selected variable active and others inactive.
            if (xClicked === "poverty") {
                xChoice1.classed("active", true).classed("inactive", false);
                xChoice2.classed("active", false).classed("inactive", true);
                xChoice3.classed("active", false).classed("inactive", true);
            }
            else if (xClicked === "age") {
                xChoice1.classed("active", false).classed("inactive", true);
                xChoice2.classed("active", true).classed("inactive", false);
                xChoice3.classed("active", false).classed("inactive", true);
            }
            else {
                xChoice1.classed("active", false).classed("inactive", true);
                xChoice2.classed("active", false).classed("inactive", true);
                xChoice3.classed("active", true).classed("inactive", false);
            }


        }

    });

    
    // Set up an event listener to "hear" and respond to a click on any of the y axis choices.
    yChoices.selectAll("text").on("click",function(){

        // determine what was clicked
        var yClicked = d3.select(this).attr('value');
        console.log(`Y-Axis changed to ${yClicked}.`);

        // If this is something OTHER than the active xVar 
        // then we need to reset everything associated with that xVar.
        if (yClicked != yVar){

            // Update the values of variables.
            yVar = yClicked;
            yVarDesc = getDesc(yVar);
            yScale2Use = setYLinear(dataIn,yVar,chartHeight);
          
            // Use the reset functions to transition the display.
            makeCircles = resetCircleLocation(makeCircles,xScale2Use,xVar,yScale2Use,yVar);
            makeCircleText = resetCircleText(makeCircleText,xScale2Use,xVar,yScale2Use,yVar);
            var tooTip = setPopUps(makeCircles,xVar,yVar);
            yAxis2Use = resetYAxis(yScale2Use, yAxis2Use);

            // Reset the x-axis labels with the newly selected variable active and others inactive.
            if (yClicked === "healthcare") {
                yChoice1.classed("active", true).classed("inactive", false);
                yChoice2.classed("active", false).classed("inactive", true);
                yChoice3.classed("active", false).classed("inactive", true);
            }
            else if (yClicked === "smokes") {
                yChoice1.classed("active", false).classed("inactive", true);
                yChoice2.classed("active", true).classed("inactive", false);
                yChoice3.classed("active", false).classed("inactive", true);
            }
            else {
                yChoice1.classed("active", false).classed("inactive", true);
                yChoice2.classed("active", false).classed("inactive", true);
                yChoice3.classed("active", true).classed("inactive", false);
            }


        }

    });

  });

};

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);
