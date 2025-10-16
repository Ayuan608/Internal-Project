const DirectoryPanel = () => {
  return (
    <div className="w-full max-w-xs bg-[#12141a] p-4 rounded-lg text-white space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Directory</h2>
        <button className="text-sm text-blue-400">Sync</button>
      </div>

      <div className="space-y-4">
        {["ABC Corp", "XYZ Ltd", "Company"].map((name, idx) => (
          <div
            key={idx}
            className="p-3 bg-[#1a1d23] rounded-lg border-l-4 border-green-500"
          >
            <div className="text-sm font-bold">{name}</div>
            <div className="text-xs text-gray-400 mt-1">#renewal 30d • EU</div>
            <div className="flex flex-wrap gap-1 mt-2 text-xs">
              <span className="bg-[#2e2e2e] px-2 py-1 rounded">#priority</span>
              <span className="bg-[#2e2e2e] px-2 py-1 rounded">#seasonal</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DirectoryPanel;
