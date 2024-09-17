# Style Guide
Contributors should install the "EditorConfig" extension for the IDE of their choice. This handles some style related decisions automatically such as Tabs vs Spaces, the number of spaces per level of indentation, etc. and ensure they are standardized across development environments. For a list of what editors need an extension and what editors have it pre-installed, check out the [EditorConfig.org](https://editorconfig.org/#pre-installed) website.

## Language formatters
If the language being used has an official format, it should be used. For example Python's style guide uses [PEP 8](https://peps.python.org/pep-0008/) for programs and [PEP 257](https://peps.python.org/pep-0257/) for Docstrings.

For some editors, there are extensions that will automatically format files for you, such as [autopep8](https://marketplace.visualstudio.com/items?itemName=ms-python.autopep8) for Python files.

For languages such as Javascript that use braces to designate code blocks, the opening brace should be placed on the same line, and the closing brace should be in the same indent level as the opening line.

Variable names should match the standard formatting for that language. For example, Python uses `snake_case` while JavaScript uses `camelCase`.

Incorrect
```javascript
function my_function()
{
    let my_variable_name = 1;
};
```

Incorrect
```javascript
function my_function() {
    let my_variable_name = 1;
    };
```

Correct
```javascript
function myFunction() {
    let myVariableName = 1;
};
```