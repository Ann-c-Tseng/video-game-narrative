let currentScene = 1;

function showScene(sceneNumber) {
    currentScene = sceneNumber;

    d3.select("#chart").html("");
    d3.select("#controls").html("");
    d3.select("#annotations").html("");

    if(currentScene === 1) {
        d3.select("#scene-title h2").text("Scene 1");
        d3.select("#scene-title h3").text("How did physical console game sales grow worldwide?");
        drawScene1(cleanedDataGlobal);
        d3.select("#annotations").html(`
            <h3>Narrative Insight Annotation:</h3>
            <p> Global physical console video game sales reached their highest annual total around 2008, 
            marking the peak of the physical console era before annual sales began to decline.
            While the dataset focuses on physical console game sales, the industry has continued to evolve. 
            Mobile and PC gaming have become increasingly important, changing how games are purchased and contribute
            to the decline.
            </p>
            <p><strong>Interaction:</strong> Hover over points on the line to see the exact year and global sales value.</p>
        `);
    }

    if(currentScene === 2) {
        d3.select("#scene-title h2").text("Scene 2");
        d3.select("#scene-title h3").text("Which platforms powered the growth?");
        drawScene2(cleanedDataGlobal);
        d3.select("#annotations").html(`
            <h3>Narrative Insight Annotation:</h3>
            <p> 
            The PlayStation 2 (PS2) is the best-selling and most popular video game console of all time.
            This illustrates how a few dominant consoles were responsible for much of the industry's worldwide growth. 
            The top platforms shown here represent some of the most influential gaming systems during the physical 
            console era.
            </p>
            <p><strong>Interaction:</strong> Hover over each bar to view its total worldwide game sales. </p>
        `);
    }

    if(currentScene === 3) {
        d3.select("#scene-title h2").text("Scene 3");
        d3.select("#scene-title h3").text("How did genre preferences differ across world regions?");
        drawScene3(cleanedDataGlobal);
        d3.select("#annotations").html(`
            <h3>Narrative Insight Annotation:</h3><p> 
            Most regions favored Action games, while Japan uniquely favored Role-Playing games. 
            This contrast highlights how regional gaming preferences shaped the global video game market. 
            </p>
            <p><strong>Interaction:</strong> 
            Select a region from the dropdown to compare genre preferences across different world regions. 
            Hover over each bar to view the exact game sales. 
            </p>
        `);
    }

    updateButtonsVisibility();
}

function updateButtonsVisibility() {
    d3.select("#prevBtn").style("visibility", currentScene === 1 ? "hidden" : "visible");
    d3.select("#nextBtn").style("visibility", currentScene === 3 ? "hidden" : "visible");  
}

d3.select("#nextBtn").on("click", function() {
    if(currentScene < 3) {
        showScene(currentScene + 1);
    }
});

d3.select("#prevBtn").on("click", function() {
    if(currentScene > 1) {
        showScene(currentScene - 1);
    }
});