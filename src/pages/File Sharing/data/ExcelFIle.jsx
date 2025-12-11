import React, { useState, useEffect } from "react";
import Spreadsheet from "react-spreadsheet";

function SpreadsheetEditor({ fileData }) {

    const getInitialGrid = () => {
        const rowCount = Math.floor(window.innerHeight / 35);
        const colCount = Math.floor(window.innerWidth / 120);

        return Array.from({ length: rowCount }, () =>
            Array.from({ length: colCount }, () => ({ value: "" }))
        );
    };

    const [data, setData] = useState(getInitialGrid());

    useEffect(() => {
        const handleResize = () => {
            setData(getInitialGrid());
        };
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="w-full h-full  flex flex-col rounded-lg overflow-hidden">



            <div className="flex-1 overflow-auto bg-[rgba(59,130,246,0.03)] p-2">
                <div className="dark-spreadsheet w-full h-full">
                    <Spreadsheet data={data} onChange={setData} />
                </div>
            </div>
        </div>
    );
}

export default SpreadsheetEditor;
