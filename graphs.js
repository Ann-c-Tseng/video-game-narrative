let cleanedDataGlobal = [];

d3.csv("data/vgsales.csv").then(data => {
    const cleanedData = data.filter(d => d.Year !== "" && d.Year !== "N/A")
    .map(d => ({
        Rank: +d.Rank,
        Name: d.Name,
        Platform: d.Platform,
        Year: +d.Year,
        Genre: d.Genre,
        Publisher: d.Publisher,
        NA_Sales: +d.NA_Sales,
        EU_Sales: +d.EU_Sales,
        JP_Sales: +d.JP_Sales,
        Other_Sales: +d.Other_Sales,
        Global_Sales: +d.Global_Sales
    }));

    function drawScene1(cleanedData) {
        //Years 2017 and beyond have not much global sales data to support. So cut those years for a more accurate graph.
        const scene1Data = cleanedData.filter(d => d.Year <= 2016);
        const annualSales = d3.rollups(
            scene1Data,
            games => d3.sum(games, d => d.Global_Sales),
            d => d.Year
        )
        .map(d => ({
            year: d[0],
            sales: d[1]
        }))
        .sort((a,b) => a.year - b.year);

        console.log("Annual sales up to 2016, inclusive:", annualSales);

        const width = 900;
        const height = 450;
        const margin = {
            top: 40,
            right: 40,
            bottom: 60,
            left: 70
        };

        d3.select('#chart').html("");

        const svg = d3.select("#chart").append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("width", "100%").attr("height", "100%");

        const xScale = d3.scaleLinear().domain(d3.extent(annualSales, d => d.year)).range([margin.left, width - margin.right]);
        const yScale = d3.scaleLinear().domain([0, d3.max(annualSales, d => d.sales)]).nice().range([height - margin.bottom, margin.top]);

        const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
        const yAxis = d3.axisLeft(yScale);

        svg.append("g").attr("transform", `translate(0, ${height - margin.bottom})`).call(xAxis);
        svg.append("g").attr("transform", `translate(${margin.left}, 0)`).call(yAxis);

        svg.append("text").attr("x", width/2).attr("y", height-15).attr("text-anchor", "middle").attr("class", "axis-label").text("Release Year");
        svg.append("text").attr("transform", "rotate(-90)").attr("x", -height/2).attr("y", 20).attr("text-anchor", "middle").attr("class", "axis-label").text("Total Global Sales (millions of copies sold)");

        const lineGenerator = d3.line().x(d => xScale(d.year)).y(d => yScale(d.sales));
        svg.append("path").datum(annualSales).attr("fill", "none").attr("stroke", "black").attr("stroke-width", 2.5).attr("d", lineGenerator);
    
        //Annotation
        const peak = annualSales.reduce((a,b) => b.sales > a.sales ? b:a);

        svg.append("circle").attr("cx", xScale(peak.year)).attr("cy", yScale(peak.sales)).attr("r", 5).attr("fill", "red");
        svg.append("line").attr("x1", xScale(peak.year)).attr("y1", yScale(peak.sales)).attr("x2", xScale(2011)).attr("y2", yScale(700)).attr("stroke", "red").attr("stroke-width", 2);
        svg.append("text").attr("x", xScale(2009)).attr("y", yScale(710)).attr("class", "annotation-text").text(`Global sales peaked in ${peak.year}`);

        //Hover tooltip
        let tooltip = d3.select(".tooltip");
        if(tooltip.empty()) {
            tooltip = d3.select("body").append("div").attr("class", "tooltip");
        }
        svg.selectAll(".hover-point").data(annualSales).enter().append("circle").attr("class", "hover-point").attr("cx", d=> xScale(d.year)).attr("cy", d => yScale(d.sales)).attr("r", 4).attr("fill", "white").attr("stroke", "black").attr("stroke-width", 1.5)
            .on("mouseover", function(event, d) {
                d3.select(this.parentNode).append("circle").attr("class", "hover-highlight").attr("cx", xScale(d.year)).attr("cy", yScale(d.sales)).attr("r", 4).attr("fill", "red").style("pointer-events", "none").attr("stroke", "black").attr("stroke-width", 1.5);

                tooltip.style("display", "block").html(`
                    <strong>${d.year}</strong><br>
                    Global Sales: ${d.sales.toFixed(2)} million copies sold
                `);
            })
            .on("mousemove", function(event) {
                tooltip.style("left", `${event.pageX + 14}px`).style("top", `${event.pageY - 28}px`);
            })
            .on("mouseout", function() {
                svg.selectAll(".hover-highlight").remove();
                tooltip.style("display", "none");
            });
    }

    function drawScene2(cleanedData) {
        const platformSales = d3.rollups(
            cleanedData,
            games => d3.sum(games, d => d.Global_Sales),
            d => d.Platform
        )
        .map(d => ({
            platform: d[0],
            sales: d[1]
        }))
        .sort((a,b) => b.sales - a.sales)
        .slice(0,10);

        console.log("Platform sales:", platformSales);

        const width = 900;
        const height = 450;
        const margin = {
            top: 40,
            right: 40,
            bottom: 60,
            left: 70
        };

        d3.select('#chart').html("");

        const svg = d3.select("#chart").append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("width", "100%").attr("height", "100%");

        const xScale = d3.scaleBand().domain(platformSales.map(d => d.platform)).range([margin.left, width - margin.right]).padding(0.5);
        const yScale = d3.scaleLinear().domain([0, d3.max(platformSales, d => d.sales)]).nice().range([height - margin.bottom, margin.top]);

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        svg.append("g").attr("transform", `translate(0, ${height - margin.bottom})`).call(xAxis);
        svg.append("g").attr("transform", `translate(${margin.left}, 0)`).call(yAxis);

        svg.append("text").attr("x", width/2).attr("y", height-15).attr("text-anchor", "middle").attr("class", "axis-label").text("Platform");
        svg.append("text").attr("transform", "rotate(-90)").attr("x", -height/2).attr("y", 20).attr("text-anchor", "middle").attr("class", "axis-label").text("Total Global Sales (millions of copies sold)");

        svg.selectAll("rect").data(platformSales).enter().append("rect").attr("x", d => xScale(d.platform)).attr("y", d => yScale(d.sales)).attr("width", xScale.bandwidth()).attr("height", d => height - margin.bottom - yScale(d.sales)).attr("fill", "grey");
        
        //Annotation
        const bestPlatform = platformSales[0];
        svg.append("circle").attr("cx", xScale(bestPlatform.platform) + xScale.bandwidth()/2).attr("cy", yScale(bestPlatform.sales)).attr("r", 4).attr("fill", "red");
        svg.append("line").attr("x1", xScale(bestPlatform.platform) + xScale.bandwidth()/2).attr("y1", yScale(bestPlatform.sales)).attr("x2", 250).attr("y2", 30).attr("stroke", "red").attr("stroke-width", 2); 
        svg.append("text").attr("x", 255).attr("y", 35).attr("class", "annotation-text").text("PlayStation 2 dominated global sales");
        
        //Hover tooltip
        let tooltip = d3.select(".tooltip");
        if (tooltip.empty()) {
            tooltip = d3.select("body").append("div").attr("class", "tooltip");
        }

        svg.selectAll("rect").on("mouseover", function(event, d) {
            d3.select(this).attr("fill", "red");

            tooltip.style("display", "block").html(`
                <strong>${d.platform}</strong><br>
                Global Sales: ${d.sales.toFixed(2)} million copies sold
            `);
        }).on("mousemove", function(event) {
                tooltip.style("left", `${event.pageX + 14}px`).style("top", `${event.pageY - 28}px`);
        }).on("mouseout", function() {
            d3.select(this).attr("fill", "grey");
            tooltip.style("display", "none");
        });
    }

    function drawScene3(cleanedData, regionColumn = "NA_Sales") {
        const regionLabels = {
            NA_Sales: "North America",
            EU_Sales: "Europe",
            JP_Sales: "Japan",
            Other_Sales: "Other Regions"
        };

        const genreSales = d3.rollups(
            cleanedData,
            games => d3.sum(games, d => d[regionColumn]),
            d => d.Genre
        )
        .map(d => ({
            genre: d[0],
            sales: d[1]
        }))
        .sort((a,b) => a.sales - b.sales);

        console.log("Genre sales:", genreSales);

        const width = 900;
        const height = 450;
        const margin = {
            top: 40,
            right: 40,
            bottom: 60,
            left: 70
        };

        d3.select('#chart').html("");
        d3.select("#controls").html("");

        d3.select("#controls").append("label").attr("for", "regionSelect").text("Choose region: ");
        d3.select("#controls").append("select").attr("id", "regionSelect").selectAll("option").data([
            { label: "North America", value: "NA_Sales" },
            { label: "Europe", value: "EU_Sales" },
            { label: "Japan", value: "JP_Sales" },
            { label: "Other Regions", value: "Other_Sales" }
        ]).enter().append("option").attr("value", d => d.value).text(d => d.label);
        d3.select("#regionSelect").property("value", regionColumn).on("change", function() {
            drawScene3(cleanedData, this.value);
        });

        const svg = d3.select("#chart").append("svg").attr("viewBox", `0 0 ${width} ${height}`).attr("width", "100%").attr("height", "100%");

        const xScale = d3.scaleBand().domain(genreSales.map(d => d.genre)).range([margin.left, width - margin.right]).padding(0.5);
        const yScale = d3.scaleLinear().domain([0, d3.max(genreSales, d => d.sales)]).nice().range([height - margin.bottom, margin.top]);

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        svg.append("g").attr("transform", `translate(0, ${height - margin.bottom})`).call(xAxis);
        svg.append("g").attr("transform", `translate(${margin.left}, 0)`).call(yAxis);

        svg.append("text").attr("x", width/2).attr("y", height-15).attr("text-anchor", "middle").attr("class", "axis-label").text("Game Genre");
        svg.append("text").attr("transform", "rotate(-90)").attr("x", -height/2).attr("y", 20).attr("text-anchor", "middle").attr("class", "axis-label").text(`${regionLabels[regionColumn]} Sales (millions of copies sold)`);


        svg.selectAll("rect").data(genreSales).enter().append("rect").attr("x", d => xScale(d.genre)).attr("y", d => yScale(d.sales)).attr("width", xScale.bandwidth()).attr("height", d => height - margin.bottom - yScale(d.sales)).attr("fill", "grey");
    
        //Annotation
        const topGenre = genreSales[genreSales.length - 1];
        const annotationText = {
            NA_Sales: "Action games were the most popular genre for North American sales",
            EU_Sales: "Action games were the most popular genre for European sales",
            JP_Sales: "Role-Playing games were the most popular genre for Japanese sales",
            Other_Sales: "Action games were the most popular genre for other regions"
        };
        svg.append("circle").attr("cx", xScale(topGenre.genre) + xScale.bandwidth()/2).attr("cy", yScale(topGenre.sales)).attr("r", 5).attr("fill", "red");
        svg.append("line").attr("x1", xScale(topGenre.genre) + xScale.bandwidth()/2).attr("y1", yScale(topGenre.sales)).attr("x2", width - 330).attr("y2", 40).attr("stroke", "red").attr("stroke-width", 2);
        svg.append("text").attr("x", width - 480).attr("y", 32).attr("class", "annotation-text").text(annotationText[regionColumn]);
    
        //Hover tooltip
        let tooltip = d3.select(".tooltip");

        if (tooltip.empty()) {
            tooltip = d3.select("body").append("div").attr("class", "tooltip");
        }

        svg.selectAll("rect").on("mouseover", function(event, d) {
            d3.select(this).attr("fill", "red");
            tooltip.style("display", "block").html(`
                <strong>${d.genre}</strong><br>
                ${regionLabels[regionColumn]} sales: ${d.sales.toFixed(2)} million copies sold
            `);
        })
        .on("mousemove", function(event) {
            tooltip.style("left", `${event.pageX + 14}px`).style("top", `${event.pageY - 28}px`);
        })
        .on("mouseout", function() {
            d3.select(this).attr("fill", "grey");
            tooltip.style("display", "none");
        });
    }

    cleanedDataGlobal = cleanedData;

    window.drawScene1 = drawScene1;
    window.drawScene2 = drawScene2;
    window.drawScene3 = drawScene3;

    showScene(1);
});