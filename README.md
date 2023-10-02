# recipes

This is a recipe browser.  It is designed so that recipes can be easily added as markdown files, and
then this will provide a nice UI to search and display them.

## To Do

* highlight first result automatically
* add script to update recipe list and do validation
* organize files
* lint the js code
* support multi-recipe markdown files?
* add search for hashtags
* update url parameters to show search

## Validation

* check that there are ingredients and directions sections
* check that the level is ## for ingredients/directions (equivalently, there should be no recipes named "Ingredients" etc.
* check that there are no cases of '#  ', or normalize these away
* check that the recipe name matches the file name
