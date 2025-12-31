import React, { useRef } from "react";
import {
  SpreadsheetComponent,
  SheetsDirective,
  SheetDirective,
  RangesDirective,
  RangeDirective,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Edit,
  Selection,
  Clipboard,
  Open
} from "@syncfusion/ej2-react-spreadsheet";

function ExcelFile() {
  const spreadsheetRef = useRef(null);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-white/10">
      <SpreadsheetComponent
        ref={spreadsheetRef}
        height="100%"
        width="100%"
        allowEditing={true}
        allowOpen={true}
        allowSave={true}
        showRibbon={true}       // ✅ toolbar yahi se aata hai
        showFormulaBar={true}
      >
        <Inject
          services={[
            Edit,
            Selection,
            Clipboard,
            Open
          ]}
        />

        <SheetsDirective>
          <SheetDirective name="Sheet1">
            <RangesDirective>
              <RangeDirective dataSource={[]} />
            </RangesDirective>

            <ColumnsDirective>
              <ColumnDirective width={120} />
              <ColumnDirective width={120} />
              <ColumnDirective width={120} />
            </ColumnsDirective>
          </SheetDirective>
        </SheetsDirective>
      </SpreadsheetComponent>
    </div>
  );
}

export default ExcelFile;
