
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
import newLevelSound from "../../resources/sounds/level.mp3";
import jewelboxImage from "../../resources/images/jewelbox.png";

import {
  DEBUG,
  SETTINGS,
  EJewelState,
  EJewelType,
  EGameState,
} from "../../types/constants";
import { deepCopyGrid, generateEmptyBoard, generateNewPiece, getLevel, getLevelData } from "./boardHelpers";
import { getJewelValue, isJewelRare } from "../Jewel/jewelHelpers";
import Box from "../Box/Box";
import JewelDisplay from "../JewelDisplay/JewelDisplay";
import type { BoxData } from "../../types/boxData";
import type { LevelData } from "../../types/levelData";
import type { DropRowData } from "../../types/dropRowData";
import Display from "../Display/Display";
import Jewel from "../Jewel/Jewel";
import GameInformation from "../GameInformation/GameInformation";
import { deepCopyBox } from "../Box/boxHelpers";

const STARTING_LEVEL_DATA = getLevelData(0);

function Board() {

  //
  // states
  //

  const musicRef = useRef<HTMLAudioElement>(null);
  const sfxMatch1Ref = useRef<HTMLAudioElement>(null);
  const sfxMatch2Ref = useRef<HTMLAudioElement>(null);
  const sfxMatch3Ref = useRef<HTMLAudioElement>(null);
  const sfxMatch4Ref = useRef<HTMLAudioElement>(null);
  const sfxMatch5Ref = useRef<HTMLAudioElement>(null);
  const sfxMatch6Ref = useRef<HTMLAudioElement>(null);
  const sfxMatchRareRef = useRef<HTMLAudioElement>(null);
  const sfxJewelboxAlertRef = useRef<HTMLAudioElement>(null);
  const sfxNewLifeRef = useRef<HTMLAudioElement>(null);
  const sfxNewLevelRef = useRef<HTMLAudioElement>(null);

  const [gameState, setGameState] = useState(EGameState.NONE);
  const [lives, setLives] = useState(0);
  const [levelData, setLevelData] = useState<LevelData>(STARTING_LEVEL_DATA);
  const [score, setScore] = useState(0);
  const [piece, setPiece] = useState<BoxData[]>([]);
  const [nextPiece, setNextPiece] = useState<BoxData[]>([]);
  const [grid, setGrid] = useState<BoxData[][]>([]);
  const [evaluateGrid, setEvaluateGrid] = useState(false);
  const [matchChain, setMatchChain] = useState<number[]>([]);
  const [dropRow, setDropRow] = useState<DropRowData>({ distance: 0, col: -1, startRow: -1 });
  const [forceJewelBoxCount, setForceJewelBoxCount] = useState(0);

  const boxId = useRef(0);

  const delayLoadPieceTimerRef = useRef(0);
  const delayMovePieceDownTimerRef = useRef(0);
  const delayUpdateGridTimerRef = useRef(0);
  const delayRemoveLifeTimerRef = useRef(0);

  const boardRef = useRef<HTMLDivElement>(null);


  //
  // intiialize
  //

  useEffect(() => {
    musicRef.current = new Audio(jewelboxMusic);
    sfxMatch1Ref.current = new Audio(matchChime1);
    sfxMatch2Ref.current = new Audio(matchChime2);
    sfxMatch3Ref.current = new Audio(matchChime3);
    sfxMatch4Ref.current = new Audio(matchChime4);
    sfxMatch5Ref.current = new Audio(matchChime5);
    sfxMatch6Ref.current = new Audio(matchChime6);
    sfxMatchRareRef.current = new Audio(matchChimeRare);
    sfxJewelboxAlertRef.current = new Audio(jewelboxAlert);
    sfxNewLifeRef.current = new Audio(newLifeSound);
    sfxNewLevelRef.current = new Audio(newLevelSound);

    return () => stopTimers();
  }, []);


  //
  // game state
  //

  useEffect(() => {
    if (gameState === EGameState.STARTING) {
      stopTimers();

      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current.currentTime = 0;
        musicRef.current.loop = true;
        musicRef.current.play();
      }
  
      initializeNewGame();

      setGameState(EGameState.STARTED);
    }
    else if (gameState === EGameState.STARTED) {
      // continue by movie piece if we have one
      if (piece.length > 0) {
        queueMovePieceDown(1, true, false);
      }
      // else, continue by re-evaluating the board
      else {
        performEvaluateGrid();
      }

      if (musicRef.current) {
        musicRef.current.loop = true;
        musicRef.current.play();
      }
    }
    else if (gameState === EGameState.PAUSED) {
      stopTimers();
      musicRef.current?.pause();
    }
    else if (gameState === EGameState.ENDED) {
      stopTimers();
      musicRef.current?.pause();
      console.log("=== GAME OVER ===");
    }

    setBoardFocus();

  }, [gameState])

  function stopTimers() {
    clearTimeout(delayLoadPieceTimerRef.current);
    delayLoadPieceTimerRef.current = 0;

    clearTimeout(delayMovePieceDownTimerRef.current);
    delayMovePieceDownTimerRef.current = 0;

    clearTimeout(delayUpdateGridTimerRef.current);
    delayUpdateGridTimerRef.current = 0;

    clearTimeout(delayRemoveLifeTimerRef.current);
    delayRemoveLifeTimerRef.current = 0;
  }

  function initializeNewGame() {
    setGrid(generateEmptyBoard());
    setPiece([]);
    setNextPiece([]);
    setForceJewelBoxCount(0);

    setLives(SETTINGS.STARTING_LIVES);
    setLevelData(STARTING_LEVEL_DATA);
    setScore(0);

    boxId.current = 0;
  }

  function initializeNewBoard() {
    setGrid(generateEmptyBoard());
    setPiece([]);

    boxId.current = 0;
  }

  function setBoardFocus() {
    if (boardRef.current) {
      boardRef.current.focus();
    }
  }


  //
  // remove life
  //

  function queueRemoveLife() {
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

    sfxNewLifeRef.current!.play();
  }

  useEffect(() => {
    if (gameState === EGameState.STARTED) {
      if (lives === 0) {
        setGameState(EGameState.ENDED);
      } else if (lives < SETTINGS.STARTING_LIVES) {
        initializeNewBoard();
        queueLoadPiece(levelData.speed);
      }
    }
  }, [lives]);


  //
  // update score/level
  //

  function updateScore(addScore: number) {
    setScore((prev) => {
      const newScore = prev + addScore;
      const newLevel = getLevel(newScore);
      if (newLevel > levelData.level) {
        setLevelData(getLevelData(newLevel));
        sfxNewLevelRef.current!.play();

        setForceJewelBoxCount((prev) => prev + (newLevel - levelData.level)); // jewelbox on new level
      }

      return newScore;
    });
  }

  //
  // load piece
  //

  function queueLoadPiece(delayTime: number) {
    if (delayLoadPieceTimerRef.current) {
      clearTimeout(delayLoadPieceTimerRef.current);
      delayLoadPieceTimerRef.current = 0;
    }

    delayLoadPieceTimerRef.current = setTimeout(
      () => {
        loadPiece();
        delayLoadPieceTimerRef.current = 0;
      },
      delayTime
    );

    function loadPiece() {
      if (gameState !== EGameState.STARTED) {
        return;
      }

      // check if the active piece column can fit new piece
      if (nextPiece.length > 0 && grid[nextPiece[0].col].length > nextPiece[0].row) {
        queueRemoveLife();
      }
      else {
        setMatchChain([]);
        setDropRow({ distance: 0, col: -1, startRow: -1 });

        const newPiece = nextPiece.length > 0
          ? nextPiece
          : generateNewPiece(boxId, levelData, false);

        setPiece(newPiece);
        queueMovePieceDown(1, false, false);

        const newNextPiece = generateNewPiece(boxId, levelData, forceJewelBoxCount > 0);

        setForceJewelBoxCount((prev) => Math.max(prev - 1, 0));

        if (newNextPiece.some((box) => box.jewel.type === EJewelType.JEWELBOX)) {
          sfxJewelboxAlertRef.current!.play();
        }

        setNextPiece(newNextPiece);
      }
    }
  };


  //
  //  move piece
  //

  function cancelDelayMovePieceDown() {
    if (delayMovePieceDownTimerRef.current) {
      clearTimeout(delayMovePieceDownTimerRef.current);
      delayMovePieceDownTimerRef.current = 0;
    }
  }

  function queueMovePieceDown(rows: number, immediate: boolean, lock: boolean) {
    cancelDelayMovePieceDown();

    if (immediate) {
      movePieceDown(rows, immediate && lock);
    } else {
      delayMovePieceDownTimerRef.current = setTimeout(
        () => {
          movePieceDown(rows, false);
          delayMovePieceDownTimerRef.current = 0;
        },
        levelData.speed
      );
    }

    function movePieceDown(rows: number, immediate: boolean) {
      setPiece((prev) => {
        if (prev.length === 0) {
          return prev;
        }

        const newPiece = prev.map((box) => ({ ...deepCopyBox(box), row: box.row - rows }));
        const transferPiece = prev[0].row === grid[prev[0].col].length
          ? prev
          : immediate && newPiece[0].row === grid[newPiece[0].col].length
            ? newPiece
            : null;

        if (transferPiece) {
          // transfer piece to grid
          const newGrid = deepCopyGrid(grid);
          transferPiece.forEach((box) => newGrid[box.col].push(box));
          queueUpdateGrid(newGrid, true);
          return [];
        }
        else if (newPiece[0].row < grid[newPiece[0].col].length) {
          console.error(">>> ERROR: piece overlapping grid!", prev, grid);
        }

        queueMovePieceDown(1, false, false);
        return newPiece;
      });
    };
  }


  //
  // update & evaluate grid
  //

  function queueUpdateGrid(newGrid: BoxData[][], immediate: boolean) {
    if (delayUpdateGridTimerRef.current) {
      clearTimeout(delayUpdateGridTimerRef.current);
      delayUpdateGridTimerRef.current = 0;
    }

    if (immediate) {
      setGrid(newGrid);
      setEvaluateGrid(true);
    } else {
      delayUpdateGridTimerRef.current = setTimeout(
        () => {
          setGrid(newGrid);
          setEvaluateGrid(true);
          delayUpdateGridTimerRef.current = 0;
        },
        SETTINGS.MATCH_DELAY
      );
    }
  }

  useEffect(() => {
    if (evaluateGrid) {
      setEvaluateGrid(false);
      performEvaluateGrid();
    }
  }, [evaluateGrid])

  function performEvaluateGrid() {
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
            if (isJewelRare(box.jewel.type)) {
              matchedRare = true;
            }
          }
        });

        setMatchChain([...matchChain, matchScore]);
        updateScore(matchScore);

        if (matchedRare) {
          sfxMatchRareRef.current?.play();
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
          chimes[index]?.play();
        }
      }
    }

    if (updateGrid) {
      queueUpdateGrid([...grid], false);
    }
    else {
      // check if any column is above capacity
      if (grid.some(colJewels => colJewels.length > SETTINGS.ROWS)) {
        queueRemoveLife();
      } 
      else {
        let speed = levelData.speed;
        if (matchChain.length > 0) {
          speed = speed / 2;
        }

        queueLoadPiece(speed);
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
      case "ArrowRight":
        // can move active piece or next piece (if no active piece) left/right before it is loaded
        const setMovePiece = piece.length > 0 ? setPiece
          : nextPiece.length > 0 ? setNextPiece : null;
        if (setMovePiece) {
          setMovePiece!((prev) => {
            if (prev.length > 0
              && prev[0].col < SETTINGS.COLS - 1
              && prev[0].row >= grid[prev[0].col + 1].length)
            {
              return prev.map((box) => ({ ...deepCopyBox(box), col: box.col + 1 }));
            }
            return prev;
          });
        }
        break;

      case "ArrowLeft": {
        // we allow the next piece to be moved left/right before it is loaded
        const setMovePiece = piece.length > 0 ? setPiece
          : nextPiece.length > 0 ? setNextPiece : null;
        if (setMovePiece) {
          setMovePiece!((prev) => {
            if (prev.length > 0
              && prev[0].col > 0
              && prev[0].row >= grid[prev[0].col - 1].length)
            {
              return prev.map((box) => ({ ...deepCopyBox(box), col: box.col - 1 }));
            }
            return prev;
          });
        }
        break;
      }

      case "ArrowUp": {
        // only can rotate the active piece
        setPiece((prev) => {
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
      
      case "ArrowDown": {
        queueMovePieceDown(1, true, false);
        break;
      }

      case " ": {
        // only can drop the active piece
        if (piece.length > 0) {
          const dropDistance = piece[0].row - grid[piece[0].col].length;
          const dropScore = dropDistance * levelData.level;
          updateScore(dropScore);
          setDropRow({
            distance: dropDistance,
            startRow: piece[0].row,
            col: piece[0].col
          });

          queueMovePieceDown(dropDistance, true, true);
        }
        break;
      }

      default:
        break;
    }
  }


  //
  // render
  //

  function renderLives(): React.ReactNode {
    const lifeDots = [];
    for (let i = 0; i < lives; i++) {
      lifeDots.push(
        <div key={i} className="rounded-full w-4 h-4 bg-white"></div>
      );
    }
    return (
      <div className="p-2">
        <div className="flex flex-row gap-2 justify-center items-center w-[76px] h-7">
          { lifeDots }
        </div>
      </div>
    );
  }

  function renderLevel(): React.ReactNode {
    return (
      <div className="p-2">
        <div className="flex justify-center items-center w-[76px]">
          <div className="text-white text-xl font-semibold pb-1">
            { levelData.level }
          </div>
        </div>
      </div>
    );
  }

  function renderScore(): React.ReactNode {
    return (
      <div className="p-2">
        <div className="flex justify-center items-center w-[76px]">
          <div className="text-white text-xl font-semibold pb-1">
            { score }
          </div>
        </div>
      </div>
    );
  }

  function renderMatchChainScore() {
    const textClassNames = [
      "text-[16px]", "text-[20px]", "text-[26px]", "text-[34px]", "text-[44px]",
      "text-[56px]", "text-[70px]", "text-[86px]", "text-[104px]", "text-[124px]",
    ]

    return (
      <div className="flex flex-col items-center">
        <div className="w-[100px] p-2 flex flex-col items-center">
          {
            matchChain.map((score, i) => {
              return (
                <div key={i}
                  className={`absolute ${textClassNames[i]} font-extrabold text-white match-chain-score-animation`}
                >
                  { score }
                </div>
              )
            })
          }
        </div>
      </div>
    );
  }

  function renderBoard(): React.ReactNode {
    return (
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
            { renderDropScore() }
            { renderMatchChainMultiplier() }
            { renderImage() }
          </div>
        </div>
      </div>
    );
  };

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

  function renderDropScore(): React.ReactNode[] {
    if (dropRow.distance === 0) {
      return [];
    }
    const dropScores = [];
    for (let i = 0; i < dropRow.distance; i++) {
      dropScores.push((
        <div key={i} className="absolute w-full h-full">
          <div className="absolute border-shadow flex justify-center items-center
            drop-score-animation text-gray-900 text-[16px] font-bold" 
            style={{
              top: `${(SETTINGS.ROWS - SETTINGS.PIECE_SIZE - dropRow.startRow + i) * SETTINGS.UNIT}px`,
              left: `${dropRow.col * SETTINGS.UNIT}px`,
              width: `${SETTINGS.UNIT}px`,
              height: `${SETTINGS.UNIT}px`,
            }}
          >
            +{levelData.level}
          </div>
        </div>
      ));
    }

    return dropScores;
  }

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

  function renderNextPiece(): React.ReactNode {
    return (
      <div className="p-4">
        <div className="relative flex flex-col-reverse"
          style={{
            width: SETTINGS.UNIT,
            height: SETTINGS.UNIT * SETTINGS.PIECE_SIZE
          }}
        >
          {
            nextPiece.map((box, i) => {
              return <Jewel key={i} jewel={box.jewel} />
            })
          }
        </div>
      </div>
    );
  }

  function renderGameButtons() {
    return (
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
          {[EGameState.STARTED, EGameState.PAUSED].includes(gameState) ? "RESTART" : "START"}
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
    );
  }

  return (
    <div className="flex flex-col justify-center w-full">
      <div className="flex justify-between w-full">
        <div className="basis-[480px] shrink px-8">
          <GameInformation hide={gameState !== EGameState.NONE && gameState !== EGameState.ENDED} />
        </div>
        <div className="flex flex-row grow basis-[960px] justify-center gap-8 w-full h-fit">
          <div className="flex flex-col w-full items-end gap-8 mt-8">
            <Display title="LIVES" content={ renderLives() } />

            <Display title="LEVEL" content={ renderLevel() } />

            <Display title="SCORE" content={ renderScore() } />

            { renderMatchChainScore() }
          </div>
          
          <div>
            { renderBoard() }
          </div>

          <div className="flex flex-col w-full items-start mt-8 gap-8">
            <Display title="NEXT" content={ renderNextPiece() } />

            <JewelDisplay levelData={levelData} />
          </div>
        </div>
        <div className="basis-[480px] shrink px-8">
        </div>
      </div>
      <div className="flex justify-center">
        { renderGameButtons() }
      </div>
    </div>
  );
}

export default Board;
