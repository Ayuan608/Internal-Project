import React from 'react';

function PdfViewer({ fileData }) {

    if (!fileData) {
        return (
            <div className="w-full h-[950px] bg-white rounded-lg flex items-center justify-center text-gray-500">
                Loading PDF...
            </div>
        );
    }

    return (
        <div className="w-full h-[950px] bg-white rounded-lg overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">{fileData?.title || "PDF File"}</h3>

                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded">
                        Download
                    </button>
                    <button className="px-4 py-2 bg-gray-500 text-white rounded">
                        Print
                    </button>
                </div>
            </div>

            <iframe
                src={fileData?.link || ""}
                title={fileData?.type || "pdf"}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
            />
        </div>
    );
}

export default PdfViewer;
