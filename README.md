# "Shell Game"
This represents a working prototype for a game engine for allowing a player to interact with a toy operating system through a simple shell interface, all working natively in browser.

## Working Features
 - Parsing and compiling of a simple shell language into WebAssembly modules.
 - Execution of dynamically generated WebAssembly modules via single-threaded task manager.
 - System Calls for accessing "Operating System" functionality from within WebAssembly executables.
 - Memory management for WebAssembly executables managed in per-process sandboxed memory spaces.
 - Simple TTY-like channels for intercommunication between processes and other components of the system.
 - Custom UI for displaying text and current cursor positioning (or other content, as functionality is fleshed out).
 - Sampling of shared library functionality for WebAssembly modules (e.g. `atoi()`).
 - Tracking of prior shell command history through up and down arrow input.

## Planned Features
 - Functioning file system using IndexedDB as the backing service.
 - Updated task manager allowing concurrent and background process execution.
 - Refined and enhanced shell language for more expressive and intuitive programming.
   * String manipulation
   * Extended arithmetic
   * Easier and more intuitive syntax
   * Command execution (e.g. running another existing executable)
   * Multi-line commands
 - WebAssembly text editor executable, allowing editing of files directly in the terminal.
 - Colors and other effects for console UI output.

## Demo
The current working version of this code can be found at: http://aricmakesgames.net/codegame/main.html

As the shell language is still in development, and the filesystem has not yet been implemented, interactions right now are limited. Here is a simple run down of visible interactions:

 - Variables can be assigned to and referenced. All variables are case-sensitive, alpha-numeric names, prefixed by a `$`. For example:
```
> $foo = 3
> $foo
3
```
 - Basic arithmetic (addition, subtraction, multiplication, and integer-division) can be performed against integers and variables. For example:
```
> $foo = 5
> $foo - 10
-5
> $foo = $foo * $foo
> $foo
25
```
 - if-blocks can be written, albeit awkwardly (as all input is currently single lines). The structure is similar to C-style if-blocks, of the form:
```
if (<CONDITION>) {
  <BODY>
}
[else if (<CONDITION) {
  <BODY>
}]
[else {
  <BODY>
}]
```
  Conditions are evalauted to "true" if the result is a non-empty string or non-zero integer. An equality condition check is also possible.
  QUIRK: Equality condition checks presently need to be wrapped in an additional layer of `{}` to be functional. For example:
```
> $foo = 3
> if ($foo) { 1 } else { 2 }
1
> if ({$foo == 5}) { 1 } else { 2 }
2
```
