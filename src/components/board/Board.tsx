
import { useEffect, useRef, useState } from "react";
import "./Board.css";
import jewelboxMusic from "../../resources/sounds/jewelbox.mp3";
import chimeSound from "../../resources/sounds/chime.mp3";
import { COLS, ECellState, ECellType, EGameState, MATCH_DELAY, MATCH_SIZE, PIECE_SIZE, ROWS, UNIT } from "../../types/constants";
import type { CellData } from "../../types/cellData";
import Cell from "../cell/Cell";
import { generateEmptyBoard, generateNewPiece, getCellScore, getLevelFromScore, START_COL, START_ROW } from "./boardHelpers";

function Board() {
  //
  // states
  //

  const [music] = useState(new Audio(jewelboxMusic));
  const [sfxChime] = useState(new Audio(chimeSound));
  const [gameState, setGameState] = useState(EGameState.NONE);

  const [pieceCol, setPieceCol] = useState(START_COL);
  const [pieceRow, setPieceRow] = useState(START_ROW);
  const [piece, setPiece] = useState<CellData[]>([]);
  const [nextPiece, setNextPiece] = useState<CellData[]>([]);
  const [makeNewPiece, setMakeNewPiece] = useState(false);
  const [movePieceDown, setMovePieceDown] = useState(false);
  const [grid, setGrid] = useState<CellData[][]>([]);
  const [evaluateGrid, setEvaluateGrid] = useState(false);
  const [lives, setLives] = useState(0);
  const [score, setScore] = useState(0);
  const [matchScoreChain, setMatchScoreChain] = useState<number[]>([]);
  const [level, setLevel] = useState(1);
  const [speed, setSpeed] = useState(800); // ms

  const movePieceTimerRef = useRef(0);
  const loadNextPieceTimerRef = useRef(0);
  const evaluateGridTimerRef = useRef(0);
  const boardRef = useRef<HTMLDivElement>(null);
  
  //
  // effects
  //

  function initializeNewGame() {
    setGrid(generateEmptyBoard());
    setPiece([]);
    setNextPiece([]);

    setLives(3);
    setScore(0);
    setLevel(0);
    setSpeed(800);
  }

  function initializeNewBoard() {
    setGrid(generateEmptyBoard());
    setPiece([]);
  }

  useEffect(() => {
    if (gameState === EGameState.STARTING) {
      stopTimers();

      music.pause();
      music.currentTime = 0;
      music.loop = true;
      music.play();
  
      initializeNewGame();

      setGameState(EGameState.STARTED);
    }
    else if (gameState === EGameState.STARTED) {
      startTimers();

      // continue by re-evaluating the board (will trigger loadNextPiece())
      if (piece.length === 0) {
        setEvaluateGrid(true);
      }

      music.loop = true;
      music.play();
    }
    else if (gameState === EGameState.PAUSED) {
      stopTimers();
      music.pause();
    }
    else if (gameState === EGameState.ENDED) {
      stopTimers();
      music.pause();
      console.log("=== GAME OVER ===");
    }

    setBoardFocus();

  }, [gameState])

  function hasStarted(): boolean {
    return [EGameState.STARTED, EGameState.PAUSED].includes(gameState);
  }

  function setBoardFocus() {
    if (boardRef.current) {
      boardRef.current.focus();
    }
  }

  useEffect(() => {
    if (gameState === EGameState.STARTED) {
      if (lives === 0) {
        setGameState(EGameState.ENDED);
      } else {
        initializeNewBoard();
        loadNextPiece(speed);
      }
    }
  }, [lives]);

  function startTimers() {
    stopTimers();

    movePieceTimerRef.current = setInterval(() => {
      setMovePieceDown(true);
    }, speed);
  }

  function stopTimers() {
    clearInterval(movePieceTimerRef.current);
    movePieceTimerRef.current = 0;

    clearTimeout(loadNextPieceTimerRef.current);
    loadNextPieceTimerRef.current = 0;

    clearTimeout(evaluateGridTimerRef.current);
    evaluateGridTimerRef.current = 0;
  }

  useEffect(() => {
    const performMovePieceDown = () => {

      setPieceRow(prev => {
        if (prev === grid[pieceCol].length) {
          const newGrid = [...grid];

          piece.forEach((c) => newGrid[pieceCol].push(c));

          newGrid[pieceCol].forEach((c, row) => {
            if (c.row !== row) {
              console.error(">>> UNALIGNED COL DATA!!! (1)", pieceCol, grid)
            }
          });

          setPiece([]);

          setGrid(newGrid);
          setEvaluateGrid(true);

          return prev;
        }

        return prev - 1;
      });
    };

    if (movePieceDown) {
      setMovePieceDown(false);
      if (grid.length > 0 && piece.length > 0) {
        performMovePieceDown();
      }
    }
  }, [movePieceDown]);

  function loadNextPiece(delay: number) {
    // set next piece position immediately to allow movement before making new piece
    setPieceCol(START_COL);
    setPieceRow(START_ROW);
    loadNextPieceTimerRef.current = setTimeout(() => setMakeNewPiece(true), delay);
  };

  useEffect(() => {
    if (makeNewPiece) {
      setMakeNewPiece(false);

      if (gameState === EGameState.STARTED) {
        setMatchScoreChain([]);
        const newPiece = nextPiece.length === 0
          ? generateNewPiece(level, pieceCol)
          : nextPiece;

        if (grid[pieceCol].length > pieceRow) {
          setLives(prev => prev - 1);
        }
        else {
          setPiece(newPiece);
          setNextPiece(generateNewPiece(level, START_COL));
        }
      }
    }

  }, [makeNewPiece]);

  useEffect(() => {
    const performEvaluateGrid = () => {

      let updateGrid = false;

      // remove MATCHED cells
      const deleteCells: CellData[] = [];
      grid.forEach((colCells) => {
        colCells.forEach((cell) => {
          if (cell.state === ECellState.MATCHED) {
            deleteCells.push(cell);
            updateGrid = true;
          }
        });
      });

      const dirtyColRows: number[] = Array.from({ length: COLS }, () => -1);
      for (let i = deleteCells.length - 1; i >= 0; i--) {
        dirtyColRows[deleteCells[i].col] = deleteCells[i].row;
        grid[deleteCells[i].col].splice(deleteCells[i].row, 1);
      };

      // move cells above down to fill in space and mark as dirty (re-evaluated on next cycle)
      for (let col in dirtyColRows) {
        if (dirtyColRows[col] >= 0) {
          for (let row = dirtyColRows[col]; row < grid[col].length; row++) {
            grid[col][row].row = row;
            grid[col][row].state = ECellState.DIRTY;
          }
        }
      }

      grid.forEach((colCells) => {
        colCells.forEach((c, row) => {
          if (c.row !== row) {
            console.error(">>> UNALIGNED COL DATA!!! (2)", pieceCol, grid)
          }
        });
    });

      // don't match on this cycle if we just deleted (wait until next cycle)
      if (!updateGrid) {
        // change cells to MATCHED, if matched with DIRTY cells
        const matchedCells: CellData[] = [];
        let jewelboxMatchType: ECellType = ECellType.JEWELBOX;

        grid.forEach((colCells) => {
          colCells.forEach((cell) => {

            if (cell.state === ECellState.DIRTY) {
              let matched = false;
              
              if (cell.type === ECellType.JEWELBOX) {
                matched = true;
                
                if (cell.row > 0) {
                  const matchType = grid[cell.col][cell.row - 1].type;
                  if (matchType !== ECellType.JEWELBOX) {
                    jewelboxMatchType = grid[cell.col][cell.row - 1].type;
                  }
                }
              }

              let nwse = [cell];
              getCellMatches(cell, -1, 1, nwse);
              getCellMatches(cell, 1, -1, nwse);
              if (nwse.length >= MATCH_SIZE) {
                console.log(">>> MATCHED [NWSE]");
                matchedCells.push.apply(matchedCells, nwse);
                updateGrid = true;
                matched = true;
              }

              let ns = [cell];
              getCellMatches(cell, 0, 1, ns);
              getCellMatches(cell, 0, -1, ns);
              if (ns.length >= MATCH_SIZE) {
                console.log(">>> MATCHED [NS]");
                matchedCells.push.apply(matchedCells, ns);
                updateGrid = true;
                matched = true;
              }

              let nesw = [cell];
              getCellMatches(cell, 1, 1, nesw);
              getCellMatches(cell, -1, -1, nesw);
              if (nesw.length >= MATCH_SIZE) {
                console.log(">>> MATCHED [NESW]");
                matchedCells.push.apply(matchedCells, nesw);
                updateGrid = true;
                matched = true;
              }

              let ew = [cell];
              getCellMatches(cell, -1, 0, ew);
              getCellMatches(cell, 1, 0, ew);
              if (ew.length >= MATCH_SIZE) {
                console.log(">>> MATCHED [EW]");
                matchedCells.push.apply(matchedCells, ew);
                updateGrid = true;
                matched = true;
              }

              if (!matched) {
                cell.state = ECellState.CLEAN;
              }
            };
          });
        });

        // if the jewelbox piece touched another type, mark all types as MATCHED
        if (jewelboxMatchType != ECellType.JEWELBOX) {
          grid.forEach(colCells => colCells.forEach(cell => {
            if (cell.type === jewelboxMatchType) {
              matchedCells.push(cell);
            }
          }));
        }

        if (matchedCells.length > 0) {
          let matchScore = 0;
          matchedCells.forEach(c => {
            if (c.state !== ECellState.MATCHED) {
              c.state = ECellState.MATCHED;
              matchScore += getCellScore(c.type) * (matchScoreChain.length + 1);
            }
          });

          setMatchScoreChain([...matchScoreChain, matchScore]);
          setScore(prev => prev + matchScore);

          sfxChime.play();
        }
      }

      if (updateGrid) {
        setGrid([...grid])
        evaluateGridTimerRef.current = setTimeout(() => setEvaluateGrid(true), MATCH_DELAY);
      }
      else {
        if (grid.some(colCells => colCells.length >= ROWS)) {
          setLives(prev => prev - 1);
        }
        else {
          const delay = setMatchScoreChain.length > 0
            ? speed / 2
            : speed;
          loadNextPiece(delay);
        }
      }
    };

    if (evaluateGrid) {
      setEvaluateGrid(false);
      performEvaluateGrid();
    }
  }, [evaluateGrid])

  function getCellMatches(cell: CellData, offsetX: number, offsetY: number, matchingCells: CellData[]) {
    const matchCol = cell.col + offsetX;
    const matchRow = cell.row + offsetY;
    if (matchCol < 0 || matchCol >= COLS || matchRow < 0 || matchRow >= ROWS || matchRow >= grid[matchCol].length) {
      return matchingCells;
    }

    const matchCell = grid[matchCol][matchRow];
    if (matchCell.type == cell.type) {
      matchingCells.push(matchCell);
      return getCellMatches(matchCell, offsetX, offsetY, matchingCells);
    }
    else {
      return matchingCells;
    }
  }

  useEffect(() => {
    const scoreLevel = getLevelFromScore(score);
    setLevel(scoreLevel);
  }, [score]);


  //
  // handlers
  //

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    event.preventDefault();

    if (gameState !== EGameState.STARTED) {
      return;
    }

    switch (event.key) {
      case "ArrowRight":
        setPieceCol(prev => 
          prev < COLS - 1 && grid[prev + 1].length <= pieceRow
            ? prev + 1
            : prev
        );
        break;

      case "ArrowLeft":
        setPieceCol(prev => 
          prev > 0 && grid[prev - 1].length <= pieceRow
            ? prev - 1
            : prev
        );
        break;

      case "ArrowUp":
        const rotatedPiece = piece.map((_, i) => piece.at(i-1)!);
        setPiece(rotatedPiece);
        break;
      
      case "ArrowDown":
        setMovePieceDown(true);
        break

      case " ":
        setPieceRow(() => grid[pieceCol].length);
        break;

      default:
        break;
    }
  }

  //
  // render
  //

  function renderNextPiece(): React.ReactElement[] {
    return nextPiece.map((c, row) => {
      return <Cell key={c.id} cell={{...c, row: row, col: 0} } rowCount={PIECE_SIZE}/>
    });
  }
  
  function renderGrid(pieceRow: number, pieceCol: number): React.ReactElement[] {
    const pieceCells = piece.map((c, row) => {
      c.row = pieceRow + row;
      c.col = pieceCol;
      return <Cell key={c.id} cell={c} rowCount={ROWS}/>
    });

    const gridCells = grid.map((colCells) => {
      return colCells.map((c) => {
        return <Cell key={c.id} cell={c} rowCount={ROWS}/>
      });
    });

    return gridCells.flat().concat(pieceCells);
  }

  function renderLives(lives: number): React.ReactElement[] {
    const lifeDots = [];
    for (let i = 0; i < lives; i++) {
      lifeDots.push(
        <div key={i} className="rounded-full w-4 h-4 bg-white"></div>
      );
    }
    return lifeDots;
  };

  function renderMatchScoreChain(matchScoreChain: number[]) {

    // const getTextSizeClass = (i: number) => {
    //   return ``
    // };

    return matchScoreChain.map((score, i) => {
      return (
        <div key={i} className={`text-${i > 1 ? i : ""}xl animate-pulse fade-out-text font-extrabold text-white`}>
          { score }
        </div>
      )
    })
  };

  return (
    <>
      <div className="flex flex-row gap-4">
        <div className="flex flex-col items-center h-full mt-8 gap-2">
          <div className="flex flex-col items-center">
            <span className="text-md font-semibold text-amber-400">LIVES</span>
            <div className="border-2 border-amber-400">
              <div className="border-2 border-black">
                <div className="flex bg-gray-700 text-white border-2 border-gray-700 box-content p-2">
                  <div className="flex flex-row gap-2 justify-center items-center w-[76px] h-7">
                    {renderLives(lives)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-md font-semibold text-amber-400">LEVEL</span>
            <div className="border-2 border-amber-400">
              <div className="border-2 border-black">
                <div className="flex bg-gray-700 text-white border-2 border-gray-700 box-content p-2">
                  <div className="flex justify-center w-[76px]">
                    <span className="text-white text-lg font-semibold">{level}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-md font-semibold text-amber-400">SCORE</span>
            <div className="border-2 border-amber-400">
              <div className="border-2 border-black">
                <div className="flex bg-gray-700 text-white border-2 border-gray-700 box-content p-2">
                  <div className="flex justify-center w-[76px]">
                    <span className="text-white text-lg font-semibold">{score}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 justify-center">
            { renderMatchScoreChain(matchScoreChain) }
          </div>
        </div>
        
        <div>
          <div className="border-2 border-amber-400 focus:outline-0"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            ref={boardRef}
          >
            <div className="border-2 border-black">
              <div className="relative flex bg-gray-700 text-white border-2 border-gray-700 box-content overflow-hidden"
                style={{ width: `${COLS * UNIT}px`, height: `${ROWS * UNIT}px` }}
              >
                {
                  hasStarted()
                  && 
                  renderGrid(pieceRow, pieceCol)
                }
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center h-full mt-8">
          <span className="text-md font-semibold text-amber-400">NEXT</span>
          <div className="border-2 border-amber-400">
            <div className="border-2 border-black">
              <div className="flex bg-gray-700 text-white border-2 border-gray-700 box-content p-4">
                <div className="relative" style={{ width: UNIT, height: UNIT * PIECE_SIZE }}>
                  { renderNextPiece() }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-row gap-4">
        <button
          className="bg-green-600 text-white text-lg
                    font-semibold rounded-sm mt-4 py-1 px-2
                    cursor-pointer
                    hover:bg-green-500
                    active:bg-green-700"
          onMouseUp={() => 
            setGameState(EGameState.STARTING)
          }
        >
          { hasStarted() ? "RESTART" : "START" }
        </button>
        <button
          className="bg-gray-700 text-white text-lg
                    font-semibold rounded-sm mt-4 py-1 px-2
                    cursor-pointer
                    hover:bg-gray-600
                    active:bg-gray-800"
          disabled={!hasStarted()}
          onMouseUp={() => 
            setGameState(gameState === EGameState.STARTED
              ? EGameState.PAUSED
              : EGameState.STARTED
            )
          }
        >
          PAUSE
        </button>
      </div>
    </>
  );
}

export default Board;
