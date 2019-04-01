# Looker Visual Studio Code Extension
A Visual Studio Code extension meant to aid in the development of LookML -- [Looker's](https://looker.com/product/business-intelligence) custom markup language.
* [What is LookML?](https://docs.looker.com/data-modeling/learning-lookml/what-is-lookml)


## Features

### Implemented:
* Syntax highlighting, with embedded SQL
  
![](https://raw.githubusercontent.com/Ladvien/vscode-looker/master/docs/lookml-example.png)

### Planned
* Use of API.  For example, running SQL queries directly from Visual Studio Code using [Run SQL Runner Query](https://docs.looker.com/reference/api-and-integration/api-reference/v3.1/sql-query#run_sql_runner_query).  SQL can be selected, sent to this endpoint, and the result saved to a temporary folder, where it could be viewed with a tabular data viewer like the VScode [Excel Viewer](https://marketplace.visualstudio.com/items?itemName=GrapeCity.gc-excelviewer) extension.
* LookML validation (with use of API endpoint [Validate Project](https://docs.looker.com/reference/api-and-integration/api-reference/v3.1/project#validate_project))
* Intellisense dimensions, measures, or filters from other view files.
* LookML and SQL auto-formatting.


## Requirements

* Visual Studio Code

## Extension Settings

* None yet

## Known Issues

* None yet

## Release Notes

### 0.1
* Basic Syntax highlighting
