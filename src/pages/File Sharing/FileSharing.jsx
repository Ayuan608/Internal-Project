import React, { useState } from 'react'
import FileSidebar from './FileSidebar'
import Filehome from './data/Filehome'
import NewContent from './data/NewContent'
import DocsFile from './data/DocsFile';
import PPTFile from './data/PPTFile';
import ExcelFIle from './data/ExcelFIle';
import PdfFile from './data/PdfFile';
function FileSharing() {


  const [selected, setSelected] = useState("Home");

  const renderContent = () => {
    switch (selected) {
      case "Home": return <Filehome />;
      case "New": return <NewContent />;
      case "Docs": return <DocsFile />;
      case "Slides": return <PPTFile />;
      case "Sheets": return <ExcelFIle />;
      case "PDF": return <PdfFile />;
      default: return <Filehome />;
    }
  };

  return (
    <>
      <div className="flex overflow-hidden ">
        <FileSidebar selected={selected} setSelected={setSelected} />
        <div className="flex flex-1">
          {renderContent()}
        </div>
      </div >
    </>
  )
}

export default FileSharing