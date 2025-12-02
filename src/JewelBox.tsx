import Board from './components/Board/Board';
import './JewelBox.css';

function JewelBox() {
  return (
    <div className="flex flex-col justify-start min-h-dvh bg-gray-500">
      <div className="bg-gray-600 flex justify-end items-center pr-4 pb-0.5 text-sm">
        JewelBox v0.3.10
      </div>
      <div className="flex flex-col grow items-center justify-center">
        <div className="text-3xl font-bold my-4 mt-0 text-gray-700">
          JewelBox
        </div>
        <Board />
      </div>
    </div>
  );
}

export default JewelBox;
