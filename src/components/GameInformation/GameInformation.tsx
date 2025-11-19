import "./GameInformation.css";

function GameInformation({
  hide,
}:{
  hide: boolean
}
) {
  if (hide) {
    return null;
  }

  return (
    <div className="flex flex-col justify-between gap-8 h-full">
      <div className="flex flex-col gap-2">
        <div className="text-gray-800 text-lg font-semibold">
          INTRODUCTION
        </div>
        <div className="text-xs">
          Enjoy this classic puzzle game where you arrange falling jewels to create matches and score points.
          Advance through the levels and aim for the highest score possible!
        </div>
        <div className="text-xs">
          Based on the original <a className="text-slate-700 hover:text-slate-800 underline" href="https://en.wikipedia.org/wiki/Jewelbox_(video_game)">JewelBox</a> video game.
        </div>
      </div>

      <div className="flex flex-col gap-2">
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
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-gray-800 text-lg font-semibold">
          SCORING
        </div>
        <div className="text-xs">
          Earn points by matching 3 or more jewels of the same type, either vertically, horizontally, or diagonally.
        </div>
        <div className="text-xs">
          Earn extra points by chaining successive matches together! 
          You earn 2X the points for your 2nd chain of matches, 3X points for your 3rd chain, and so on.
        </div>
        <div className="text-xs">
          Earn bonus points by dropping pieces (using <span className="font-bold">&lt;spacebar&gt;</span>). 
          You earn "N" points for each row a piece is dropped, where "N" is equal to the current level.
        </div>
        <div className="text-xs">
          Rare jewels earn you valuable points, and become more common as you advance through the levels.
        </div>
        <div className="text-xs">
          Keep an eye out for the special <span className="gradient-text">JEWELBOX</span> piece that will help you clear some jewels. 
          You earn one after every level advanced, but they also appear randomly throughout the game!
        </div>
      </div>
    </div>
  );
}

export default GameInformation;