import '../styles/globals.css'
import '../styles/App.css'

import { useState, useEffect, useRef, useCallback } from 'react';
import axios, { AxiosResponse } from 'axios';

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
import { Box, Button, TextInput, Grommet, Tag, Notification } from 'grommet';
import React from 'react';

import { cloneDeep } from 'lodash';

function MyApp() {
  const [Products, SetProducts] = useState<any[]>([]);
  const [SelectedRow, SetSelectedRow] = useState<Product>();
  const [urlInput, setUrlInput] = React.useState('');
  const [visible, setVisible] = useState(false);
  const [AGGOptions, setAGGOptions] = useState<AgChartOptions>({
    autoSize: true,
    theme: 'ag-material-dark',
    legend: {
      enabled: true,
      position: "top"
    },
    /*series: [ 
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
      }
    ]*/
  });
  const placeholderImage = 'https://socialistmodernism.com/wp-content/uploads/2017/07/placeholder-image.png';
  const a: any[] = [];
  const [toastMessage, setToastMessage] = useState('');
  const [toastTitle, setToastTitle]= useState('');

  function getApiUrl() {
    console.log(process.env.BASE_URL);
    return process.env.BASE_URL ?? 'http://localhost:5000';
  }

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

  const onOpen = () => setVisible(true);
  const onClose = () => setVisible(false);

  async function getProducts(): Promise<void> {
    var result = await axios.get<Product[]>(`${getApiUrl()}/product/filter`);
    SetProducts(result.data);
  }

  useEffect(() => {
    axios.get<Product[]>(`${getApiUrl()}/product/filter`)
      .then((v: AxiosResponse<Product[]>) => { SetProducts(v.data); })
      .catch(console.error);
  }, []);

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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
          {
            (prop.value as String).includes('globaldata')
              ? <Image loader={(value) => `${value.src}?w=${value.width}&q=${value.quality}`} placeholder='blur' blurDataURL={placeholderImage} src={prop.value} layout='fill' objectFit='contain' alt="prod_img" />
              : <Image src={prop.value} placeholder='blur' blurDataURL={placeholderImage} layout='fill' objectFit='contain' alt="prod_img" />
          }
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
              try {
                await axios.get<Product | any>(`${getApiUrl()}/scrape?sku=${prop.data.sku}`); 
                await getProducts();
              } catch (error: any) {
                setToastMessage('Error product/update');
                setToastMessage(error.response.data.message);
                setVisible(true);
              }
              gridRef?.current?.api.hideOverlay();
            }}>
            Scrape
          </button>
          {
            !prop.data.image ?
              <button onClick={async () => {
                gridRef?.current?.api.showLoadingOverlay();
                await axios.get<Product>(`${getApiUrl()}/product/update?prop=image&url=${prop.value}`);
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
    const selectedRows: Product[] = gridRef.current!.api.getSelectedRows();
    SetSelectedRow(selectedRows[0]);
    const options = cloneDeep(AGGOptions) as AgChartOptions;
    options.series = [];
    selectedRows[0].sellers.forEach(element => {
      var prices = element.productPrices;
      console.log(prices);
      options.series?.push({
        data:  prices,
        xKey: 'date',
        yKey: 'currentPrice',
        xName: element.name,
        yName: element.name,
        label: {
          enabled: true,
          color: 'white',
          fontWeight: 'bold'
        }
        
      },
      {
        data:  prices,
        xKey: 'date',
        yKey: 'originalPrice',
        xName: 'Preco original ' + element.name,
        yName: 'Preco original ' + element.name,
        label: {
          enabled: true,
          color: 'white'
        }
      });
    });
    setAGGOptions(options);
    console.log(options);
    console.log(AGGOptions);
  }, [AGGOptions]);

  const onChange = (event: any) => setUrlInput(event.target.value);
  const onInpuitKeyDown = async (event: any) => {
    if (event.key === 'Enter') {
      gridRef?.current?.api.showLoadingOverlay();
      const res = await axios.get<Product | any>(`${getApiUrl()}/product/create?url=${urlInput}`);
      if (res.status >= 400) {
        setToastTitle('Error product/create');
        setToastMessage(res.data.message);
        setVisible(true);
      }
      else {
        await getProducts();
      }
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
          SelectedRow !== undefined ? <div style={{ width: "65%", marginTop: 10 }}> <AgChartsReact options={AGGOptions} /> </div> : <p>Select a row</p>
        }
      </Box>
      {
        visible && (
          <Notification
            toast
            title={toastTitle}
            message={toastMessage}
            onClose={onClose}
             
          />
      )}
    </Grommet>
  );
}

export default MyApp;
