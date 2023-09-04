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

function MakeResultList(resultids, recipes) {
    let result_div = document.getElementById("resultlist");
    let result_list = document.createElement("ul");
    result_div.appendChild(result_list);

    for (id of resultids) {
        let item = document.createElement("li");
        let recipe = recipes[id];
        item.innerText = recipe.name;
        item.id = id;
        item.addEventListener('click', function (e) {
            SelectResult(item.id, recipe);
        });
        result_list.appendChild(item);
    }
}

function SelectResult(id, recipe) {
    var idxelem = document.getElementById(id);

    Array.prototype.filter.call(idxelem.parentNode.children, function (siblings) {
                        siblings.className = 'unselected';
    });
    idxelem.className = 'selected';

    ShowRecipe(recipe);
}

function ShowRecipe(recipe) {
    let resultDiv = document.createElement("div");
    resultDiv.id = 'recipe';

    let nameHeader = document.createElement("h1");
    nameHeader.innerText = recipe.name;
    resultDiv.appendChild(nameHeader);

    let metaPara = document.createElement("p");
    metaPara.innerText = recipe.meta.join(" ");
    resultDiv.appendChild(metaPara);

    let ingredientsHeader = document.createElement("h2");
    ingredientsHeader.innerText = "Ingredients";
    resultDiv.appendChild(ingredientsHeader);

    let ingredientsPara = document.createElement("p");
    for (ingredient of recipe.ingredients) {
        ingredientsPara.appendChild(document.createTextNode(ingredient));
        ingredientsPara.appendChild(document.createElement('br'));
        var br = document.createElement("br");
    }
    resultDiv.appendChild(ingredientsPara);

    let directionsHeader = document.createElement("h2");
    // TODO: handle paragraph breaks, (and other markdown formatting?)
    directionsHeader.innerText = "Directions";
    resultDiv.appendChild(directionsHeader);

    let directionsPara = document.createElement("p");
    directionsPara.innerText = recipe.directions.join(" ");
    resultDiv.appendChild(directionsPara);
     
    let oldResult = document.getElementById("recipe");
    oldResult.replaceWith(resultDiv);
}

function SetupPage() {
    // temporary hack: list of indices of recipes to return
    let resultids = [0, 1];

    MakeResultList(resultids, recipe_data);

    let recipe = recipe_data[resultids[0]];
    ShowRecipe(recipe);
}

function ReadRecipes() {
    Promise.all(recipe_titles.map(x => fetch(x)))
      .then(result => Promise.all(result.map(v => v.text())))
      .then(results => ParseRecipes(results))
      .then(x => SetupPage(x));
}

window.onload = ReadRecipes;

