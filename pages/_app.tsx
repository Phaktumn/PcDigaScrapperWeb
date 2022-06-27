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
import { Product } from '../models/Product';
import { Seller } from '../models/Seller';
import Image from 'next/image'


import { hpe } from 'grommet-theme-hpe';
import { Search } from 'grommet-icons'
import { Box, Button, TextInput, Grommet, Tag } from 'grommet';
import React from 'react';

function MyApp() {
  const [Products, SetProducts] = useState<any[]>([]);
  const [SelectedRow, SetSelectedRow] = useState<Product>();
  const [urlInput, setUrlInput] = React.useState('');
  const a: any[] = [];

  const baseUrl = process.env.BASE_URL ?? 'http://localhost:5000';

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

  async function getProducts(): Promise<void> {
    var result = await axios.get<Product[]>(`${baseUrl}/product/filter`);
    SetProducts(result.data);
  }

  useEffect(() => {
    getProducts().catch(console.error);
  }, a);

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  let options: AgChartOptions = {
    autoSize: true,
    //data: SelectedRow?.sellers,
    theme: 'ag-material-dark',
    legend: {
      enabled: true,
      position: "top"
    },
    series: [ 
      {
        data: SelectedRow?.sellers[0].productPrices,
        xKey: 'date',
        yKey: 'currentPrice',
        xName: SelectedRow?.sellers[0].name,
        yName: SelectedRow?.sellers[0].name,
        label: {
          enabled: true,
          color: 'white',
          fontWeight: 'bold'
        }
      },
      {
        data: SelectedRow?.sellers[1].productPrices,
        xKey: 'date',
        yKey: 'currentPrice',
        xName: SelectedRow?.sellers[1].name,
        yName: SelectedRow?.sellers[1].name,
        label: {
          enabled: true,
          color: 'white',
          fontWeight: 'bold',

        }
      }
    ],
  }

  /*
  {
    data:  SelectedRow?.sellers[0].productPrices,
    type: 'line',
    xKey: 'date',
    yKey: 'currentPrice',
    label: {
      enabled: true,
      color: 'white',
      fontWeight: 'bold'
    }
  }*/

  // Each Column Definition results in one Column.
  const [columnDefs, setColumnDefs] = useState<(ColDef | ColGroupDef)[]>([
    { 
      field: 'image',
      autoHeight: true, 
      resizable: true, 
      cellRenderer: (prop: ICellRendererParams) => 
        <div style={{ }}>
          <Image src={prop.value ? prop.value : 'https://socialistmodernism.com/wp-content/uploads/2017/07/placeholder-image.png'} layout='fill' objectFit='contain' alt="prod_img" /> 
        </div>
    },
    { field: 'sku', filter: true, resizable: true },
    { field: 'name', minWidth: 650, filter: true, resizable: true },
    {
      field: 'url',
      resizable: true,
      width: 300,
      cellRenderer: (prop: ICellRendererParams) =>
        <Box
          direction="column"
          justify="center"
          align="center"
          pad="none"
          margin={"none"}
          gap="xsmall"
        >
          <Box direction="row-responsive" fill="vertical" flex={true} pad="xsmall" gap='xsmall' wrap={true} responsive={true}>
          {
            (prop.data.sellers as Seller[]).map((seller: Seller, index: number) => {
              return <Tag key={index} size='xsmall' value={seller.name} onClick={ () => { openInNewTab(seller.url); } } />
            })
          }
          </Box>
            <button
            style={{ marginLeft: "5px", marginRight: "5px", width: "80px" }}
            onClick={async () => {
              gridRef?.current?.api.showLoadingOverlay();
              let res = await axios.get<Product>(`${baseUrl}/scrape?sku=${prop.data.sku}`);
              await getProducts();
              gridRef?.current?.api.hideOverlay();
            }}>
            Scrape
          </button>
          {
            !prop.data.image ?
              <button onClick={async () => {
                gridRef?.current?.api.showLoadingOverlay();
                await axios.get<Product>(`${baseUrl}/product/update?prop=image&url=${prop.value}`);
                await getProducts();
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
    SelectedRow?.sellers.forEach(element => {
      var prices = element.productPrices;
      options.series?.push({
        data:  prices,
        xKey: 'date',
        yKey: 'currentPrice',
        label: {
          enabled: true,
          color: 'white',
          fontWeight: 'bold'
        }
      });
    });
  }, []);

  const onChange = (event: any) => setUrlInput(event.target.value);
  const onInpuitKeyDown = async (event: any) => {
    if (event.key === 'Enter') {
      gridRef?.current?.api.showLoadingOverlay();
      await axios.get<Product>(`${baseUrl}/product/create?url=${urlInput}`);
      await getProducts();
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
          SelectedRow !== undefined ? <div style={{ width: "65%", marginTop: 10 }}> <AgChartsReact options={options} /> </div> : <p>Select a row</p>
        }
      </Box>
    </Grommet>
  );
}

export default MyApp;
