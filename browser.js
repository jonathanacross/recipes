/*jshint esversion: 6 */

function splitLines(t) { return t.split(/\r\n|\r|\n/); }

function ParseMarkdown(recipeMarkdown, id) {
    let lines = splitLines(recipeMarkdown);
    let recipeData = {
        id: id,
        name: "ERROR: RECIPE HAS NO NAME",
        meta: [],
        // raw lines from markdown
        ingredients: [],
        directions: [],
        // simple concatenated text stream from markdown 
        ingredients_text: "",
        directions_text: ""
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
    recipeData.ingredients_text = recipeData.ingredients.join(' ');
    recipeData.directions_text = recipeData.directions.join(' ');
    return recipeData;
}

function ParseRecipes(responses) {
    recipe_data = responses.map((x, idx) => ParseMarkdown(x, idx));  // TODO: global variable fishiness
    recipe_index = lunr(function () {
        this.ref('id')
        this.field('name', {boost: 5})
        this.field('ingredients_text', {boost: 2})
        this.field('directions_text')

        recipe_data.forEach(function (doc) { this.add(doc) }, this)
    })
}

// returns an ordered list of recipe ids
function Search(text) {
    let results = recipe_index.search(text);
    // results looks like:  
    //   [{ref: '27', score: 4.381},
    //    {ref: '25', score: 3.309},
    //    {ref: '0', score: 2.263},
    //    {ref: '22', score: 2.227}]
    let matching_indices = results.map(result => result.ref);
    return matching_indices;
}

function MakeResultList(resultids, recipes) {
    let result_div = document.getElementById("resultlist");

    // clear old results
    while (result_div.hasChildNodes()) {
        result_div.removeChild(result_div.lastChild);
    }

    let result_list = document.createElement("ol");
    result_div.appendChild(result_list);

    // TODO: revisit for .. of syntax: only good for properties? order not defined?
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

function SetupResults(resultids) {
    MakeResultList(resultids, recipe_data);

    let recipe = recipe_data[resultids[0]];
    ShowRecipe(recipe);
}

function doSearch() {
    let searchtext = document.getElementById("searchtext");
    if (searchtext.value !== "") {
        let resultids = Search(searchtext.value);

        SetupResults(resultids);
    }
}

function SetupPage() {
    let searchbutton = document.getElementById("searchbutton");
    searchbutton.addEventListener("click", doSearch);
}

function ReadRecipes() {
    Promise.all(recipe_titles.map(x => fetch(x)))
      .then(result => Promise.all(result.map(v => v.text())))
      .then(results => ParseRecipes(results))
      .then(x => SetupPage(x));
}

window.onload = ReadRecipes;

