import '../styles/globals.css'
import '../styles/App.css'

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component

import 'ag-grid-community/dist/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'; // Optional theme CSS
import 'ag-grid-community/dist/styles/ag-theme-balham-dark.css'; // Optional theme CSS
import 'ag-grid-community/dist/styles/ag-theme-alpine-dark.css'; // Optional theme CSS
import 'ag-grid-community/dist/styles/ag-theme-material.css'; // Optional theme CSS
import { AgChartOptions, Autowired, ColDef, ColGroupDef, ICellRendererParams, RowSelectedEvent } from 'ag-grid-community';

import { AgChartsReact } from 'ag-charts-react';
import { Product } from './Product';

import { hpe } from 'grommet-theme-hpe';
import { Search } from 'grommet-icons'
import { Box, Button, TextInput, Grommet } from 'grommet';
import React from 'react';

function MyApp() {
  const [Products, SetProducts] = useState<any[]>([]);
  const [SelectedRow, SetSelectedRow] = useState<Product>();
  const [urlInput, setUrlInput] = React.useState('');
  const a: any[] = [];

  const gridRef = useRef<AgGridReact>(null);

  const theme = {
    global: {
      font: {
        family: 'Roboto',
        size: '18px',
        height: '20px',
      },
    },
  };

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
    theme: 'ag-material-dark',
    legend: {
      enabled: true,
      position: "top"
    },
    series: [
      {
        type: 'line',
        xKey: 'date',
        yKey: 'currentPrice',
        label: {
          enabled: true,
          color: 'white',
          fontWeight: 'bold'
        }
      },
      {
        type: 'line',
        xKey: 'date',
        yKey: 'originalPrice',
        label: {
          enabled: true,
          color: 'white',
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

        <Box
          direction="row-responsive"
          justify="center"
          align="center"
          pad="small"
          margin={"medium"}
          gap="medium"
        >
          <Button onClick={() => { openInNewTab(prop.value); }} style={{ marginLeft: "5px", marginRight: "5px", padding: 2, width: "80px" }} >
            <img src='https://static.pcdiga.com/static/version1656000411/frontend/Skrey/PCDigaTheme/pt_PT/images/logo.svg' width={'100%'} />
          </Button>
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
        </Box>
    }
  ]);

  const onSelectionChanged = useCallback(() => {
    const selectedRows = gridRef.current!.api.getSelectedRows();
    SetSelectedRow(selectedRows[0]);
  }, []);

  const onChange = (event: any) => setUrlInput(event.target.value);
  const onInpuitKeyDown = async (event: any) => {
    if (event.key === 'Enter') {
      gridRef?.current?.api.showLoadingOverlay();
      await axios.get<Product>("https://pcdigascrapper.herokuapp.com/scrape?url=" + urlInput);
      await process();
      gridRef?.current?.api.hideOverlay();
    }
  };

  return (
    <Grommet theme={hpe} themeMode={'dark'} style={{ minHeight: "100vh" }}>
      <Box width="100%" align='center' justify='around'>
        <Box width="50%">
          <TextInput style={{ marginTop: 10, marginBottom: 10 }} size="medium" icon={<Search />} placeholder="https://www.pcdiga.com/componentes/processadores/..." value={urlInput} onChange={onChange} onKeyDown={onInpuitKeyDown} />
        </Box>
        <div className="ag-theme-balham-dark" style={{ width: '80%', height: 600, marginLeft: "10%", marginRight: "10%" }}>
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
          SelectedRow !== undefined ? <div> <AgChartsReact options={options} /> </div> : <p>Select a row</p>
        }
      </Box>
    </Grommet>
  );
}

export default MyApp;
