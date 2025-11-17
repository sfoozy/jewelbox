import "./GameInformation.css";

function GameInformation() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="text-gray-800 text-lg font-semibold">
          INTRODUCTION
        </div>
        <div className="text-xs">
          Earn points by matching 3 (or more) jewels of the same type... either vertically, horizontally, or diagonally.
          <br />
          Earn extra points by chaining successive matches together!
        </div>
        <div className="text-xs">
          Rare jewels earn valuable points, and become more common in later levels.
          <br />
          Also keep an out for the special <span className="gradient-text">JEWELBOX</span> piece that is earned after every level advanced, and also appears randomly throughout the game!
        </div>
        <div className="text-xs">
          Based on the original <a className="text-slate-700 hover:text-slate-800 underline" href="https://en.wikipedia.org/wiki/Jewelbox_(video_game)">JewelBox</a> video game.
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="text-gray-800 text-lg font-semibold">
          GAME CONTROLS
        </div>
        <div className="text-xs">
          Use the <span className="font-bold">&lt;left&gt;</span> and <span className="font-bold">&lt;right&gt;</span> arrow keys to move a piece.
        </div>
        <div className="text-xs">
          Use the <span className="font-bold">&lt;up&gt;</span> arrow key to rotate the jewels with-in a piece.
        </div>
        <div className="text-xs">
          Use the <span className="font-bold">&lt;spacebar&gt;</span> key to drop a piece into place.
          <br />
          Earn bonus points (value based on the level) for each row a piece is dropped.
        </div>
      </div>
    </div>
  );
}

export default GameInformation;