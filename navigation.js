let currentScene = 1;

function showScene(sceneNumber) {
    currentScene = sceneNumber;

    d3.select("#chart").html("");
    d3.select("#controls").html("");
    d3.select("#annotations").html("");

    if(currentScene === 1) {
        d3.select("#scene-title h2").text("Scene 1");
        d3.select("#scene-title h3").text("How did video games become a global phenomenon?");
        drawScene1(cleanedDataGlobal);
    }

    if(currentScene === 2) {
        d3.select("#scene-title h2").text("Scene 2");
        d3.select("#scene-title h3").text("Which console drove that growth?");
        drawScene2(cleanedDataGlobal);
    }

    if(currentScene === 3) {
        d3.select("#scene-title h2").text("Scene 3");
        d3.select("#scene-title h3").text("How did gaming preferences differ across regions?");
        drawScene3(cleanedDataGlobal);
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