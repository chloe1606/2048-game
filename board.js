
function getRow(board, rowIndex) {
  return board[rowIndex];
}

function getCell(board, rowIndex, columnIndex) {
  return board[rowIndex][columnIndex];
}

function getRowTotal(row) {
  return row[0] + row[1] + row[2] + row[3];
}

function hasTile(row) {
  return row.some(value => value !== 0);
}

function isRowFull(row) {
  return row.every(value => value !== 0);
}

function countTiles(row) {
  return row.filter(value => value !== 0).length;
}

function countBoardTiles(board) {
  return board.reduce(
    (total, row) => total + countTiles(row),
    0
  );
}

function isValidBoard(board) {
  return (
    Array.isArray(board) &&
    board.length === 4 &&
    board.every(row =>
      Array.isArray(row) &&
      row.length === 4 &&
      row.every(value =>
        value === 0 ||
        (
          Number.isInteger(value) &&
          value > 0 &&
          (value & (value - 1)) === 0
        )
      )
    )
  );
}

function hasEmptyCell(board) {
  return board.some(row =>
    row.some(value => value === 0)
  );
}

function getBoardStats(board) {
  const tileCount = countBoardTiles(board);
  const totalCells = board.length * board[0].length;
  const emptyCount = totalCells - tileCount;
  const hasEmpty = hasEmptyCell(board);

  return {
    tileCount,
    emptyCount,
    hasEmpty
  };
}

function setCell(board, rowIndex, columnIndex, value) {
  const newBoard = [...board];
  newBoard[rowIndex] = [...newBoard[rowIndex]];
  newBoard[rowIndex][columnIndex] = value;
  return newBoard;
}

function addRandomTile(board) {
  const emptyCells = [];

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === 0) {
        emptyCells.push({ row, col });
      }
    }
  }

  if (emptyCells.length === 0) {
    return board;
  }

  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  const { row, col } = emptyCells[randomIndex];
  const newValue = Math.random() < 0.9 ? 2 : 4;
  const newBoard = setCell(board, row, col, newValue);
  return newBoard;
}

function slideRowLeft(row) {
  const tiles = row.filter(value => value !== 0);
  return [...tiles, ...Array(row.length - tiles.length).fill(0)];
}

function mergeRowLeft(row) {
  const newRow = [...row];
  for (let i = 0; i < newRow.length - 1; i++) {
    if (newRow[i] !== 0 && newRow[i] === newRow[i + 1]) {
      newRow[i] *= 2;
      newRow[i + 1] = 0;
    }
  }
  return slideRowLeft(newRow);
}

function moveRowLeft(row) {
  const slid = slideRowLeft(row);
  const merged = mergeRowLeft(slid);
  return slideRowLeft(merged);
}

function mergeRowLeftWithScore(row) {
  const newRow = [...row];
  let scoreGained = 0;

  for (let i = 0; i < newRow.length - 1; i++) {
    if (newRow[i] !== 0 && newRow[i] === newRow[i + 1]) {
      const mergedValue = newRow[i] * 2;

      newRow[i] = mergedValue;
      newRow[i + 1] = 0;
      scoreGained += mergedValue;
    }
  }
  return {
    row: slideRowLeft(newRow),
    scoreGained
  };
}

function moveRowLeftWithScore(row) {
  const { row: movedRow, scoreGained } = moveLineLeft(row);

  return { row: movedRow, scoreGained };
}

function moveLineLeft(row) {
  const tiles = row
    .map((value, index) => ({ value, index }))
    .filter(tile => tile.value !== 0);
  const movedRow = Array(row.length).fill(0);
  const movements = [];
  const merges = [];
  let target = 0;
  let scoreGained = 0;

  for (let index = 0; index < tiles.length; index++) {
    const tile = tiles[index];
    movements.push({ from: tile.index, to: target, value: tile.value });
    let value = tile.value;

    if (tiles[index + 1]?.value === value) {
      const nextTile = tiles[++index];
      movements.push({ from: nextTile.index, to: target, value });
      value *= 2;
      scoreGained += value;
      merges.push({ index: target, value });
    }

    movedRow[target++] = value;
  }

  return { row: movedRow, scoreGained, movements, merges };
}

function moveBoardLeftWithScore(board) {
  let scoreGained = 0;

  const newBoard = board.map(row => {
    const result = moveRowLeftWithScore(row);
    scoreGained += result.scoreGained;
    return result.row;
  });

  return {
    board: newBoard,
    scoreGained
  };
}

function moveBoardLeft(board) {
  return board.map(row => moveRowLeft(row));
}

function reverseRow(row) {
  return [...row].reverse();
}

function moveRowRightWithScore(row) {
  const result = moveRowLeftWithScore(reverseRow(row));

  return {
    row: reverseRow(result.row),
    scoreGained: result.scoreGained
  };
}

