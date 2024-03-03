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
import { ColDef, ColGroupDef, ICellRendererParams } from 'ag-grid-community';

import { AgChartsReact } from 'ag-charts-react';
import { Product } from '../models/Product';
import { Seller } from '../models/Seller';
import Image from 'next/image'


import { hpe } from 'grommet-theme-hpe';
import { Search, Trash } from 'grommet-icons'
import { Box, Button, TextInput, Grommet, Tag, Notification } from 'grommet';
import React from 'react';

import { cloneDeep } from 'lodash';
import { AgChartOptions } from 'ag-charts-community';

const API_URL = 'http://localhost:5000';
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
    }
  });
  const placeholderImage = 'https://socialistmodernism.com/wp-content/uploads/2017/07/placeholder-image.png';
  const a: any[] = [];
  const [toastMessage, setToastMessage] = useState('');
  const [toastTitle, setToastTitle] = useState('');
  const [loading, setLoading] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [scraping, setScraping] = useState(false)

  function getApiUrl() {
    return process.env.API_URL || API_URL;
  }

  const gridRef = useRef<AgGridReact>(null);

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
        <div style={{}}>
          {
            (prop.value as String).includes('globaldata')
              ? <Image src={prop.value} loader={(value) => `${value.src}?w=${value.width}&q=${value.quality}`} placeholder='blur' blurDataURL={placeholderImage} layout='fill' objectFit='contain' alt="prod_img" />
              : <Image src={prop.value} placeholder='blur' blurDataURL={placeholderImage} layout='fill' objectFit='contain' alt="prod_img" />
          }
        </div>

    },
    { field: 'sku', filter: true, resizable: true },
    { field: 'name', minWidth: 650, filter: true, resizable: true },
    {
      field: 'url',
      pinned: "right",
      resizable: true,
      width: 300,
      cellRenderer: (prop: ICellRendererParams) =>
        <Box
          direction="row"
          justify="center"
          align="center"
          pad="none"
          margin={"none"}
          gap="xsmall"
        >
          <Box direction="row-responsive" fill="vertical" flex={true} pad="xsmall" gap='xsmall' wrap={true} responsive={true}>
            {
              (prop.data.sellers as Seller[]).map((seller: Seller, index: number) => {
                return <Tag key={index} size='xsmall' value={seller.name} onClick={() => { openInNewTab(seller.url); }} />
              })
            }
          </Box>
          <Button primary disabled={deleteBusy || scraping}
            onClick={async () => {
              setScraping(true);
              gridRef?.current?.api.showLoadingOverlay();
              try {
                await axios.get<Product | any>(`${getApiUrl()}/scrape?sku=${prop.data.sku}`);
                await getProducts();
              } catch (error: any) {
                setToastMessage(error.response.data.message);
                setVisible(true);
              }
              gridRef?.current?.api.hideOverlay();
              setScraping(false);
            }}>
            <span style={{ padding: "1rem" }}>Scrape</span>
          </Button>
          <Button primary onClick={async () => {
            setDeleteBusy(true);
            gridRef?.current?.api.showLoadingOverlay();

            try {
              await axios.delete<boolean | any>(`${getApiUrl()}/product?id=${prop.data._id}`);
              await getProducts();
            }
            catch( error: any) {
              setToastMessage(error.response.data.message);
              setVisible(true);
            }

            gridRef?.current?.api.hideOverlay();
            setScraping(false);
          }}
            color={"#ed5249"}
            disabled={deleteBusy || scraping} icon={<Trash color='white' size='small' />} hoverIndicator >
          </Button>
          {
            !prop.data.image ?
              <Button primary
                onClick={async () => {
                  gridRef?.current?.api.showLoadingOverlay();
                  await axios.get<Product>(`${getApiUrl()}/product/update?prop=image&url=${prop.value}`);
                  await getProducts();
                  gridRef?.current?.api.hideOverlay();
                }}>
                Update Image
              </Button>
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
      options.data?.push(prices);
      options.series?.push({
        data: prices,
        xKey: 'date',
        yKey: 'currentPrice',
        xName: element.name,
        yName: element.name,
        label: {
          enabled: true,
          color: 'white',
          fontWeight: 'bold'
        }

      } as any,
        {
          data: prices,
          xKey: 'date',
          yKey: 'originalPrice',
          xName: 'Preco original ' + element.name,
          yName: 'Preco original ' + element.name,
          label: {
            enabled: true,
            color: 'white'
          }
        } as any);
    });
    setAGGOptions(options);
  }, [AGGOptions]);

  const onChange = (event: any) => setUrlInput(event.target.value);
  const onInputKeyDown = async (event: any) => {
    if (event.key === 'Enter') {
      setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <Grommet full themeMode='dark' style={{ minHeight: "100vh", background: "#2d2d2d" }}>
      <Box width="100%" align='center' justify='around'>
        <Box width="50%">
          <TextInput readOnly={loading} style={{ marginTop: 10, marginBottom: 10 }} size="medium" icon={<Search />} placeholder="https://www.pcdiga.com/componentes/processadores/..." value={urlInput} onChange={onChange} onKeyDown={onInputKeyDown} />
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
