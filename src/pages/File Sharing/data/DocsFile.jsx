import { File, Plus, RefreshCcw, Search, Settings } from "lucide-react";
import React, { useState, useRef } from "react";
import Files from "../Files";
import { DocumentEditorContainerComponent, Toolbar, Inject } from '@syncfusion/ej2-react-documenteditor';

function DocsFile() {
    const [isRotating, setIsRotating] = useState(false);
    const [openEditor, setOpenEditor] = useState(false);
    const editorRef = useRef(null);

    const handleRefresh = () => {
        setIsRotating(true);
        setTimeout(() => setIsRotating(false), 500);
    };

    // 👇 If Blank clicked → show editor instead of full page
    if (openEditor) {
        return (
            <div className="w-full h-[100%] rounded-lg overflow-hidden border border-white/10">
                <DocumentEditorContainerComponent
                    ref={editorRef}
                    id="documenteditor-container"
                    height="100%"
                    width="100%"
                    serviceUrl="https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/"
                    enableToolbar={true}
                    enableSelection={true}
                    enableEditor={true}
                    enableEditorHistory={true}
                    enableSfdtExport={true}
                    usecolor={"#1e293b3a"}
                    title="Internal-Project"
                >
                    <Inject services={[Toolbar]} />
                </DocumentEditorContainerComponent>
            </div>
        );
    }

    return (
        <div className="w-full h-screen overflow-hidden flex flex-col">

            {/* TOP SECTION */}
            <div className="px-8 py-6">

                {/* Search Bar */}
                <div className="relative mb-8 mt-2 w-full max-w-3xl">
                    <input
                        type="text"
                        placeholder="Search for templates"
                        className="bg-white/10 text-white placeholder-white/40 rounded-full pl-12 pr-4 py-3 w-full text-lg focus:outline-none"
                    />
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-white/50" />
                </div>

                <h1 className="text-xl text-white mb-4 font-light">Create new Docs file</h1>

                {/* ⭐ BLANK TEMPLATE BOX (Click → Open Editor) */}
                <div className="w-[160px] h-[235px] flex flex-col items-center p-3">
                    <div
                        className="group relative h-full w-full border-2 border-dashed border-[#325ab1] rounded-lg overflow-hidden cursor-pointer transition-all"
                        onClick={() => setOpenEditor(true)}   // 👈 🔥 MAIN CLICK LOGIC
                    >

                        <div className="flex items-center justify-center w-full h-full">
                            <div className="w-[95%] h-[95%] bg-[#325ab1] rounded-md"></div>
                        </div>

                        <div className="absolute inset-0 bg-black/40 group-hover:bg-[#07091037] transition-all duration-300 rounded-lg z-10" />

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                            <Plus className="text-white w-10 h-10" />
                        </div>
                    </div>
                    <div className="mt-3 text-white/70 text-sm">Blank</div>
                </div>

            </div>

            {/* REST OF YOUR PAGE */}
            <div className="flex flex-1 overflow-hidden border-t border-white/10">

                {/* LEFT SIDE */}
                <div className="flex-1 px-6 py-6 overflow-y-auto">
                    <div className="bg-white/10 px-3 py-2 rounded-full flex items-center gap-2 w-fit cursor-pointer hover:bg-white/20 transition">
                        <Plus size={20} />
                        <span className="text-white text-base">Open Document</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-light mt-6 text-white flex items-center gap-3">
                            Recent
                            <RefreshCcw
                                size={20}
                                className={`cursor-pointer transition-transform duration-500 ${isRotating ? "animate-spin" : ""}`}
                                onClick={handleRefresh}
                            />
                        </h2>
                        <Settings className="w-6 h-6 text-white cursor-pointer" />
                    </div>

                    <Files />
                </div>

                {/* RIGHT SIDE */}
                <div className="w-[420px] border-l border-white/10 p-6 flex flex-col">
                    <h2 className="text-white text-lg font-light mb-10">File Information</h2>

                    <div className="flex flex-1 flex-col items-center justify-center text-white/60">
                        <File size={120} strokeWidth={1} className="text-white/30" />
                        <p className="mt-6 text-[12px] font-extralight">Select a file to view details</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DocsFile;