function moveRowRight(row) {
  return reverseRow(moveRowLeft(reverseRow(row)));
}

function moveBoardRightWithScore(board) {
  let scoreGained = 0;

  const newBoard = board.map(row => {
    const result = moveRowRightWithScore(row);
    scoreGained += result.scoreGained;
    return result.row;
  });

  return {
    board: newBoard,
    scoreGained
  };
}

function moveBoardRight(board) {
  return board.map(row => moveRowRight(row));
}

function transposeBoard(board) {
  return board[0].map((_, colIndex) => board.map(row => row[colIndex]));
}

function moveBoardUp(board) {
  return transposeBoard(moveBoardLeft(transposeBoard(board)));
}

function moveBoardUpWithScore(board) {
  const result = moveBoardLeftWithScore(transposeBoard(board));

  return {
    board: transposeBoard(result.board),
    scoreGained: result.scoreGained
  };
}

function moveBoardDown(board) {
  return transposeBoard(moveBoardRight(transposeBoard(board)));
}

function moveBoardDownWithScore(board) {
  const result = moveBoardRightWithScore(transposeBoard(board));

  return {
    board: transposeBoard(result.board),
    scoreGained: result.scoreGained
  };
}

function boardsAreEqual(board1, board2) {
  for (let row = 0; row < board1.length; row++) {
    for (let col = 0; col < board1[row].length; col++) {
      if (board1[row][col] !== board2[row][col]) {
        return false;
      }
    }
  }
  return true;
}

// Movements include every source tile; merging sources share a destination.
// Merges and the spawned tile describe what to reveal after the slide finishes.
function makeMove(board, direction) {
  if (!['left', 'right', 'up', 'down'].includes(direction)) {
    throw new Error('Invalid move direction');
  }

  const vertical = direction === 'up' || direction === 'down';
  const reversed = direction === 'right' || direction === 'down';
  const position = (line, index) => {
    const offset = reversed ? board.length - 1 - index : index;
    return vertical ? { row: offset, col: line } : { row: line, col: offset };
  };
  const movedBoard = createEmptyBoard();
  const movements = [];
  const merges = [];
  let scoreGained = 0;

  for (let line = 0; line < board.length; line++) {
    const cells = board.map((_, index) => {
      const { row, col } = position(line, index);
      return board[row][col];
    });
    const result = moveLineLeft(cells);
    scoreGained += result.scoreGained;

    result.row.forEach((value, index) => {
      const { row, col } = position(line, index);
      movedBoard[row][col] = value;
    });
    movements.push(...result.movements.map(move => ({
      from: position(line, move.from),
      to: position(line, move.to),
      value: move.value
    })));
    merges.push(...result.merges.map(merge => ({
      ...position(line, merge.index),
      value: merge.value
    })));
  }

  if (boardsAreEqual(board, movedBoard)) {
    return { board, scoreGained: 0, movements: [], merges: [], spawnedTile: null };
  }

  const nextBoard = addRandomTile(movedBoard);
  let spawnedTile = null;

  nextBoard.forEach((row, rowIndex) => row.forEach((value, col) => {
    if (value !== movedBoard[rowIndex][col]) {
      spawnedTile = { row: rowIndex, col, value };
    }
  }));

  return {
    board: nextBoard,
    scoreGained,
    movements,
    merges,
    spawnedTile
  };
}

function hasWon(board) {
  return board.some(row => row.includes(2048));
}

function isGameOver(board) {
  return (
    !hasEmptyCell(board) &&
    boardsAreEqual(board, moveBoardLeft(board)) &&
    boardsAreEqual(board, moveBoardRight(board)) &&
    boardsAreEqual(board, moveBoardUp(board)) &&
    boardsAreEqual(board, moveBoardDown(board))
  );
}

function createEmptyBoard() {
  return Array.from({ length: 4 }, () => [0, 0, 0, 0]);
}

function createNewGame() {
  let board = createEmptyBoard();
  board = addRandomTile(board);
  return addRandomTile(board);
}

export {
  getRow,
  getCell,
  getRowTotal,
  hasTile,
  isRowFull,
  countTiles,
  countBoardTiles,
  isValidBoard,
  hasEmptyCell,
  getBoardStats,
  setCell,
  addRandomTile,
  slideRowLeft,
  mergeRowLeft,
  mergeRowLeftWithScore,
  moveRowLeft,
  moveRowLeftWithScore,
  moveBoardLeftWithScore,
  moveBoardLeft,
  reverseRow,
  moveRowRightWithScore,
  moveRowRight,
  moveBoardRightWithScore,
  moveBoardRight,
  transposeBoard,
  moveBoardUpWithScore,
  moveBoardUp,
  moveBoardDownWithScore,
  moveBoardDown,
  boardsAreEqual,
  makeMove,
  hasWon,
  isGameOver,
  createEmptyBoard,
  createNewGame,
};
