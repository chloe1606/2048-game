# 2048 – JavaScript Puzzle Game

A browser-based implementation of the classic 2048 puzzle game, built using JavaScript, HTML and CSS.

The project focuses on implementing game mechanics through structured JavaScript logic, with particular emphasis on data manipulation, state management, validation and modular code design.

## Technical Implementation

### 1. 2D Array Manipulation
Implemented the game board as a 4×4 two-dimensional array, using nested array operations to represent and manipulate tile positions.

- Traversed and manipulated rows and columns to support movement in all four directions.
- Used array methods including `map()`, `filter()`, `some()` and `flat()` to transform and inspect board data.
- Implemented tile movement and merging logic while preserving the board's structure.

### 2. Immutable State Updates
Applied immutable data manipulation techniques to manage changes to the game board.

- Created updated board states rather than modifying existing arrays directly.
- Used array copying and transformation to maintain predictable state changes.
- Separated state updates from game logic to make behaviour easier to understand, test and debug.

### 3. Game-State Validation
Developed validation logic to ensure the game responds correctly to different board configurations and player actions.

- Checked for available empty cells before introducing new tiles.
- Validated board dimensions and tile values.
- Identified whether valid moves were possible by checking for empty cells or adjacent matching tiles.
- Implemented game-over detection based on the availability of further moves.

### 4. Reusable Functions & Separation of Concerns
Structured the application into smaller, focused functions, each responsible for a specific part of the game logic.

- Separated board manipulation, tile merging, validation and state updates into independent functions.
- Designed reusable logic to handle movement across different directions.
- Used clear function responsibilities to reduce duplication and simplify debugging.
- Made individual components of the game logic easier to test and maintain.

## Technologies

- JavaScript
- HTML
- CSS

## Key Learning Outcomes

Developed practical experience in JavaScript programming, including multidimensional data structures, functional array methods, immutable state management, validation and modular application design.
