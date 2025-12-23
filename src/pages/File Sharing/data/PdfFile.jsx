import React from "react";
import {
  PdfViewerComponent,
  Toolbar,
  Magnification,
  Navigation,
  LinkAnnotation,
  BookmarkView,
  ThumbnailView,
  Print,
  TextSelection,
  TextSearch,
  Annotation,
  FormFields,
  FormDesigner,
  Inject
} from "@syncfusion/ej2-react-pdfviewer";

function PdfViewer({ fileData }) {
  if (!fileData?.link) {
    return (
      <div className="w-full h-[950px] bg-white rounded-lg flex items-center justify-center text-gray-500">
        Loading PDF...
      </div>
    );
  }

  return (
    <div className="w-full h-[950px] rounded-lg overflow-hidden border border-white/10 bg-white">
      {/* HEADER */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {fileData?.title || "PDF File"}
        </h3>
      </div>

      {/* PDF VIEWER */}
      <PdfViewerComponent
        id="pdfviewer"
        documentPath={fileData.link}   // 👈 PDF URL
        resourceUrl="https://cdn.syncfusion.com/ej2/25.1.35/dist/ej2-pdfviewer-lib"
        height="100%"
        enableToolbar={true}
        enablePrint={true}
        enableDownload={true}
      >
        <Inject
          services={[
            Toolbar,
            Magnification,
            Navigation,
            LinkAnnotation,
            BookmarkView,
            ThumbnailView,
            Print,
            TextSelection,
            TextSearch,
            Annotation,
            FormFields,
            FormDesigner
          ]}
        />
      </PdfViewerComponent>
    </div>
  );
}

export default PdfViewer;
