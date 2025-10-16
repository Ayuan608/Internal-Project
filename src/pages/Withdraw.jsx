import { DataGrid } from "@mui/x-data-grid";
import React from "react";
import { Line, Pie } from "react-chartjs-2";
import {
  columns,
  lineData,
  lineOptions,
  rows,
  userData,
} from "../Helpers/Helper";

const Withdraw = () => {
  return (
    <>
      <h1 className="mb-3 text-2xl">Withdraw Data</h1>
      <div className="flex space-x-4 items-start">
        {/* Pie Chart */}
        <div className="w-80 h-80 border bg-[#f5f6fa09] border-gray-700 rounded-xl p-3">
          <Pie data={userData} />
        </div>

        {/* Line Chart */}
        <div className="w-80 h-80 border bg-[#f5f6fa09] border-gray-700 rounded-xl p-3 flex flex-col">
          <h3 className="text-sm mb-2">DATA COMPARISON</h3>
          <div className="flex-1">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        {/* DataGrid */}
        <div className="h-80 border bg-[#f5f6fa09] border-gray-700 rounded-xl">
          <DataGrid
            rows={rows}
            columns={columns}
            autoHeight
            pageSize={5}
            disableSelectionOnClick
            className="cursor-pointer rounded-xl"
          />
        </div>
      </div>
    </>
  );
};

export default Withdraw;
