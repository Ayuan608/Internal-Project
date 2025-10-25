import NonQuotaMembersTable from "./ui/NonQuotaMembersTable";

const NonQuota = () => {
  return (
    <div className="h-full  rounded-2xl p-4  border border-gray-700">
      <div className="flex justify-between items-start">
        <div className="px-3">
          <div className="text-white mb-2">Non-Quota Dashboard</div>
          <div className="text-white/70 mb-2">
            Track members who haven't met their quota targets
          </div>
        </div>
        
      </div>
      <NonQuotaMembersTable />
    </div>
  );
};

export default NonQuota;
