
import { useEffect, useRef, useState } from "react";
import "./Board.css";

import jewelboxMusic from "../../resources/sounds/jewelbox.mp3";
import matchChime1 from "../../resources/sounds/chime_1.mp3";
import matchChime2 from "../../resources/sounds/chime_2.mp3";
import matchChime3 from "../../resources/sounds/chime_3.mp3";
import matchChime4 from "../../resources/sounds/chime_4.mp3";
import matchChime5 from "../../resources/sounds/chime_5.mp3";
import matchChime6 from "../../resources/sounds/chime_6.mp3";
import matchChimeRare from "../../resources/sounds/chime_rare.mp3";
import jewelboxAlert from "../../resources/sounds/jewelbox_alert.mp3";
import newLifeSound from "../../resources/sounds/life.mp3";
import jewelboxImage from "../../resources/images/jewelbox.png";

import { COLS, DEBUG_COLORS, ECellState, ECellType, EGameState, MATCH_DELAY, MATCH_SIZE, NEW_LIFE_DELAY, PIECE_SIZE, ROWS, STARTING_LIVES, UNIT } from "../../types/constants";
import type { CellData } from "../../types/cellData";
import Cell from "../cell/Cell";
import { generateEmptyBoard, generateNewPiece, getCellScore, getLevelData, START_COL, START_ROW } from "./boardHelpers";
import { isRare } from "../cell/cellHelpers";

