# recipes

This is a recipe browser.  It is designed so that recipes can be easily added as markdown files, and
then this will provide a nice UI to search and display them.

## To Do

* fix search button positioning
* return should do search
* highlight first result automatically
* handle the case where there are no results
* do validation for recipe reading
* add script to update recipe list (validation here, too?)
* improve search icon in button
* change search to use lunrjs
* organize files
* lint the js code
* support multi-recipe markdown files?
* add tags
* add search for tags

## Validation

* check that there are ingredients and directions sections
* check that the level is ## for ingredients/directions (equivalently, there should be no recipes named "Ingredients" etc.
* check that there are no cases of '#  ', or normalize these away
* check that the recipe name matches the file name

## markdown features to support

* ### headings, e.g., for ingredient lists
* pictures?
* html links
* lists
* paragraph breaks in directions section
