function Display({
  title,
  content
}: {
  title: string;
  content: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-lg font-semibold text-amber-400">
        { title }
      </div>
      <div className="border-2 border-amber-400">
        <div className="border-2 border-black">
          <div className="flex bg-gray-700 text-white border-2 border-gray-700 box-content">
            { content }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Display;
