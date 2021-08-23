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

## Planned Features
 - Functioning file system using IndexedDB as the backing service.
 - Updated task manager allowing concurrent and background process execution.
 - Refined and enhanced shell language for more expressive and intuitive programming.
 - WebAssembly text editor executable, allowing editing of files directly in the terminal.
 - Colors and other effects for console UI output.

## Demo
The current working version of this code can be found at: http://aricmakesgames.net/codegame/main.html
