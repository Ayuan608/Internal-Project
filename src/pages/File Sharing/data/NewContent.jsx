import clsx from "clsx";
import { Plus, Search, ArrowLeft } from "lucide-react";
import React, { useState } from "react";

function NewContent() {
  const [fileData, setFileData] = useState(null);

  const createFile = async (type) => {
    let endpoint = "";
    if (type === "Docs") endpoint = "/api/docs";
    if (type === "Sheets") endpoint = "/api/sheets";
    if (type === "Slides") endpoint = "/api/slides";
    if (type === "PDF") endpoint = "/api/pdf";

    const res = await fetch(`http://localhost:5000${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: `My First ${type}` }),
    });

    const data = await res.json();
    if (data.success) {
      setFileData({
        type,
        id: data.docId || data.sheetId || data.slideId || data.pdfId,
        title: data.title,
        link: data.link,
      });
    }
  };

  const files = [
    { title: "Docs", bgColor: "bg-[#3B82F6]", borderColor: "border-[#3B82F6]" },
    { title: "Slides", bgColor: "bg-[#FF8F6B]", borderColor: "border-[#FF8F6B]" },
    { title: "Sheets", bgColor: "bg-[#21A366]", borderColor: "border-[#21A366]" },
    { title: "PDF", bgColor: "bg-[#E5252A]", borderColor: "border-[#E5252A]" },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {!fileData ? (
        <>
          <div className="relative mb-6 w-full max-w-4xl ">
            <input
              type="text"
              placeholder="Search for templates"
              className="bg-[#f5f6fa0b] text-white placeholder-white rounded-full pl-10 pr-4 py-3.5 w-full text-[16px] focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-white" />
          </div>

          <h1 className="text-xl text-white mb-4 font-extra">Create new File</h1>
          <div className="flex space-x-6 ">
            {files.map((file, index) => {
              const isSlide = file.title === "Slides";
              const isSheet = file.title === "Sheets";

              return (
                <div
                  onClick={() => createFile(file.title)}
                  key={index}
                  className={clsx(
                    " rounded-xl p-3  flex flex-col items-center relative cursor-pointer",
                    isSlide
                      ? "w-[250px] h-[230px] mt-14"
                      : isSheet
                        ? "w-[250px] h-[230px] mt-14"
                        : "w-[200px] h-[285px]"
                  )}
                >
                  <div
                    className={clsx(
                      "relative group w-full border-2 border-dashed rounded-lg hover:bg-[#3a3d47] overflow-hidden transition-all",
                      isSlide
                        ? "h-[180px]"
                        : isSheet
                          ? "h-[180px]"
                          : "h-[250px]",
                      file.borderColor
                    )}
                  >
                    <div className={clsx("absolute inset-2 rounded-lg", file.bgColor)} />

                    {/* PDF horizontal divider */}
                    {!isSheet && file.title === "PDF" && (
                      <div className="absolute left-2 right-2 top-2/3 h-[4px] bg-black/60" />
                    )}
                    {/* <div
                      className={clsx(
                        "absolute top-2 left-2 right-2 bottom-2 rounded-md",
                        file.bgColor
                      )}
                    /> */}
                    {isSheet && (
                      <>
                        {/* Vertical lines */}
                        <div className="absolute top-0 bottom-0 left-1/3 w-[4px] bg-black/60" />
                        <div className="absolute top-0 bottom-0 left-2/3 w-[3px] bg-black/60" />

                        {/* Horizontal lines */}
                        <div className="absolute left-0 right-0 top-1/2 h-[3px] bg-black/60" />
                      </>
                    )}
                    <div className="absolute inset-0  bg-black/40 group-hover:bg-[#07091037] transition-all duration-300 rounded-lg z-10" />
                    <div className="absolute inset-0 flex items-center justify-center  opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 ">
                      <Plus className="text-white w-10 h-10" />
                    </div>
                  </div>
                  <div className="mt-3 text-white/50 text-[18px]">{file.title}</div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="w-full h-full">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setFileData(null)}
              className="flex items-center gap-1 text-white px-3 py-1 rounded bg-[#2d2f38] hover:bg-[#3a3d47] transition"
            >
              <ArrowLeft size={18} /> Back
            </button>
            <h2 className="text-white font-semibold">
              {fileData.title || `My ${fileData.type}`}
            </h2>
          </div>

          <iframe
            src={fileData.link}
            title={fileData.type}
            width="100%"
            height="700px"
            style={{ borderRadius: "8px" }}
          />
        </div>
      )}
    </div>
  );
}

export default NewContent;