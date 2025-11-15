import Board from './components/board/Board';
import './JewelBox.css';

function JewelBox() {
  return (
    <div className="flex flex-col justify-start h-dvh">
      <div className="bg-gray-600 flex justify-end items-center pr-4 pb-0.5 text-sm">
        JewelBox v0.2.3
      </div>
      <div className="flex flex-col items-center justify-center bg-gray-500 h-full overflow-scroll">
        <div className="text-3xl font-bold my-4 mt-0 text-gray-700">JewelBox</div>
        <Board />
      </div>
    </div>
  );
}

export default JewelBox;
