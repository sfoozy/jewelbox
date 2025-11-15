
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

const startingLevel = getLevelData(0);

import {
  DEBUG,
  SETTINGS,
  EJewelState,
  EJewelType,
  EGameState,
} from "../../types/constants";
import Jewel from "../jewel/Jewel";
import { generateEmptyBoard, generateNewPiece, getLevelData } from "./boardHelpers";
import { getJewelValue, isRareJewel } from "../jewel/jewelHelpers";
import Box from "../box/Box";
import type { BoxData } from "../../types/boxData";
import type { LevelData } from "../../types/levelData";

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
  const [piece, setPiece] = useState<BoxData[]>([]);
  const [nextPiece, setNextPiece] = useState<BoxData[]>([]);
  const [grid, setGrid] = useState<BoxData[][]>([]);
  const [lives, setLives] = useState(0);
  const [level, setLevel] = useState<LevelData>(startingLevel);
  const [score, setScore] = useState(0);
  const [matchChain, setMatchChain] = useState<number[]>([]);
  const boxId = useRef(0);

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

    setLives(SETTINGS.STARTING_LIVES);
    setScore(0);
  
    boxId.current = 0;
  }

  function initializeNewBoard() {
    setGrid(generateEmptyBoard());
    setPiece([]);
  
    boxId.current = 0;
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

  function setBoardFocus() {
    if (boardRef.current) {
      boardRef.current.focus();
    }
  }

  function delayRemoveLife() {
    if (delayRemoveLifeTimerRef.current) {
      clearTimeout(delayRemoveLifeTimerRef.current);
      delayRemoveLifeTimerRef.current = 0;
    }

    delayRemoveLifeTimerRef.current = setTimeout(
      () => {
        setLives(prev => prev - 1);
        delayRemoveLifeTimerRef.current = 0;
      },
      SETTINGS.NEW_LIFE_DELAY
    );

    sfxNewLifeRef.current.play();
  }

  useEffect(() => {
    if (gameState === EGameState.STARTED) {
      if (lives === 0) {
        setGameState(EGameState.ENDED);
      } else if (lives < SETTINGS.STARTING_LIVES) {
        initializeNewBoard();
        delayLoadNextPiece(level.speed);
      }
    }
  }, [lives]);

  useEffect(() => {
    setLevel(getLevelData(score));
  }, [Math.floor(score / 10000)]);


  //
  // main methods
  //

  function delayLoadNextPiece(delay: number) {
    if (delayLoadNextPieceTimerRef.current) {
      clearTimeout(delayLoadNextPieceTimerRef.current);
      delayLoadNextPieceTimerRef.current = 0;
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
    if (gameState !== EGameState.STARTED) {
      return;
    }

    // check if the active piece column can fit new piece
    if (nextPiece.length > 0 && grid[nextPiece[0].col].length > nextPiece[0].row) {
      delayRemoveLife();
    }
    else {
      setMatchChain(() => []);
      
      const newPiece = nextPiece.length > 0
        ? nextPiece
        : generateNewPiece(boxId, level);

      setPiece(() => newPiece);
      delayMovePieceDown();

      const newNextPiece = generateNewPiece(boxId, level);
      if (newNextPiece.some((box) => box.jewel.type === EJewelType.JEWELBOX)) {
        sfxJewelboxAlertRef.current.play();
      }

      setNextPiece(newNextPiece);
    }
  }

  function delayMovePieceDown(immediate = false) {
    if (delayMovePieceDownTimerRef.current) {
      clearTimeout(delayMovePieceDownTimerRef.current);
      delayMovePieceDownTimerRef.current = 0;
    }

    if (immediate) {
      setCallMovePieceDown(true);
    } else {
      delayMovePieceDownTimerRef.current = setTimeout(
        () => {
          setCallMovePieceDown(true);
          delayMovePieceDownTimerRef.current = 0;
        },
        level.speed
      );
    }
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

    if (piece[0].row === grid[piece[0].col].length) {
      const newGrid = [...grid];

      setPiece(() => []);
      setGrid(newGrid);
      setCallEvaluateGrid(true);
    }
    else {
      setPiece(prev => prev.map((box) => ({ ...box, row: box.row - 1 })));

      delayMovePieceDown();
    }
  };

  function delayEvaluateGrid() {
    if (delayEvaluateGridTimerRef.current) {
      clearTimeout(delayEvaluateGridTimerRef.current);
      delayEvaluateGridTimerRef.current = 0;
    }

    delayEvaluateGridTimerRef.current = setTimeout(
      () => {
        setCallEvaluateGrid(true);
        delayEvaluateGridTimerRef.current = 0;
      },
      SETTINGS.MATCH_DELAY
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
      colBoxes.forEach((box) => {
        if (box.jewel.state === EJewelState.MATCHED) {
          deleteBoxes.push(box);
          updateGrid = true;
        }
      });
    });

    const dirtyColRows: number[] = Array.from({ length: SETTINGS.COLS }, () => -1);
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

    // don't match on this cycle if we just deleted (wait until next cycle)
    if (!updateGrid) {
      // change boxes to MATCHED, if matched with DIRTY boxes
      const matchedBoxes: BoxData[] = [];
      let jewelboxMatchType: EJewelType = EJewelType.JEWELBOX;

      grid.forEach((colBoxes) => {
        colBoxes.forEach((box) => {

          if (box.jewel.state === EJewelState.DIRTY) {
            let matched = false;

            if (box.jewel.type === EJewelType.JEWELBOX && !DEBUG.COLORS) {
              matched = true;

              if (box.row > 0) {
                const matchType = grid[box.col][box.row - 1].jewel.type;
                if (matchType !== EJewelType.JEWELBOX) {
                  jewelboxMatchType = grid[box.col][box.row - 1].jewel.type;
                }
              }
            }

            let nwse = [box];
            getJewelMatches(box, -1, 1, nwse);
            getJewelMatches(box, 1, -1, nwse);
            if (nwse.length >= SETTINGS.MATCH_SIZE) {
              matchedBoxes.push.apply(matchedBoxes, nwse);
              updateGrid = true;
              matched = true;
            }

            let ns = [box];
            getJewelMatches(box, 0, 1, ns);
            getJewelMatches(box, 0, -1, ns);
            if (ns.length >= SETTINGS.MATCH_SIZE) {
              matchedBoxes.push.apply(matchedBoxes, ns);
              updateGrid = true;
              matched = true;
            }

            let nesw = [box];
            getJewelMatches(box, 1, 1, nesw);
            getJewelMatches(box, -1, -1, nesw);
            if (nesw.length >= SETTINGS.MATCH_SIZE) {
              matchedBoxes.push.apply(matchedBoxes, nesw);
              updateGrid = true;
              matched = true;
            }

            let ew = [box];
            getJewelMatches(box, -1, 0, ew);
            getJewelMatches(box, 1, 0, ew);
            if (ew.length >= SETTINGS.MATCH_SIZE) {
              matchedBoxes.push.apply(matchedBoxes, ew);
              updateGrid = true;
              matched = true;
            }

            if (!matched) {
              box.jewel.state = EJewelState.CLEAN;
            }
          };
        });
      });

      // if the jewelbox piece touched another type, mark all types as MATCHED
      if (jewelboxMatchType != EJewelType.JEWELBOX) {
        grid.forEach(colBoxes => colBoxes.forEach((box) => {
          if (box.jewel.type === jewelboxMatchType) {
            matchedBoxes.push(box);
          }
        }));
      }

      if (matchedBoxes.length > 0) {
        let matchScore = 0;
        let matchedRare = false;
        matchedBoxes.forEach((box) => {
          if (box.jewel.state !== EJewelState.MATCHED) {
            box.jewel.state = EJewelState.MATCHED;
            matchScore += getJewelValue(box.jewel.type) * (matchChain.length + 1);
            if (isRareJewel(box.jewel.type)) {
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
      if (grid.some(colJewels => colJewels.length > SETTINGS.ROWS)) {
        delayRemoveLife();
      } 
      else {
        let speed = level.speed;
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
    if (matchCol < 0 || matchCol >= SETTINGS.COLS
      || matchRow < 0 || matchRow >= SETTINGS.ROWS
      || matchRow >= grid[matchCol].length)
    {
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
      // we allow the next piece to be moved left/right before it is loaded
      case "ArrowRight":
        const setMovePiece = piece.length > 0 ? setPiece
          : nextPiece.length > 0 ? setNextPiece : null;
        setMovePiece!((prev) => {
          if (prev.length > 0
            && prev[0].col < SETTINGS.COLS - 1
            && prev[0].row >= grid[prev[0].col + 1].length)
          {
            return prev.map((box) => ({ ...box, col: box.col + 1 }));
          }
          return prev;
        });
        break;

      // we allow the next piece to be moved left/right before it is loaded
      case "ArrowLeft": {
        const setMovePiece = piece.length > 0 ? setPiece
          : nextPiece.length > 0 ? setNextPiece : null;
        setMovePiece!((prev) => {
          if (prev.length > 0
            && prev[0].col > 0
            && prev[0].row >= grid[prev[0].col - 1].length)
          {
            return prev.map((box) => ({ ...box, col: box.col - 1 }));
          }
          return prev;
        });
        break;
      }

      // only can rotate the active piece
      case "ArrowUp": {
        setPiece((prev) => {
          prev.forEach(box => console.log({...box}))

          if (prev.length > 0) {
            const rotatePiece = [];
            const rows = prev.map((box) => box.row);
            for (let i = 0; i < prev.length; i++) {
              rotatePiece.push({ ...prev.at(i - 1)!, row: rows[i] });
            }

            return rotatePiece;
          }
          return prev;
        });

        break;
      }
      
      // only can move down the active piece
      case "ArrowDown": {
        setPiece((prev) => {
          if (prev.length > 0 && prev[0].row > grid[prev[0].col].length) {
            const movePiece = prev.map((box) => ({ ...box, row: box.row + 1 }));
            return movePiece;
          }
          return prev;
        });
        break;
      }

      // only can drop the active piece
      case " ": {
        setPiece((prev) => {
          if (prev.length > 0) {
            const movePiece = prev.map((box, i) => ({ ...box, row: grid[box.col].length + i }));
            return movePiece;
          }
          return prev;
        });
        break;
      }

      default:
        break;
    }
  }


  //
  // render
  //

  function renderNextPiece(): React.ReactElement[] {
    return nextPiece.map((box, i) => {
      return <Jewel key={i} jewel={box.jewel} />
    });
  }
  
  function renderGrid(): React.ReactElement[] {
    const pieceBoxes = piece.map((box) => {
      return <Box key={box.id} box={box} rowCount={SETTINGS.ROWS} />
    });

    const gridBoxes = grid.map((colBoxes) => {
      return colBoxes.map((box) => {
        return <Box key={box.id} box={box} rowCount={SETTINGS.ROWS} />
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
            height={SETTINGS.UNIT * SETTINGS.COLS / 2}
            width={SETTINGS.UNIT * SETTINGS.COLS / 2}
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
                      {level.level}
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
                bg-gray-700 text-white border-2 border-gray-700 box-content overflow-hidden cursor-pointer"
                style={{ width: `${SETTINGS.COLS * SETTINGS.UNIT}px`, height: `${SETTINGS.ROWS * SETTINGS.UNIT}px` }}
                onClick={() => {
                  if (gameState === EGameState.PAUSED) {
                    setGameState(EGameState.STARTED);
                  }
                  else if (gameState === EGameState.STARTED) {
                    setGameState(EGameState.PAUSED);
                  }
                  else if ([EGameState.ENDED, EGameState.NONE].includes(gameState)) {
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
                  <div className="relative flex flex-col-reverse" style={{ width: SETTINGS.UNIT, height: SETTINGS.UNIT * SETTINGS.PIECE_SIZE }}>
                    {renderNextPiece()}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start justify-end gap-4 h-full mb-8">
            {
              level.jewelFrequency[EJewelType.LUXE_1] > 0
              &&
              <div>
                <div className="text-lg font-semibold text-amber-400">LUXE</div>
                <div className="relative flex gap-2 items-center">
                  <Jewel jewel={{ type: EJewelType.LUXE_1, state: EJewelState.CLEAN }} />
                  <div className="text-sm font-semibold text-white">= 600</div>
                </div>
              </div>
            }

            <div>
              <div className="text-lg font-semibold text-amber-400">RARE</div>
              <div className="relative flex gap-2 items-center">
                <Jewel jewel={{ type: EJewelType.RARE_1, state: EJewelState.CLEAN }} />
                {
                  level.jewelFrequency[EJewelType.RARE_2] > 0
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
                  level.jewelFrequency[EJewelType.VALUE_2] > 0
                  &&
                  <Jewel jewel={{ type: EJewelType.VALUE_2, state: EJewelState.CLEAN }} />
                }
                {
                  level.jewelFrequency[EJewelType.VALUE_3] > 0
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
                  level.jewelFrequency[EJewelType.COMMON_4] > 0
                  &&
                  <Jewel jewel={{ type: EJewelType.COMMON_4, state: EJewelState.CLEAN }} />
                }
                {
                  level.jewelFrequency[EJewelType.COMMON_5] > 0
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
          { [EGameState.STARTED, EGameState.PAUSED].includes(gameState) ? "RESTART" : "START" }
        </button>
        <button
          className="bg-gray-700 text-white text-lg
                    font-semibold rounded-sm mt-4 py-1 px-2
                    cursor-pointer
                    hover:bg-gray-600
                    active:bg-gray-800"
          disabled={![EGameState.STARTED, EGameState.PAUSED].includes(gameState)}
          onMouseUp={() => 
            setGameState(gameState === EGameState.PAUSED
              ? EGameState.STARTED
              : EGameState.PAUSED
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
