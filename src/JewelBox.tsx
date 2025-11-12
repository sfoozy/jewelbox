import Board from './components/board/Board';
import './JewelBox.css';

function JewelBox() {
  return (
    <div className="flex flex-col h-dvh">
      <div className="bg-gray-600 flex justify-end pr-4 text-sm">
        JewelBox v0.1.0
      </div>
      <div className="flex flex-col items-center justify-center bg-gray-500 h-full overflow-scroll">
        <span className='text-3xl font-bold my-4 text-gray-700'>JewelBox</span>
        <Board />
      </div>
    </div>
  );
}

export default JewelBox;
