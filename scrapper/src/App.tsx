
import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import axios from 'axios';

import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'; // Optional theme CSS
import { AgChartOptions, ColDef, ColGroupDef, ICellRendererParams, RowSelectedEvent } from 'ag-grid-community';

import { AgChartsReact } from 'ag-charts-react';

class Product {
  ean!: String;
  name!: String;
  url!: String;
  image!: String;
  prices!: [ProductPrice];
  updatedAt!: String;
  createdAt!: String;
}

class ProductPrice {
  currentPrice!: number;
  originalPrice!: number;
  priceDifference!: number;
  isOnDiscount!: Boolean;
  discountPercentage!: number;
  date!: string;
  updatedAt!: String;
  createdAt!: String;
}

function App() {
  const [Products, SetProducts] = useState<any[]>([]);
  const [SelectedRow, SetSelectedRow] = useState<Product>();
  const a: any[] = [];

  const gridRef = useRef<AgGridReact>(null);

  async function process(): Promise<void> {
    var result = await axios.get<Product[]>("https://pcdigascrapper.herokuapp.com/product/filter");
    SetProducts(result.data);
  }

  useEffect(() => {
    process().catch(console.error);
  }, a);

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const options: AgChartOptions = {
    autoSize: true,
    data: SelectedRow?.prices,
    legend: {
      enabled: true
    },
    series: [
      {
        type: 'line',
        xKey: 'date',
        yKey: 'currentPrice',
        label: {
          enabled: true,
          fontWeight: 'bold'
        }
      },
      {
        type: 'line',
        xKey: 'date',
        yKey: 'originalPrice',
        label: {
          enabled: true,
          fontWeight: 'bold'
        }
      }
    ],
  }

  // Each Column Definition results in one Column.
  const [columnDefs, setColumnDefs] = useState<(ColDef | ColGroupDef)[]>([
    { field: 'image', autoHeight: true, resizable: true, cellRenderer: (prop: ICellRendererParams) => <img src={prop.value} height={90} width={150} /> },
    { field: 'ean', filter: true, resizable: true },
    { field: 'name', minWidth: 650, filter: true, resizable: true },
    {
      field: 'url',
      resizable: true,
      width: 300,
      cellRenderer: (prop: ICellRendererParams) =>
        <div>
          <button onClick={() => { openInNewTab(prop.value); }} style={{ marginLeft: "5px", marginRight: "5px", width: "80px" }}>
            <img src='https://static.pcdiga.com/static/version1656000411/frontend/Skrey/PCDigaTheme/pt_PT/images/logo.svg' width={'100%'}>
            </img>
          </button>
          <button
            style={{ marginLeft: "5px", marginRight: "5px", width: "80px" }}
            onClick={async () => {
              gridRef?.current?.api.showLoadingOverlay();
              let res = await axios.get<Product>("https://pcdigascrapper.herokuapp.com/scrape?url=" + prop.value);
              await process();
              gridRef?.current?.api.hideOverlay();
            }}>
            Scrape
          </button>
          {
            !prop.data.image ?
              <button onClick={async () => {
                gridRef?.current?.api.showLoadingOverlay();
                await axios.get<Product>("https://pcdigascrapper.herokuapp.com/product/update?prop=image&url=" + prop.value);
                await process();
                gridRef?.current?.api.hideOverlay();
              }}>
                Update Image
              </button>
              : <div></div>
          }
        </div>
    }
  ]);

  const onSelectionChanged = useCallback(() => {
    const selectedRows = gridRef.current!.api.getSelectedRows();
    SetSelectedRow(selectedRows[0]);
  }, []);

  return (
    <div className="App" style={{ marginLeft: '10%', marginRight: '10%' }}>
      <div className="ag-theme-alpine" style={{ width: '100%', height: 600 }}>
        <AgGridReact
          ref={gridRef}
          rowHeight={100}
          rowData={Products} // Row Data for Rows
          columnDefs={columnDefs} // Column Defs for Columns
          animateRows={true} // Optional - set to 'true' to have rows animate when sorted
          rowSelection='multiple' // Options - allows click selection of rows
          onSelectionChanged={onSelectionChanged}
        />
      </div>
      {
        SelectedRow !== undefined ? <AgChartsReact options={options} /> : <p>Select a row</p>
      }
    </div>
  );
}

export default App;


