
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

import {
  COLS,
  DEBUG_COLORS,
  EJewelState,
  EJewelType,
  EGameState,
  MATCH_DELAY,
  MATCH_SIZE,
  NEW_LIFE_DELAY,
  PIECE_SIZE,
  ROWS,
  STARTING_LIVES,
  UNIT
} from "../../types/constants";
import Jewel from "../jewel/Jewel";
import { generateEmptyBoard, generateNewPiece, getLevelData, START_COL, START_ROW } from "./boardHelpers";
import { getJewelValue, isRareJewel } from "../jewel/jewelHelpers";
import Box from "../box/Box";
import type { BoxData } from "../../types/boxData";

function Board() {

  //
  // states
  //

  const musicRef = useRef(new Audio(jewelboxMusic));
  const sfxMatch1Ref = useRef(new Audio(matchChime1));
  const sfxMatch2Ref = useRef(new Audio(matchChime2));
  const sfxMatch3Ref = useRef(new Audio(matchChime3));
  const sfxMatch4Ref = useRef(new Audio(matchChime4));
  const sfxMatch5Ref = useRef(new Audio(matchChime5));
  const sfxMatch6Ref = useRef(new Audio(matchChime6));
  const sfxMatchRareRef = useRef(new Audio(matchChimeRare));
  const sfxJewelboxAlertRef = useRef(new Audio(jewelboxAlert));
  const sfxNewLifeRef = useRef(new Audio(newLifeSound));

  const [gameState, setGameState] = useState(EGameState.NONE);
  const [pieceCol, setPieceCol] = useState(START_COL);
  const [pieceRow, setPieceRow] = useState(START_ROW);
  const [piece, setPiece] = useState<BoxData[]>([]);
  const [nextPiece, setNextPiece] = useState<BoxData[]>([]);
  const [grid, setGrid] = useState<BoxData[][]>([]);
  const [lives, setLives] = useState(0);
  const [score, setScore] = useState(0);
  const [matchChain, setMatchChain] = useState<number[]>([]);

  const [callLoadNextPiece, setCallLoadNextPiece] = useState(false);
  const delayLoadNextPieceTimerRef = useRef(0);
  const [callMovePieceDown, setCallMovePieceDown] = useState(false);
  const delayMovePieceDownTimerRef = useRef(0);
  const [callEvaluateGrid, setCallEvaluateGrid] = useState(false);
  const delayEvaluateGridTimerRef = useRef(0);
  const delayRemoveLifeTimerRef = useRef(0);
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

      musicRef.current.pause();
      musicRef.current.currentTime = 0;
      musicRef.current.loop = true;
      musicRef.current.play();
  
      initializeNewGame();

      setGameState(EGameState.STARTED);
    }
    else if (gameState === EGameState.STARTED) {
      // continue by movie piece if we have one
      if (piece.length > 0) {
        movePieceDown();
      }
      // else, continue by re-evaluating the board (will call delayLoadNextPiece())
      else {
        evaluateGrid();
      }

      musicRef.current.loop = true;
      musicRef.current.play();
    }
    else if (gameState === EGameState.PAUSED) {
      stopTimers();
      musicRef.current.pause();
    }
    else if (gameState === EGameState.ENDED) {
      stopTimers();
      musicRef.current.pause();

      console.log("=== GAME OVER ===");
    }

    setBoardFocus();

  }, [gameState])

  function stopTimers() {
    clearInterval(delayMovePieceDownTimerRef.current);
    delayMovePieceDownTimerRef.current = 0;

    clearTimeout(delayLoadNextPieceTimerRef.current);
    delayLoadNextPieceTimerRef.current = 0;

    clearTimeout(delayEvaluateGridTimerRef.current);
    delayEvaluateGridTimerRef.current = 0;

    clearTimeout(delayRemoveLifeTimerRef.current);
    delayRemoveLifeTimerRef.current = 0;
  }

  function hasStarted(): boolean {
    return [EGameState.STARTED, EGameState.PAUSED].includes(gameState);
  }

  function setBoardFocus() {
    if (boardRef.current) {
      boardRef.current.focus();
    }
  }

  function delayRemoveLife() {
    if (delayRemoveLifeTimerRef.current) {
      clearTimeout(delayRemoveLifeTimerRef.current);
    }

    delayRemoveLifeTimerRef.current = setTimeout(
      () => setLives(prev => prev - 1),
      NEW_LIFE_DELAY
    );

    sfxNewLifeRef.current.play();
  }

  useEffect(() => {
    if (gameState === EGameState.STARTED) {
      if (lives === 0) {
        setGameState(EGameState.ENDED);
      } else if (lives < STARTING_LIVES) {
        initializeNewBoard();
        delayLoadNextPiece(getLevelData(score).speed);
      }
    }
  }, [lives]);


  //
  // main methods
  //

  function delayLoadNextPiece(delay: number) {
    // set next piece position immediately to allow movement before making new piece
    setPieceCol(START_COL);
    setPieceRow(START_ROW);

    if (delayLoadNextPieceTimerRef.current) {
      clearTimeout(delayLoadNextPieceTimerRef.current);
    }

    delayLoadNextPieceTimerRef.current = setTimeout(
      () => {
        setCallLoadNextPiece(true);
        delayLoadNextPieceTimerRef.current = 0;
      },
      delay
    );
  };

  useEffect(() => {
    if (callLoadNextPiece) {
      setCallLoadNextPiece(false);
      loadNextPiece();
    }
  }, [callLoadNextPiece]);

  function loadNextPiece() {
    // REMINDER: setPieceCol(START_COL) + setPieceRow(START_ROW) needs to be called before this

    if (gameState !== EGameState.STARTED) {
      return;
    }

    setMatchChain(() => []);

    const newPiece = nextPiece.length === 0
      ? generateNewPiece(score, pieceCol)
      : nextPiece;

    // check if the active piece column can fit new piece
    if (grid[pieceCol].length > pieceRow) {
      delayRemoveLife();
    }
    else {
      setPiece(() => newPiece);
      delayMovePieceDown();

      const newNextPiece = generateNewPiece(score, START_COL);
      if (newNextPiece.some(b => b.jewel.type === EJewelType.JEWELBOX)) {
        sfxJewelboxAlertRef.current.play();
      }

      setNextPiece(() => newNextPiece);
    }
  }

  function delayMovePieceDown() {
    if (delayMovePieceDownTimerRef.current) {
      clearTimeout(delayMovePieceDownTimerRef.current);
    }

    delayMovePieceDownTimerRef.current = setTimeout(
      () => {
        setCallMovePieceDown(true);
        delayMovePieceDownTimerRef.current = 0;
      },
      getLevelData(score).speed
    );
  }

  useEffect(() => {
    if (callMovePieceDown) {
      setCallMovePieceDown(false);
      movePieceDown();
    }
  }, [callMovePieceDown])

  function movePieceDown() {
    if (piece.length === 0) {
      return;
    }

    setPieceRow(prev => {
      if (prev === grid[pieceCol].length) {
        const newGrid = [...grid];

        piece.forEach((b) => newGrid[pieceCol].push(b));
        newGrid[pieceCol].forEach((b, row) => {
          if (b.row !== row) {
            console.error(">>> UNALIGNED COL DATA!!! (1)", pieceCol, grid)
          }
        });

        setPiece([]);
        setGrid(newGrid);
        setCallEvaluateGrid(true);

        return prev;
      }

      delayMovePieceDown();

      return prev - 1;
    });
  };

  function delayEvaluateGrid() {
    if (delayEvaluateGridTimerRef.current) {
      clearTimeout(delayEvaluateGridTimerRef.current);
    }

    delayEvaluateGridTimerRef.current = setTimeout(
      () => {
        setCallEvaluateGrid(true);
        delayEvaluateGridTimerRef.current = 0;
      },
      MATCH_DELAY
    );
  }

  useEffect(() => {
    if (callEvaluateGrid) {
      setCallEvaluateGrid(false);
      evaluateGrid();
    }
  }, [callEvaluateGrid])

  function evaluateGrid() {
    let updateGrid = false;

    // remove MATCHED boxes
    const deleteBoxes: BoxData[] = [];
    grid.forEach((colBoxes) => {
      colBoxes.forEach(b => {
        if (b.jewel.state === EJewelState.MATCHED) {
          deleteBoxes.push(b);
          updateGrid = true;
        }
      });
    });

    const dirtyColRows: number[] = Array.from({ length: COLS }, () => -1);
    for (let i = deleteBoxes.length - 1; i >= 0; i--) {
      dirtyColRows[deleteBoxes[i].col] = deleteBoxes[i].row;
      grid[deleteBoxes[i].col].splice(deleteBoxes[i].row, 1);
    };

    // move boxes above down to fill in space and mark as DIRTY (re-evaluated on next cycle)
    for (let col in dirtyColRows) {
      if (dirtyColRows[col] >= 0) {
        for (let row = dirtyColRows[col]; row < grid[col].length; row++) {
          grid[col][row].row = row;
          grid[col][row].jewel.state = EJewelState.DIRTY;
        }
      }
    }

    grid.forEach((colBoxes) => {
      colBoxes.forEach((b, row) => {
        if (b.row !== row) {
          console.error(">>> UNALIGNED COL DATA!!! (2)", pieceCol, grid)
        }
      });
    });

    // don't match on this cycle if we just deleted (wait until next cycle)
    if (!updateGrid) {
      // change boxes to MATCHED, if matched with DIRTY boxes
      const matchedBoxes: BoxData[] = [];
      let jewelboxMatchType: EJewelType = EJewelType.JEWELBOX;

      grid.forEach((colBoxes) => {
        colBoxes.forEach(b => {

          if (b.jewel.state === EJewelState.DIRTY) {
            let matched = false;

            if (b.jewel.type === EJewelType.JEWELBOX && !DEBUG_COLORS) {
              matched = true;

              if (b.row > 0) {
                const matchType = grid[b.col][b.row - 1].jewel.type;
                if (matchType !== EJewelType.JEWELBOX) {
                  jewelboxMatchType = grid[b.col][b.row - 1].jewel.type;
                }
              }
            }

            let nwse = [b];
            getJewelMatches(b, -1, 1, nwse);
            getJewelMatches(b, 1, -1, nwse);
            if (nwse.length >= MATCH_SIZE) {
              matchedBoxes.push.apply(matchedBoxes, nwse);
              updateGrid = true;
              matched = true;
            }

            let ns = [b];
            getJewelMatches(b, 0, 1, ns);
            getJewelMatches(b, 0, -1, ns);
            if (ns.length >= MATCH_SIZE) {
              matchedBoxes.push.apply(matchedBoxes, ns);
              updateGrid = true;
              matched = true;
            }

            let nesw = [b];
            getJewelMatches(b, 1, 1, nesw);
            getJewelMatches(b, -1, -1, nesw);
            if (nesw.length >= MATCH_SIZE) {
              matchedBoxes.push.apply(matchedBoxes, nesw);
              updateGrid = true;
              matched = true;
            }

            let ew = [b];
            getJewelMatches(b, -1, 0, ew);
            getJewelMatches(b, 1, 0, ew);
            if (ew.length >= MATCH_SIZE) {
              matchedBoxes.push.apply(matchedBoxes, ew);
              updateGrid = true;
              matched = true;
            }

            if (!matched) {
              b.jewel.state = EJewelState.CLEAN;
            }
          };
        });
      });

      // if the jewelbox piece touched another type, mark all types as MATCHED
      if (jewelboxMatchType != EJewelType.JEWELBOX) {
        grid.forEach(colBoxes => colBoxes.forEach(b => {
          if (b.jewel.type === jewelboxMatchType) {
            matchedBoxes.push(b);
          }
        }));
      }

      if (matchedBoxes.length > 0) {
        let matchScore = 0;
        let matchedRare = false;
        matchedBoxes.forEach(b => {
          if (b.jewel.state !== EJewelState.MATCHED) {
            b.jewel.state = EJewelState.MATCHED;
            matchScore += getJewelValue(b.jewel.type) * (matchChain.length + 1);
            if (isRareJewel(b.jewel.type)) {
              matchedRare = true;
            }
          }
        });

        setMatchChain([...matchChain, matchScore]);
        setScore(prev => prev + matchScore);

        if (matchedRare) {
          sfxMatchRareRef.current.play();
        }
        else {
          const chimes = [
            sfxMatch1Ref.current,
            sfxMatch2Ref.current,
            sfxMatch3Ref.current,
            sfxMatch4Ref.current,
            sfxMatch5Ref.current,
            sfxMatch6Ref.current
          ];
          const index = Math.min(matchChain.length, chimes.length - 1);
          chimes[index].play();
        }
      }
    }

    if (updateGrid) {
      setGrid([...grid]);
      delayEvaluateGrid();
    }
    else {
      // check if any column is above capacity
      if (grid.some(colJewels => colJewels.length > ROWS)) {
        delayRemoveLife();
      } 
      else {
        let speed = getLevelData(score).speed;
        if (matchChain.length > 0) {
          speed = speed / 2;
        }

        delayLoadNextPiece(speed);
      }
    }
  };

  function getJewelMatches(box: BoxData, offsetX: number, offsetY: number, matchingBoxes: BoxData[]) {
    const matchCol = box.col + offsetX;
    const matchRow = box.row + offsetY;
    if (matchCol < 0 || matchCol >= COLS || matchRow < 0 || matchRow >= ROWS || matchRow >= grid[matchCol].length) {
      return matchingBoxes;
    }

    const matchBox = grid[matchCol][matchRow];
    if (matchBox.jewel.type == box.jewel.type) {
      matchingBoxes.push(matchBox);
      return getJewelMatches(matchBox, offsetX, offsetY, matchingBoxes);
    }
    else {
      return matchingBoxes;
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
          movePieceDown();
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
    return nextPiece.map((b, row) => {
      return <Box key={b.id} box={{...b, row: row, col: 0} } rowCount={PIECE_SIZE}/>
    });
  }
  
  function renderGrid(): React.ReactElement[] {
    const pieceBoxes = piece.map((b, row) => {
      b.row = pieceRow + row;
      b.col = pieceCol;
      return <Box key={b.id} box={b} rowCount={ROWS}/>
    });

    const gridBoxes = grid.map((colBoxes) => {
      return colBoxes.map(b => {
        return <Box key={b.id} box={b} rowCount={ROWS}/>
      });
    });

    return gridBoxes.flat().concat(pieceBoxes);
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
      && (
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
        <div className="flex flex-col items-end gap-8 mt-8 w-[400px] h-[calc(full - 8rem)]">
          <div className="flex flex-col items-center">
            <div className="text-lg font-semibold text-amber-400">
              LIVES
            </div>
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
            <div className="text-lg font-semibold text-amber-400">
              LEVEL
            </div>
            <div className="border-2 border-amber-400">
              <div className="border-2 border-black">
                <div className="flex bg-gray-700 text-white border-2 border-gray-700 box-content p-2">
                  <div className="flex justify-center w-[76px]">
                    <div className="text-white text-xl font-semibold">
                      {getLevelData(score).level}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-lg font-semibold text-amber-400">
              SCORE
            </div>
            <div className="border-2 border-amber-400">
              <div className="border-2 border-black">
                <div className="flex bg-gray-700 text-white border-2 border-gray-700 box-content p-2">
                  <div className="flex justify-center w-[76px]">
                    <div className="text-white text-xl font-semibold">
                      {score}
                    </div>
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

        <div className="flex flex-col items-start mt-8 gap-8 w-[400px] h-[calc(full - 8rem)]">
          <div className="flex flex-col items-center">
            <div className="text-lg font-semibold text-amber-400">
              NEXT
            </div>
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
          <div className="flex flex-col items-start justify-end gap-4 h-full">
            {
              getLevelData(score).level > 9
              &&
              <div>
                <div className="text-lg font-semibold text-amber-400">LUX</div>
                <div className="relative flex gap-2 items-center">
                  <Jewel jewel={{ type: EJewelType.LUX_1, state: EJewelState.CLEAN }} />
                  <div className="text-sm font-semibold text-white">= 600</div>
                </div>
              </div>
            }

            <div>
              <div className="text-lg font-semibold text-amber-400">RARE</div>
              <div className="relative flex gap-2 items-center">
                <Jewel jewel={{ type: EJewelType.RARE_1, state: EJewelState.CLEAN }} />
                {
                  getLevelData(score).level > 7
                  &&
                  <Jewel jewel={{ type: EJewelType.RARE_2, state: EJewelState.CLEAN }} />
                }
                <div className="text-sm font-semibold text-white">= 300</div>
              </div>
            </div>

            <div>
              <div className="text-lg font-semibold text-amber-400">VALUE</div>
              <div className="relative flex gap-2 items-center">
                <Jewel jewel={{ type: EJewelType.VALUE_1, state: EJewelState.CLEAN }} />
                {
                  getLevelData(score).level > 1
                  &&
                  <Jewel jewel={{ type: EJewelType.VALUE_2, state: EJewelState.CLEAN }} />
                }
                {
                  getLevelData(score).level > 5
                  &&
                  <Jewel jewel={{ type: EJewelType.VALUE_3, state: EJewelState.CLEAN }} />
                }
                <div className="text-sm font-semibold text-white">= 100</div>
              </div>
            </div>

            <div>
              <div className="text-lg font-semibold text-amber-400">COMMON</div>
              <div className="relative flex gap-2 items-center">
                <Jewel jewel={{ type: EJewelType.COMMON_1, state: EJewelState.CLEAN }} />
                <Jewel jewel={{ type: EJewelType.COMMON_2, state: EJewelState.CLEAN }} />
                <Jewel jewel={{ type: EJewelType.COMMON_3, state: EJewelState.CLEAN }} />
                {
                  getLevelData(score).level <= 5
                  &&
                  <Jewel jewel={{ type: EJewelType.COMMON_4, state: EJewelState.CLEAN }} />
                }
                {
                  getLevelData(score).level > 3
                  &&
                  <Jewel jewel={{ type: EJewelType.COMMON_5, state: EJewelState.CLEAN }} />
                }
                <div className="text-sm font-semibold text-white"> = 50</div>
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
            (gameState === EGameState.PAUSED)
              ? "RESUME"
              : "PAUSE"
          }
        </button>
      </div>
    </>
  );
}

export default Board;