function Board() {

  //
  // states
  //

  const [music] = useState(new Audio(jewelboxMusic));
  const [sfxMatch1] = useState(new Audio(matchChime1));
  const [sfxMatch2] = useState(new Audio(matchChime2));
  const [sfxMatch3] = useState(new Audio(matchChime3));
  const [sfxMatch4] = useState(new Audio(matchChime4));
  const [sfxMatch5] = useState(new Audio(matchChime5));
  const [sfxMatch6] = useState(new Audio(matchChime6));
  const [sfxMatchRare] = useState(new Audio(matchChimeRare));
  const [sfxJewelboxAlert] = useState(new Audio(jewelboxAlert));
  const [sfxNewLife] = useState(new Audio(newLifeSound));
  const [gameState, setGameState] = useState(EGameState.NONE);

  const [pieceCol, setPieceCol] = useState(START_COL);
  const [pieceRow, setPieceRow] = useState(START_ROW);
  const [piece, setPiece] = useState<CellData[]>([]);
  const [nextPiece, setNextPiece] = useState<CellData[]>([]);
  const [loadNextPiece, setLoadNextPiece] = useState(false);
  const [movePieceDown, setMovePieceDown] = useState(false);
  const [grid, setGrid] = useState<CellData[][]>([]);
  const [evaluateGrid, setEvaluateGrid] = useState(false);
  const [lives, setLives] = useState(0);
  const [score, setScore] = useState(0);
  const [matchChain, setMatchChain] = useState<number[]>([]);

  const queueLoadNextPieceTimerRef = useRef(0);
  const queueMovePieceDownTimerRef = useRef(0);
  const queueEvaluateGridTimerRef = useRef(0);
  const queueRemoveLifeTimerRef = useRef(0);
  const boardRef = useRef<HTMLDivElement>(null);


  //
  // effects
  //

  function initializeNewGame() {
    setGrid(generateEmptyBoard());
    setPiece([]);
    setNextPiece([]);

    setLives(STARTING_LIVES);
    setScore(0);
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
      // continue by movie piece if we have one
      if (piece.length > 0) {
        setMovePieceDown(true);
      }
      // else, continue by re-evaluating the board (will trigger queueLoadNextPiece())
      else {
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

  function stopTimers() {
    clearInterval(queueMovePieceDownTimerRef.current);
    queueMovePieceDownTimerRef.current = 0;

    clearTimeout(queueLoadNextPieceTimerRef.current);
    queueLoadNextPieceTimerRef.current = 0;

    clearTimeout(queueEvaluateGridTimerRef.current);
    queueEvaluateGridTimerRef.current = 0;

    clearTimeout(queueRemoveLifeTimerRef.current);
    queueRemoveLifeTimerRef.current = 0;
  }

  function hasStarted(): boolean {
    return [EGameState.STARTED, EGameState.PAUSED].includes(gameState);
  }

  function setBoardFocus() {
    if (boardRef.current) {
      boardRef.current.focus();
    }
  }

  function queueRemoveLife() {
    if (queueRemoveLifeTimerRef.current) {
      clearTimeout(queueRemoveLifeTimerRef.current);
    }

    queueRemoveLifeTimerRef.current = setTimeout(
      () => setLives(prev => prev - 1),
      NEW_LIFE_DELAY
    );

    sfxNewLife.play();
  }

  useEffect(() => {
    if (gameState === EGameState.STARTED) {
      if (lives === 0) {
        setGameState(EGameState.ENDED);
      } else if (lives < STARTING_LIVES) {
        initializeNewBoard();
        queueLoadNextPiece(getLevelData(score).speed);
      }
    }
  }, [lives]);

  function queueLoadNextPiece(delay: number) {
    // set next piece position immediately to allow movement before making new piece
    setPieceCol(START_COL);
    setPieceRow(START_ROW);

    if (queueLoadNextPieceTimerRef.current) {
      clearTimeout(queueLoadNextPieceTimerRef.current);
    }

    queueLoadNextPieceTimerRef.current = setTimeout(
      () => setLoadNextPiece(true),
      delay
    );
  };

  useEffect(() => {
    const performLoadNextPiece = () => {
      setMatchChain([]);

      const newPiece = nextPiece.length === 0
        ? generateNewPiece(score, pieceCol)
        : nextPiece;

      // check if the active piece column can fit new piece
      if (grid[pieceCol].length > pieceRow) {
        queueRemoveLife();
      }
      else {
        setPiece(newPiece);

        const newNextPiece = generateNewPiece(score, START_COL);
        if (newNextPiece[2].type === ECellType.JEWELBOX) {
          sfxJewelboxAlert.play();
        }
        setNextPiece(newNextPiece);

        queueMovePieceDown();
      }
    }

    if (loadNextPiece) {
      setLoadNextPiece(false);
      if (gameState === EGameState.STARTED) {
        performLoadNextPiece();
      }
    }

  }, [loadNextPiece]);

  function queueMovePieceDown() {
    if (queueMovePieceDownTimerRef.current) {
      clearTimeout(queueMovePieceDownTimerRef.current);
    }

    queueMovePieceDownTimerRef.current = setTimeout(
      () => setMovePieceDown(true),
      getLevelData(score).speed
    );
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

        queueMovePieceDown();

        return prev - 1;
      });
    };

    if (movePieceDown) {
      setMovePieceDown(false);
      if (piece.length > 0) {
        performMovePieceDown();
      }
    }
  }, [movePieceDown]);

  function queueEvaluateGrid() {
    if (queueEvaluateGridTimerRef.current) {
      clearTimeout(queueEvaluateGridTimerRef.current);
    }

    queueEvaluateGridTimerRef.current = setTimeout(
      () => setEvaluateGrid(true),
      MATCH_DELAY
    );
  }

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
              
              if (cell.type === ECellType.JEWELBOX && !DEBUG_COLORS) {
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
                matchedCells.push.apply(matchedCells, nwse);
                updateGrid = true;
                matched = true;
              }

              let ns = [cell];
              getCellMatches(cell, 0, 1, ns);
              getCellMatches(cell, 0, -1, ns);
              if (ns.length >= MATCH_SIZE) {
                matchedCells.push.apply(matchedCells, ns);
                updateGrid = true;
                matched = true;
              }

              let nesw = [cell];
              getCellMatches(cell, 1, 1, nesw);
              getCellMatches(cell, -1, -1, nesw);
              if (nesw.length >= MATCH_SIZE) {
                matchedCells.push.apply(matchedCells, nesw);
                updateGrid = true;
                matched = true;
              }

              let ew = [cell];
              getCellMatches(cell, -1, 0, ew);
              getCellMatches(cell, 1, 0, ew);
              if (ew.length >= MATCH_SIZE) {
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
          let matchedRare = false;
          matchedCells.forEach(c => {
            if (c.state !== ECellState.MATCHED) {
              c.state = ECellState.MATCHED;
              matchScore += getCellScore(c.type) * (matchChain.length + 1);
              if (isRare(c.type)) {
                matchedRare = true;
              }
            }
          });

          setMatchChain([...matchChain, matchScore]);
          setScore(prev => prev + matchScore);

          
          if (matchedRare) {
            sfxMatchRare.play();
          }
          else {
            const chimes = [sfxMatch1, sfxMatch2, sfxMatch3, sfxMatch4, sfxMatch5, sfxMatch6];
            const index = Math.min(matchChain.length, chimes.length - 1);
            chimes[index].play();
          }
        }
      }

      if (updateGrid) {
        setGrid([...grid]);
        queueEvaluateGrid();
      }
      else {
        // check if any column is above capacity
        if (grid.some(colCells => colCells.length >= ROWS)) {
          queueRemoveLife();
        }
        else {
          let speed = getLevelData(score).speed;
          if (matchChain.length > 0) {
            speed = speed / 2;
          }

          queueLoadNextPiece(speed);
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
        if (piece.length) {
          const rotatedPiece = piece.map((_, i) => piece.at(i - 1)!);
          setPiece(rotatedPiece);
        }
        break;
      
      case "ArrowDown":
        if (piece.length) {
          setMovePieceDown(true);
        }
        break

      case " ":
        if (piece.length) {
          setPieceRow(() => grid[pieceCol].length);
        }
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
  
  function renderGrid(): React.ReactElement[] {
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

  function renderLives(): React.ReactElement[] {
    const lifeDots = [];
    for (let i = 0; i < lives; i++) {
      lifeDots.push(
        <div key={i} className="rounded-full w-4 h-4 bg-white"></div>
      );
    }
    return lifeDots;
  };

  function renderMatchChainScore() {
    const textClassNames = [
      "text-[16px]", "text-[20px]", "text-[26px]", "text-[34px]", "text-[44px]",
      "text-[56px]", "text-[70px]", "text-[86px]", "text-[104px]", "text-[124px]",
    ]
    
    return matchChain.map((score, i) => {
      return (
        <div key={i}
          className={`absolute
            ${textClassNames[i]} font-extrabold text-white match-chain-score-animation`
          }
        >
          { score }
        </div>
      )
    })
  };

  function renderMatchChainMultiplier(): React.ReactNode[] {
    if (matchChain.length <= 1) {
      return [];
    }

    const multipliers = [];
    for (let i = 1; i < matchChain.length; i++) {
      multipliers.push(
        <div key={i} className="absolute">
          <div className="border-shadow match-chain-multiplier-animation text-gray-900 text-[128px] font-bold">
            x{i+1}
          </div>
        </div>
      );
    }

    return multipliers;
  }

  function renderImage(): React.ReactNode {
    return [EGameState.ENDED, EGameState.NONE].includes(gameState)
      && false && (
        <div className="absolute">
          <img
            className="border-shadow"
            src={jewelboxImage}
            alt="jewelbox"
            height={UNIT * COLS / 2}
            width={UNIT * COLS / 2}
          />
        </div>
      );
  }

  return (
    <>
      <div className="flex flex-row gap-8">
        <div className="flex flex-col items-end gap-8 mt-8 w-[120px] h-[calc(full - 8rem)]">
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-amber-400">LIVES</span>
            <div className="border-2 border-amber-400">
              <div className="border-2 border-black">
                <div className="flex bg-gray-700 text-white border-2 border-gray-700 box-content p-2">
                  <div className="flex flex-row gap-2 justify-center items-center w-[76px] h-7">
                    {renderLives()}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-amber-400">LEVEL</span>
            <div className="border-2 border-amber-400">
              <div className="border-2 border-black">
                <div className="flex bg-gray-700 text-white border-2 border-gray-700 box-content p-2">
                  <div className="flex justify-center w-[76px]">
                    <span className="text-white text-xl font-semibold">{getLevelData(score).level}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-amber-400">SCORE</span>
            <div className="border-2 border-amber-400">
              <div className="border-2 border-black">
                <div className="flex bg-gray-700 text-white border-2 border-gray-700 box-content p-2">
                  <div className="flex justify-center w-[76px]">
                    <span className="text-white text-xl font-semibold">{score}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-[100px] p-2 flex flex-col items-center">
              {renderMatchChainScore()}
            </div>
          </div>
        </div>
        
        <div>
          <div className="border-2 border-amber-400 focus:outline-0"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            ref={boardRef}
          >
            <div className="border-2 border-black">
              <div className="relative flex justify-center items-center
                bg-gray-700 text-white border-2 border-gray-700 box-content overflow-hidden"
                style={{ width: `${COLS * UNIT}px`, height: `${ROWS * UNIT}px` }}
                onClick={() => {
                  if (!hasStarted()) {
                    setGameState(EGameState.STARTING);
                  }
                }}
              >
                { renderGrid() }
                { renderMatchChainMultiplier() }
                { renderImage() }
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start mt-8 w-[120px] h-[calc(full - 8rem)]">
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-amber-400">NEXT</span>
            <div className="border-2 border-amber-400">
              <div className="border-2 border-black">
                <div className="flex bg-gray-700 text-white border-2 border-gray-700 box-content p-4">
                  <div className="relative" style={{ width: UNIT, height: UNIT * PIECE_SIZE }}>
                    {renderNextPiece()}
                  </div>
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
          {
            (gameState === EGameState.STARTED)
              ? "PAUSE"
              : "RESUME"
          }
        </button>
      </div>
    </>
  );
}

export default Board;
