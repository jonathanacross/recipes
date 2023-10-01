/*jshint esversion: 6 */

function splitLines(t) { return t.split(/\r\n|\r|\n/); }

function ParseMarkdown(recipeMarkdown, id) {
    let recipeData = {
        id: id,
        name: "ERROR: RECIPE HAS NO NAME",
        raw_markown: "",
        html: "",
        hashtags: []
    };

    // Read the recipe title
    let lines = splitLines(recipeMarkdown);
    for (line of lines) {
        if (line.startsWith("# ")) {
            recipeData.name = line.substring(2); // remove '# '
        }
    }

    // Extract any hashtags
    var rx_hashtag = /(?<=\s)(#[a-zA-Z0-9_]+)/g;
    const hashtags = recipeMarkdown.match(rx_hashtag);

    recipeData.raw_markdown = recipeMarkdown;
    recipeData.html = markdown(recipeMarkdown);
    recipeData.hashtags = hashtags;
    return recipeData;
}

function IndexHashTags(recipe_data) {
    const all_hashtags = new Set(recipe_data.map(r => r.hashtags)
                                            .flat()
                                            .filter(x => x)); // remove nulls
    return all_hashtags;
}

function ParseRecipes(responses) {
    recipe_data = responses.map((x, idx) => ParseMarkdown(x, idx));  // TODO: global variable fishiness
    recipe_index = lunr(function () {
        this.ref('id')
        this.field('name', {boost: 5})
        this.field('raw_markdown')

        recipe_data.forEach(function (doc) { this.add(doc) }, this)
    });
    hashtag_data = IndexHashTags(recipe_data);
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
    if (recipe === undefined) {
        resultDiv.innerHTML = "No matching recipes found.";
    } else {
        resultDiv.innerHTML = recipe.html;
    }

    let oldResult = document.getElementById("recipe");
    oldResult.replaceWith(resultDiv);
}

function ShowAllRecipes() {
    let ids = recipe_data.map(recipe => recipe.id)
    MakeResultList(ids, recipe_data);
    let recipe = recipe_data[ids[0]];
    ShowRecipe(recipe);
}

function SetupResults(resultids) {
    MakeResultList(resultids, recipe_data);

    let recipe = recipe_data[resultids[0]];
    ShowRecipe(recipe);
}

function doSearch() {
    event.preventDefault(); // prevent page reloading
    let searchtext = document.getElementById("searchtext");
    if (searchtext.value !== "") {
        let resultids = Search(searchtext.value);

        SetupResults(resultids);
    }
}

function SetupPage() {
    let searchbutton = document.getElementById("searchbutton");
    document.addEventListener("submit", doSearch);

    ShowAllRecipes();
}

function ReadRecipes() {
    Promise.all(recipe_titles.map(x => fetch(x)))
      .then(result => Promise.all(result.map(v => v.text())))
      .then(results => ParseRecipes(results))
      .then(x => SetupPage(x));
}

window.onload = ReadRecipes;

