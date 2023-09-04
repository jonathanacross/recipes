/*jshint esversion: 6 */

function splitLines(t) { return t.split(/\r\n|\r|\n/); }

function ParseMarkdown(recipeMarkdown) {
    let lines = splitLines(recipeMarkdown);
    let recipeData = {
        name: "ERROR: RECIPE HAS NO NAME",
        meta: [],
        ingredients: [],
        directions: []
    };

    let mode = "skip";

    for (line of lines) {
        if (line.startsWith("# ")) {
            recipeData.name = line.substring(2); // remove '# '
            mode = "meta";
        }
        else if (line.startsWith("## Ingredients")) {
            mode = "ingredients";
        }
        else if (line.startsWith("## Directions")) {
            mode = "directions";
        }
        else {
            // normal line
            switch (mode) {
                case "meta":
                    recipeData.meta.push(line);
                    break;
                case "ingredients":
                    recipeData.ingredients.push(line);
                    break;
                case "directions":
                    recipeData.directions.push(line);
                    break;
                default:
                    break;
            }
        }
    }
    return recipeData;
}

function ParseRecipes(responses) {
    console.log("parserecipes");
    recipe_data = responses.map(x => ParseMarkdown(x));  // TODO: global variable fishiness
}

function MakeHtmlData(recipe) {
    let rDiv = document.createElement("div");
    rDiv.className = "recipe";

    let nameHeader = document.createElement("h1");
    nameHeader.innerText = recipe.name;
    rDiv.appendChild(nameHeader);

    let metaPara = document.createElement("p");
    metaPara.innerText = recipe.meta.join(" ");
    rDiv.appendChild(metaPara);

    let ingredientsHeader = document.createElement("h2");
    ingredientsHeader.innerText = "Ingredients";
    rDiv.appendChild(ingredientsHeader);

    let ingredientsPara = document.createElement("p");
    for (ingredient of recipe.ingredients) {
        ingredientsPara.appendChild(document.createTextNode(ingredient));
        ingredientsPara.appendChild(document.createElement('br'));
        var br = document.createElement("br");
    }
    rDiv.appendChild(ingredientsPara);

    let directionsHeader = document.createElement("h2");
    // TODO: handle paragraph breaks, (and other markdown formatting?)
    directionsHeader.innerText = "Directions";
    rDiv.appendChild(directionsHeader);

    let directionsPara = document.createElement("p");
    directionsPara.innerText = recipe.directions.join(" ");
    rDiv.appendChild(directionsPara);
     
    return rDiv;
}

function SetupPage() {
    let results = document.getElementById("results");
    for (recipe of recipe_data) {
        let div = MakeHtmlData(recipe);
        results.appendChild(div);
    }
}

function ReadRecipes() {
    Promise.all(recipe_titles.map(x => fetch(x)))
      .then(result => Promise.all(result.map(v => v.text())))
      .then(results => ParseRecipes(results))
      .then(x => SetupPage(x));

}

window.onload = ReadRecipes;

