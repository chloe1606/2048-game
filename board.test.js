import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  countBoardTiles,
  countTiles,
  getBoardStats,
  getCell,
  getRow,
  getRowTotal,
  hasEmptyCell,
  hasTile,
  isRowFull,
  isValidBoard,
  setCell,
  addRandomTile,
  slideRowLeft,
  mergeRowLeft,
  moveRowLeft,
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
  createEmptyBoard,
  createNewGame,
  mergeRowLeftWithScore,
  moveRowLeftWithScore,
  moveBoardLeftWithScore
} from './board.js';

const board = [
  [2, 0, 4, 0],
  [0, 8, 0, 16],
  [32, 64, 128, 256],
  [0, 0, 0, 0]
];

const fullBoard = [
  [2, 4, 8, 16],
  [32, 64, 128, 256],
  [512, 1024, 2, 4],
  [8, 16, 32, 64]
];

describe('getRow', () => {
  it('returns the row at the requested index', () => {
    expect(getRow(board, 1)).toBe(board[1]);
  });

  it('returns the first and last rows', () => {
    expect(getRow(board, 0)).toEqual([2, 0, 4, 0]);
    expect(getRow(board, 3)).toEqual([0, 0, 0, 0]);
  });
});

describe('getCell', () => {
  it('returns a tile at a given row and column', () => {
    expect(getCell(board, 2, 3)).toBe(256);
  });

  it('returns an empty cell and works at board edges', () => {
    expect(getCell(board, 0, 1)).toBe(0);
    expect(getCell(board, 3, 3)).toBe(0);
  });
});

describe('getRowTotal', () => {
  it('adds all four values in a row', () => {
    expect(getRowTotal([2, 4, 8, 16])).toBe(30);
  });

  it('returns zero for a row of empty cells', () => {
    expect(getRowTotal([0, 0, 0, 0])).toBe(0);
  });
});

describe('hasTile', () => {
  it('returns true when at least one cell has a tile', () => {
    expect(hasTile([0, 0, 2, 0])).toBe(true);
  });

  it('returns false for an empty row', () => {
    expect(hasTile([0, 0, 0, 0])).toBe(false);
  });
});

describe('isRowFull', () => {
  it('returns true when every cell contains a tile', () => {
    expect(isRowFull([2, 4, 8, 16])).toBe(true);
  });

  it('returns false when even one cell is empty', () => {
    expect(isRowFull([2, 4, 0, 16])).toBe(false);
  });
});

describe('countTiles', () => {
  it('counts non-zero values in a row', () => {
    expect(countTiles([2, 0, 4, 0])).toBe(2);
  });

  it('handles empty and full rows', () => {
    expect(countTiles([0, 0, 0, 0])).toBe(0);
    expect(countTiles([2, 4, 8, 16])).toBe(4);
  });
});

describe('countBoardTiles', () => {
  it('counts tiles across all rows', () => {
    expect(countBoardTiles(board)).toBe(8);
  });

  it('returns zero for an empty board', () => {
    expect(countBoardTiles(Array.from({ length: 4 }, () => [0, 0, 0, 0]))).toBe(0);
  });
});

