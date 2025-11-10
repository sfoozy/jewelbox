import Board from './components/board/Board';
import './JewelBox.css';

function JewelBox() {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-500 min-h-[1000px] h-dvh overflow-scroll">
      <span className='text-2xl font-bold my-4 text-gray-800'>JewelBox</span>
      <Board />
    </div>
  );
}

export default JewelBox;
