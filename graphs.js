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
        const annualSales = d3.rollups(
            cleanedData,
            games => d3.sum(games, d => d.Global_Sales),
            d => d.Year
        )
        .map(d => ({
            year: d[0],
            sales: d[1]
        }))
        .sort((a,b) => a.year - b.year);

        console.log("Annual sales:", annualSales);

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
    }

    cleanedDataGlobal = cleanedData;

    window.drawScene1 = drawScene1;
    window.drawScene2 = drawScene2;
    window.drawScene3 = drawScene3;

    showScene(1);
});