describe('isValidBoard', () => {
  it('accepts a 4 by 4 board containing zeroes and positive powers of two', () => {
    expect(isValidBoard(board)).toBe(true);
  });

  it.each([
    ['a non-array value', 'not a board'],
    ['the wrong number of rows', [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]],
    ['a row with the wrong number of cells', [[0, 0, 0, 0], [0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]],
    ['a non-power-of-two tile', [[0, 0, 0, 0], [0, 3, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]],
    ['a negative tile', [[0, 0, 0, 0], [0, -2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]],
    ['a fractional tile', [[0, 0, 0, 0], [0, 2.5, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]]
  ])('rejects %s', (_description, invalidBoard) => {
    expect(isValidBoard(invalidBoard)).toBe(false);
  });
});

describe('hasEmptyCell', () => {
  it('returns true when an empty cell exists', () => {
    expect(hasEmptyCell(board)).toBe(true);
  });

  it('returns false for a full board', () => {
    expect(hasEmptyCell(fullBoard)).toBe(false);
  });
});

describe('getBoardStats', () => {
  it('returns tile and empty-cell counts for a partial board', () => {
    expect(getBoardStats(board)).toEqual({
      tileCount: 8,
      emptyCount: 8,
      hasEmpty: true
    });
  });

  it('reports no empty cells for a full board', () => {
    expect(getBoardStats(fullBoard)).toEqual({
      tileCount: 16,
      emptyCount: 0,
      hasEmpty: false
    });
  });
});

describe('setCell', () => {
  it('returns a board with only the requested cell changed', () => {
    expect(setCell(board, 1, 2, 32)).toEqual([
      [2, 0, 4, 0],
      [0, 8, 32, 16],
      [32, 64, 128, 256],
      [0, 0, 0, 0]
    ]);
  });

  it('does not mutate the original board or its changed row', () => {
    const original = board.map(row => [...row]);
    const updated = setCell(board, 0, 1, 2);

    expect(board).toEqual(original);
    expect(updated).not.toBe(board);
    expect(updated[0]).not.toBe(board[0]);
  });

  it('keeps untouched rows shared by reference', () => {
    const updated = setCell(board, 1, 0, 2);

    expect(updated[0]).toBe(board[0]);
    expect(updated[2]).toBe(board[2]);
    expect(updated[3]).toBe(board[3]);
  });
});

describe('addRandomTile', () => {
it('adds a 2 to a randomly selected empty cell without mutating the original board', () => {
    const random = vi
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0) // select the first empty cell
      .mockReturnValueOnce(0); // create a 2

    const updated = addRandomTile(board);

    expect(updated[0][1]).toBe(2);
    expect(countBoardTiles(updated)).toBe(countBoardTiles(board) + 1);
    expect(board[0][1]).toBe(0);
    expect(updated).not.toBe(board);

    random.mockRestore();
  });

  it('can add a 4', () => {
    const random = vi
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.95);

    const updated = addRandomTile(board);

    expect(updated[0][1]).toBe(4);

    random.mockRestore();
  });

  it('returns the same board when it is already full', () => {
    expect(addRandomTile(fullBoard)).toBe(fullBoard);
  });
});

describe('slideRowLeft', () => {
  it('slides and merges a row to the left', () => {
    const row = [2, 0, 2, 4];
    expect(slideRowLeft(row)).toEqual([2, 2, 4, 0]);
  });

  it('does not modify a row which has no zeroes', () => {
    const row = [2, 4, 8, 16];
    expect(slideRowLeft(row)).toEqual([2, 4, 8, 16]);
  });

  it('handles a row with gaps correctly', () => {
    const row = [2, 0, 2, 0];
    expect(slideRowLeft(row)).toEqual([2, 2, 0, 0]);
  });
});

describe('mergeRowLeft', () => {
  it('merges a row to the left correctly', () => {
    const row = [2, 2, 0, 0];
    expect(mergeRowLeft(row)).toEqual([4, 0, 0, 0]);
  });

  it('handles a row with three consecutive tiles', () => {
    const row = [2, 2, 2, 0];
    expect(mergeRowLeft(row)).toEqual([4, 2, 0, 0]);
  });

  it('handles a row with no merges needed', () => {
    const row = [2, 4, 8, 16];
    expect(mergeRowLeft(row)).toEqual([2, 4, 8, 16]);
  });

  it('handles a row with multiple merges', () => {
    const row = [2, 2, 2, 2];
    expect(mergeRowLeft(row)).toEqual([4, 4, 0, 0]);
  });
});


describe('moveRowLeft', () => {
  it('moves a row with gaps correctly', () => {
    const row = [2, 0, 2, 0];
    expect(moveRowLeft(row)).toEqual([4, 0, 0, 0]);
  });

  it('handles a row with one merge', () => {
    const row = [2, 2, 4, 0];
    expect(moveRowLeft(row)).toEqual([4, 4, 0, 0]);
  });

  it('handles a row with two merges', () => {
    const row = [2, 2, 2, 2];
    expect(moveRowLeft(row)).toEqual([4, 4, 0, 0]);
  });

  it('handles a row with gaps and no merges', () => {
    const row = [0, 2, 0, 4];
    expect(moveRowLeft(row)).toEqual([2, 4, 0, 0]);
  });

  it('handles a row that is already full and has no merges', () => {
    const row = [2, 4, 8, 16];
    expect(moveRowLeft(row)).toEqual([2, 4, 8, 16]);
  });
});

describe('reverseRow', () => {
  it('reverses a row correctly', () => {
    const row = [2, 4, 8, 16];
    expect(reverseRow(row)).toEqual([16, 8, 4, 2]);
  });
}); 

describe('moveRowRight', () => {
  it('moves a row with gaps correctly', () => {
    const row = [0, 2, 0, 2];
    expect(moveRowRight(row)).toEqual([0, 0, 0, 4]);
  });

  it('handles a row with one merge', () => {
    const row = [0, 2, 2, 4];
    expect(moveRowRight(row)).toEqual([0, 0, 4, 4]);
  });

  it('handles a row with two merges', () => {
    const row = [2, 2, 2, 2];
    expect(moveRowRight(row)).toEqual([0, 0, 4, 4]);
  });

  it('handles a row with gaps and no merges', () => {
    const row = [2, 0, 4, 0];
    expect(moveRowRight(row)).toEqual([0, 0, 2, 4]);
  });

  it('handles a row that is already full and has no merges', () => {
    const row = [2, 4, 8, 16];
    expect(moveRowRight(row)).toEqual([2, 4, 8, 16]);
  });
});

describe('moveBoardRight', () => {
  it('moves a board to the right correctly', () => {
    const board = [
      [2, 0, 2, 0],
      [0, 2, 2, 4],
      [2, 2, 2, 2],
      [2, 0, 4, 0]
    ];
    const expected = [
      [0, 0, 0, 4],
      [0, 0, 4, 4],
      [0, 0, 4, 4],
      [0, 0, 2, 4]
    ];
    expect(moveBoardRight(board)).toEqual(expected);
  });
});

describe('transposeBoard', () => {
    it('transposes a board correctly', () => {
      const board = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16]
      ];
      const expected = [
        [1, 5, 9, 13],
        [2, 6, 10, 14],
        [3, 7, 11, 15],
        [4, 8, 12, 16]
      ];
      expect(transposeBoard(board)).toEqual(expected);
    });
  });

