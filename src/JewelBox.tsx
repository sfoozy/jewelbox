import Board from './components/Board/Board';
import GameInformation from './components/GameInformation/GameInformation';
import './JewelBox.css';

function JewelBox() {
  return (
    <div className="flex flex-col justify-start h-dvh">
      <div className="bg-gray-600 flex justify-end items-center pr-4 pb-0.5 text-sm">
        JewelBox v0.3.3
      </div>
      <div className="flex flex-col items-center justify-center bg-gray-500 h-full">
        <div className="text-3xl font-bold my-4 mt-0 text-gray-700">JewelBox</div>
        <div className="flex justify-between relative w-full">
          <div className="mr-auto w-[450px] px-4">
            <GameInformation />
          </div>
          <div>
            <Board />
          </div>
          <div className="ml-auto px-4 w-[450px]">
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default JewelBox;
