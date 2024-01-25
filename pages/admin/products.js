import {
  Alert,
  Autocomplete,
  Backdrop,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  Link,
  Snackbar,
  Switch,
  TextField,
} from '@mui/material';
import CryptoJS from "crypto-js";
import { filter, size } from 'lodash';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { NumericFormat } from 'react-number-format';
import Store from 'store';
import * as yup from 'yup';
import Style from '../../constanta/style.json';
import Layout from '../../layouts';

import { AddShoppingCart } from '@mui/icons-material';

import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
// import Countdown from 'react-countdown'
// import parsePhoneNumber from 'libphonenumber-js'

import ModalDialog from '../../components/dialog';
import { generateSignature, number_format } from '../../helpers/general';

export default function Products() {
  const router = useRouter()
  const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!?"'@#\$%\^&\*.,])(?=.{8,})/
  let schemaData = yup.object().shape({
      email: yup.string().email().required(),
      password: yup.string().matches(passwordRegExp, 'Min 8 Chars, Uppercase, Lowercase, Number and Special Character').required(),
  })

  const [loading, setLoading] = React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);
  const [openModal2, setOpenModal2] = React.useState(false);
  const [datas, setDatas] = React.useState([]);
  const [curs, setCurs] = React.useState({});
  const [countryDataSelected, setCountryDataSelected] = React.useState();
  const [dataDetail, setDataDetail] = React.useState({});
  const [dataProductCode, setDataProductCode] = React.useState('');
  const [dataProductName, setDataProductName] = React.useState('');
  const [dataProductPriceIDR, setDataProductPriceIDR] = React.useState('');
  const [dataProductPriceUSD, setDataProductPriceUSD] = React.useState('');
  const [dataProductIsFile, setDataProductIsFile] = React.useState(false);
  const [dataProductStatus, setDataProductStatus] = React.useState(true);
  const [changeStatus, setChangeStatus] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState({
    open: false,
    type: 'success',
    message: ''
  })

  const countries = Store.get('list_countries')?.map(item => ({"label":item?.country, "code":item?.country_code, "id":item?.id}))

  const getDatas = async () => {
    const _uri = 'admin/products/list'
    const _secret = await generateSignature(_uri)

    fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
        method: 'POST',
        headers: {
          'x-signature': _secret?.signature,
          'x-timestamp': _secret?.timestamp,
          'Authorization': CryptoJS.AES.decrypt(Store.get('token_admin') ?? '', process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS.enc.Utf8).replace(/\"/g, ''),
        },
        // body: JSON.stringify({
        //     "country_id": countryDataSelected?.id,
        //     "country_code": countryDataSelected?.code
        // })
    })
    .then(res => res.json())
    .then(res => {
      setCurs(res?.curs)
      setDatas(res?.data)
      // setTimeout(() => {
      //   getDatas()
      // }, 10000)
    }).catch(() => setLoading(false))
  }

  const addData = async () => {
    const _uri = 'admin/products/add'
    const _secret = await generateSignature(_uri)

    fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
        method: 'POST',
        headers: {
          'x-signature': _secret?.signature,
          'x-timestamp': _secret?.timestamp,
          'Authorization': CryptoJS.AES.decrypt(Store.get('token_admin') ?? '', process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS.enc.Utf8).replace(/\"/g, ''),
        },
        body: JSON.stringify({
            "id": dataDetail?.id,
            "id_country": countryDataSelected?.id,
            "operator_code": dataProductCode,
            "operator_name": dataProductName,
            "op_price": dataProductPriceUSD,
            "is_file": dataProductIsFile
        })
    })
    .then(res => res.json())
    .then(res => {
      setOpenModal(false)
      setOpenModal2(false)
      setChangeStatus(false)
      setCountryDataSelected(false)
      setDataProductCode('')
      setDataProductName('')
      setDataProductPriceUSD('')
      setDataProductPriceIDR('')
      setDataProductIsFile(false)
      setDataProductStatus(false)
      setAlertMessage({
        open: true,
        type: (res?.code > 0) ? 'error' : 'success',
        message: res?.message
      })
      setCurs(res?.curs)
      setDatas(res?.data)
      getDatas()
    }).catch(() => setLoading(false))
  }

  const updateData = async () => {
    const _uri = 'admin/products/update'
    const _secret = await generateSignature(_uri)

    setLoading(true)
    fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
        method: 'POST',
        headers: {
          'x-signature': _secret?.signature,
          'x-timestamp': _secret?.timestamp,
          'Authorization': CryptoJS.AES.decrypt(Store.get('token_admin') ?? '', process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS.enc.Utf8).replace(/\"/g, ''),
        },
        body: JSON.stringify((changeStatus) ? {
            "id": dataDetail?.id,
            "status": (dataProductStatus === true) ? 1 : 0
        } : {
          "id": dataDetail?.id,
          "id_country": countryDataSelected?.id,
          "operator_code": dataProductCode,
          "operator_name": dataProductName,
          "op_price": dataProductPriceUSD,
          "is_file": dataProductIsFile
        })
    })
    .then(res => res.json())
    .then(res => {
      setOpenModal(false)
      setOpenModal2(false)
      setChangeStatus(false)
      setCountryDataSelected(false)
      setDataProductCode('')
      setDataProductName('')
      setDataProductPriceUSD('')
      setDataProductPriceIDR('')
      setDataProductIsFile(false)
      setDataProductStatus(false)
      setAlertMessage({
        open: true,
        type: (res?.code > 0) ? 'error' : 'success',
        message: res?.message
      })
      setCurs(res?.curs)
      setDatas(res?.data)
      // getDatas()
      setTimeout(() => setLoading(false), 2500)
    }).catch(() => setLoading(false))
  }
  
  useEffect(() => {
    if (Store.get('token_admin')) {
      getDatas()
    } else {
      window.location = '/auth'
      router.push('/auth')
      return false
    }
  }, [])
  
  useEffect(() => {
    if (size(dataProductPriceUSD) > 1 && (changeStatus === true)) {
      updateData(true)
    }
  }, [changeStatus, dataProductPriceUSD])
  
  useEffect(() => {
    if (size(dataDetail) > 0) {
      setDataProductCode(dataDetail?.operator_code)
      setDataProductName(dataDetail?.operator_name)
      setDataProductPriceUSD(dataDetail?.op_price)
      setDataProductPriceIDR(parseInt(parseFloat(dataDetail?.op_price) * parseFloat(curs?.curs_usd_to_idr)))
      setDataProductIsFile(dataDetail?.is_file === "1")
      // setDataProductStatus(dataDetail?.status)
    } else {
      setCountryDataSelected(false)
      setDataProductCode('')
      setDataProductName('')
      setDataProductPriceUSD('')
      setDataProductPriceIDR('')
      setDataProductIsFile(false)
      setDataProductStatus(false)
    }
  }, [dataDetail])
  
  useEffect(() => {
    if (dataProductPriceIDR > 0) {
      const priceUSD = (parseFloat(dataProductPriceIDR) / parseFloat(curs?.curs_usd_to_idr)).toFixed(2)
      console.log(priceUSD)
      setDataProductPriceUSD(priceUSD)
    } else {
      setDataProductPriceUSD('0')
    }
  }, [dataProductPriceIDR])

  return (
    <>
      <Layout type="dashboard_admin">
        <Box sx={{ background: 'none', flexGrow: 0, alignItems: 'center', justifyContent: 'center', minHeight: '87.9vh' }}>
          <Grid container>
            <Grid item xs={12}
              sx={{
                p: {
                  xs: 1,
                  md: 3,
                  lg: 4,
                  xl: 6,
                },
              // display: 'flex', 
              background: Style?.color?.white,
              borderRadius: 2,
              }}>

                <h2>Products</h2>
                <Button variant="contained" sx={{mt: 2, mb: 2}} onClick={() => {setOpenModal(true); setDataDetail(null)}} startIcon={<AddShoppingCart />}>
                  Add Product
                </Button>
                <br/>

              <DataTable value={datas} size={'large'} paginator rows={10} rowsPerPageOptions={[10, 25, 50, 100]} tableStyle={{ minWidth: '1rem' }}>
                  <Column key={'country'} field={'country'} header={'Country'} body={
                      (data) => data?.country
                  } />
                  <Column key={'operator_code'} field={'operator_code'} header={'Code'} body={
                      (data) => data?.operator_code
                  } />
                  <Column key={'operator'} field={'operator'} header={'Product'} body={
                      (data) => data?.operator_name
                  } />
                  <Column key={'op_price'} field={'op_price'} header={'Price USD'} body={
                      (data) => number_format(data?.op_price)
                  } />
                  <Column key={'op_price_idr'} field={'op_price_idr'} header={'Price IDR'} body={
                      (data) => number_format(Math.ceil(parseFloat(data?.op_price) * parseFloat(curs?.curs_usd_to_idr))) ?? '0'
                  } />
                  <Column key={'status'} field={'status'} header={'Status'} body={
                      (data) => <Switch checked={data?.status === '1'} onClick={() => {setDataDetail(data); setDataProductStatus((data?.status === '1') ? false : true); setChangeStatus(true)}} />
                  } />
                  <Column key={'Action'} field={'Action'} header={'Action'} body={
                      (data) => <Link onClick={() => {setDataDetail(data); setCountryDataSelected(filter(countries, ['id', data?.id_country?.toString()])[0]); setOpenModal2(true);}}>Update</Link>
                  } />
              </DataTable>
                
                
                
            </Grid>
          </Grid>
        </Box>
      </Layout>
    
    <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
    >
        <CircularProgress color="error" size={100} variant="indeterminate" />
    </Backdrop>

    <Snackbar
        anchorOrigin={{ 'vertical':'bottom', 'horizontal':'left' }}
        open={alertMessage?.open}
        autoHideDuration={3000}
        onClose={() => setAlertMessage({
          open: false,
          type: alertMessage?.type,
          message: ''
        })}
    >
        <Alert severity={alertMessage?.type} sx={{ width: '100%' }}>
        {alertMessage?.message}
        </Alert>
    </Snackbar>

      <ModalDialog titleModal={"Order Detail " + dataDetail?.order_id} openModal={openModal} setOpenModal={setOpenModal} handleSubmitFunction={addData}>
          <Box style={{width: 550}}>

            <Box sx={{mt:0}}>
                <p><b>
                  {size(countries)} Country Available
                </b></p>
                <Autocomplete
                  sx={{mb:2, mt:1, mr:1, width:'60%', display: 'inline-block', verticalAlign: 'bottom'}}
                  disableClearable
                  id="country-select-demo"
                  size="small"
                  onAbort={() => {setCountryDataSelected({"label":"Indonesia", "code": "ID", "id":"6"});}}
                  value={countryDataSelected || []}
                  onChange={(i, val) => {setCountryDataSelected(val);}}
                  options={countries}
                  autoHighlight
                  getOptionLabel={(option) => option?.label}
                  renderOption={(props, option) => (
                    <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                      <img
                        loading="lazy"
                        width="20"
                        src={`https://flagcdn.com/w20/${option?.code?.toLowerCase()}.png`}
                        srcSet={`https://flagcdn.com/w40/${option?.code?.toLowerCase()}.png 2x`}
                        alt=""
                      />
                      {option.label} ({option.code})
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '37'])[0]?.translated_text}
                      inputProps={{
                        ...params.inputProps,
                      }}
                    />
                  )}
                />

                <TextField 
                  sx={{mb:0, float: 'right', bottom: '-8px', verticalAlign: 'bottom'}}
                  label="Product Code" 
                  value={dataProductCode}
                  onChange={(e) => setDataProductCode(e?.target?.value)}
                  variant="outlined"
                  size="small"
                />

                <TextField 
                  fullWidth
                  sx={{mb:2}}
                  label="Product Name" 
                  value={dataProductName}
                  onChange={(e) => setDataProductName(e?.target?.value)}
                  variant="outlined"
                  size="small"
                />
                
                <NumericFormat
                  sx={{mb:2}}
                  // {...props}
                  value={dataProductPriceIDR}
                  // mask={mask}
                  customInput={TextField}
                  prefix={'Rp '}
                  label="Price IDR"
                  placeholder="Min. Rp 100"
                  variant="outlined"
                  size="small"
                  fullWidth
                  thousandSeparator={','}
                  onValueChange={(values) => setDataProductPriceIDR(values?.value)}
                />
                
                <NumericFormat
                  sx={{mb:2}}
                  value={dataProductPriceUSD}
                  customInput={TextField}
                  prefix={'USD '}
                  label="Price USD"
                  variant="outlined"
                  size="small"
                  fullWidth
                  thousandSeparator={','}
                  readOnly={true}
                  disabled={true}
                  // onValueChange={(values) => setDataProductPriceUSD(values?.value)}
                />

                <FormControlLabel
                 control={<Checkbox />} 
                 checked={dataProductIsFile}
                 onChange={e => setDataProductIsFile(e?.target?.checked)}
                 label="Is File ?" 
                 />
            </Box>
            
          </Box>
      </ModalDialog>

      <ModalDialog titleModal={"Update Products"} openModal={openModal2} setOpenModal={setOpenModal2} handleSubmitFunction={updateData}>
          <Box style={{width: 550}}>

            <Box sx={{mt:0}}>
                <p><b>
                  {size(countries)} Country Available
                </b></p>
                <Autocomplete
                  sx={{mb:2, mt:1, mr:1, width:'60%', display: 'inline-block', verticalAlign: 'bottom'}}
                  disableClearable
                  id="country-select-demo"
                  size="small"
                  onAbort={() => {setCountryDataSelected({"label":"Indonesia", "code": "ID", "id":"6"});}}
                  value={countryDataSelected || []}
                  onChange={(i, val) => {setCountryDataSelected(val);}}
                  options={countries}
                  autoHighlight
                  getOptionLabel={(option) => option?.label}
                  renderOption={(props, option) => (
                    <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                      <img
                        loading="lazy"
                        width="20"
                        src={`https://flagcdn.com/w20/${option?.code?.toLowerCase()}.png`}
                        srcSet={`https://flagcdn.com/w40/${option?.code?.toLowerCase()}.png 2x`}
                        alt=""
                      />
                      {option.label} ({option.code})
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '37'])[0]?.translated_text}
                      inputProps={{
                        ...params.inputProps,
                      }}
                    />
                  )}
                />

                <TextField 
                  sx={{mb:0, float: 'right', bottom: '-8px', verticalAlign: 'bottom'}}
                  label="Product Code" 
                  value={dataProductCode}
                  onChange={(e) => setDataProductCode(e?.target?.value)}
                  variant="outlined"
                  size="small"
                />

                <TextField 
                  fullWidth
                  sx={{mb:2}}
                  label="Product Name" 
                  value={dataProductName}
                  onChange={(e) => setDataProductName(e?.target?.value)}
                  variant="outlined"
                  size="small"
                />
                
                <NumericFormat
                  sx={{mb:2}}
                  // {...props}
                  value={dataProductPriceIDR}
                  // mask={mask}
                  customInput={TextField}
                  prefix={'Rp '}
                  label="Price IDR"
                  placeholder="Min. Rp 100"
                  variant="outlined"
                  size="small"
                  fullWidth
                  thousandSeparator={','}
                  onValueChange={(values) => setDataProductPriceIDR(values?.value)}
                />
                
                <NumericFormat
                  sx={{mb:2}}
                  value={dataProductPriceUSD}
                  customInput={TextField}
                  prefix={'USD '}
                  label="Price USD"
                  variant="outlined"
                  size="small"
                  fullWidth
                  thousandSeparator={','}
                  readOnly={true}
                  disabled={true}
                  // onValueChange={(values) => setDataProductPriceUSD(values?.value)}
                />

                <FormControlLabel
                 control={<Checkbox />} 
                 checked={dataProductIsFile}
                 onChange={e => setDataProductIsFile(e?.target?.checked)}
                 label="Is File ?" 
                 />
            </Box>
            
          </Box>
      </ModalDialog>
    </>
  )
}