describe('moveBoardUp', () => {
  it('moves a board up correctly', () => {
    const board = [
      [2, 0, 2, 0],
      [0, 2, 2, 4],
      [2, 2, 2, 2],
      [2, 0, 4, 0]
    ];
    const expected = [
      [4, 4, 4, 4],
      [2, 0, 2, 2],
      [0, 0, 4, 0],
      [0, 0, 0, 0]
    ];
    expect(moveBoardUp(board)).toEqual(expected);
  });
});

describe('moveBoardDown', () => {
  it('moves a board down correctly', () => {
    const board = [
      [2, 0, 2, 0],
      [0, 2, 2, 4],
      [2, 2, 2, 2],
      [2, 0, 4, 0]
    ];
    const expected = [
      [0, 0, 0, 0],
      [0, 0, 2, 0],
      [2, 0, 4, 4],
      [4, 4, 4, 2]
    ];
    expect(moveBoardDown(board)).toEqual(expected);
  });
}); 

describe('boardsAreEqual', () => {
  it('returns true for identical boards', () => {
    const board1 = [
      [2, 0, 2, 0],
      [0, 2, 2, 4],
      [2, 2, 2, 2],
      [2, 0, 4, 0]
    ];
    const board2 = [
      [2, 0, 2, 0],
      [0, 2, 2, 4],
      [2, 2, 2, 2],
      [2, 0, 4, 0]
    ];
    expect(boardsAreEqual(board1, board2)).toBe(true);
  });

  it('returns false for different boards', () => {
    const board1 = [
      [2, 0, 2, 0],
      [0, 2, 2, 4],
      [2, 2, 2, 2],
      [2, 0, 4, 0]
    ];
    const board2 = [
      [2, 0, 2, 0],
      [0, 2, 2, 4],
      [2, 2, 2, 2],
      [2, 0, 0, 0]
    ];
    expect(boardsAreEqual(board1, board2)).toBe(false);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('makeMove', () => {
  it('moves left, then adds one predictable random tile', () => {
    const board = [
      [2, 0, 2, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];

    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0) // first empty cell
      .mockReturnValueOnce(0); // make a 2

    expect(makeMove(board, 'left')).toEqual({
      board: [
        [4, 2, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      scoreGained: 4,
      movements: [
        { from: { row: 0, col: 0 }, to: { row: 0, col: 0 }, value: 2 },
        { from: { row: 0, col: 2 }, to: { row: 0, col: 0 }, value: 2 }
      ],
      merges: [{ row: 0, col: 0, value: 4 }],
      spawnedTile: { row: 0, col: 1, value: 2 }
    });
  });

  it('returns the original board when a move cannot change it', () => {
    const random = vi.spyOn(Math, 'random');
    const board = [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2, 4],
      [8, 16, 32, 64]
    ];

    const result = makeMove(board, 'left');

    expect(result.board).toBe(board);
    expect(result.scoreGained).toBe(0);
    expect(result.movements).toEqual([]);
    expect(result.merges).toEqual([]);
    expect(result.spawnedTile).toBeNull();
    expect(random).not.toHaveBeenCalled();
  });

  it('uses the up direction before adding a random tile', () => {
    const board = [
      [0, 2, 0, 0],
      [0, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];

    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0);

    expect(makeMove(board, 'up')).toEqual({
      board: [
        [2, 4, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      scoreGained: 4,
      movements: [
        { from: { row: 0, col: 1 }, to: { row: 0, col: 1 }, value: 2 },
        { from: { row: 1, col: 1 }, to: { row: 0, col: 1 }, value: 2 }
      ],
      merges: [{ row: 0, col: 1, value: 4 }],
      spawnedTile: { row: 0, col: 0, value: 2 }
    });
  });

  it('throws for an invalid direction', () => {
    expect(() => makeMove(board, 'diagonal')).toThrow('Invalid move direction');
  });

  it.each([
    ['left', moveBoardLeftWithScore],
    ['right', moveBoardRightWithScore],
    ['up', moveBoardUpWithScore],
    ['down', moveBoardDownWithScore]
  ])('tracks every source and merge when moving %s', (direction, moveBoard) => {
    const original = [
      [2, 2, 2, 2],
      [0, 4, 0, 4],
      [8, 8, 16, 0],
      [0, 0, 16, 0]
    ];
    const snapshot = original.map(row => [...row]);
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const expected = moveBoard(original);
    const result = makeMove(original, direction);
    const reconstructed = createEmptyBoard();
    const sources = new Set();

    for (const { from, to, value } of result.movements) {
      expect(original[from.row][from.col]).toBe(value);
      sources.add(`${from.row},${from.col}`);
      reconstructed[to.row][to.col] += value;
    }

    expect(sources.size).toBe(countBoardTiles(original));
    expect(result.movements).toHaveLength(sources.size);
    expect(reconstructed).toEqual(expected.board);
    expect(result.scoreGained).toBe(expected.scoreGained);
    expect(result.merges.reduce((total, merge) => total + merge.value, 0))
      .toBe(result.scoreGained);
    for (const merge of result.merges) {
      expect(reconstructed[merge.row][merge.col]).toBe(merge.value);
      expect(result.movements.filter(move =>
        move.to.row === merge.row && move.to.col === merge.col
      )).toHaveLength(2);
    }
    const { row, col, value } = result.spawnedTile;
    expect(reconstructed[row][col]).toBe(0);
    reconstructed[row][col] = value;
    expect(reconstructed).toEqual(result.board);
    expect(original).toEqual(snapshot);
  });

  it('preserves the single-merge rule for all short rows', () => {
    const values = [0, 2, 4, 8];
    for (let pattern = 0; pattern < 256; pattern++) {
      const row = Array.from({ length: 4 }, (_, index) =>
        values[Math.floor(pattern / (4 ** index)) % 4]
      );
      expect(moveRowLeftWithScore(row)).toEqual(
        mergeRowLeftWithScore(slideRowLeft(row))
      );
    }
  });
});

describe('createEmptyBoard', () => {
  it('creates a 4x4 board with all zeros', () => {
    const board = createEmptyBoard();
    expect(board.length).toBe(4);
    expect(board[0].length).toBe(4);
    expect(board.flat().every(value => value === 0)).toBe(true);
  });
});

describe('createNewGame', () => {
  it('creates a 4x4 board with two random tiles that are 2 or 4', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0);

    const board = createNewGame();
    const nonZeroTiles = board.flat().filter(value => value !== 0);
    expect(nonZeroTiles.length).toBe(2);
    expect(board.length).toBe(4);
    expect(board[0].length).toBe(4);
    expect(nonZeroTiles.every(value => value === 2 || value === 4)).toBe(true);
  });
});

describe('mergeRowLeftWithScore', () => {
  it('returns the merged row and points gained', () => {
    expect(mergeRowLeftWithScore([2, 2, 4, 4])).toEqual({
      row: [4, 8, 0, 0],
      scoreGained: 12
    });
  });

  it('returns zero points when nothing merges', () => {
    expect(mergeRowLeftWithScore([2, 4, 8, 16])).toEqual({
      row: [2, 4, 8, 16],
      scoreGained: 0
    });
  });
});

describe('moveRowLeftWithScore', () => {
  it('slides, merges, and returns the points gained', () => {
    expect(moveRowLeftWithScore([2, 0, 2, 4])).toEqual({
      row: [4, 4, 0, 0],
      scoreGained: 4
    });
  });

  it('returns zero points when tiles only slide', () => {
    expect(moveRowLeftWithScore([0, 2, 0, 4])).toEqual({
      row: [2, 4, 0, 0],
      scoreGained: 0
    });
  });
});

describe('moveBoardLeftWithScore', () => {
  it('moves every row and totals points from all merges', () => {
    const board = [
      [2, 0, 2, 0],
      [4, 4, 0, 0],
      [0, 2, 0, 4],
      [0, 0, 0, 0]
    ];

    expect(moveBoardLeftWithScore(board)).toEqual({
      board: [
        [4, 0, 0, 0],
        [8, 0, 0, 0],
        [2, 4, 0, 0],
        [0, 0, 0, 0]
      ],
      scoreGained: 12
    });
  });
});

describe('score-aware right moves', () => {
  it('moves a row right and reports its merge score', () => {
    expect(moveRowRightWithScore([2, 0, 2, 4])).toEqual({
      row: [0, 0, 4, 4],
      scoreGained: 4
    });
  });

  it('moves a board right and totals all merge scores', () => {
    const board = [
      [2, 0, 2, 0],
      [4, 4, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];

    expect(moveBoardRightWithScore(board)).toEqual({
      board: [
        [0, 0, 0, 4],
        [0, 0, 0, 8],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      scoreGained: 12
    });
  });
});

describe('score-aware vertical moves', () => {
  const board = [
    [2, 0, 2, 0],
    [2, 0, 2, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ];

  it('moves up and reports merge points', () => {
    expect(moveBoardUpWithScore(board)).toEqual({
      board: [
        [4, 0, 4, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      scoreGained: 8
    });
  });

  it('moves down and reports merge points', () => {
    expect(moveBoardDownWithScore(board)).toEqual({
      board: [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [4, 0, 4, 0]
      ],
      scoreGained: 8
    });
  });
});
