import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  FormControl,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CryptoJS from "crypto-js";
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Store from 'store';
import * as yup from 'yup';
import Style from '../constanta/style.json';
import Layout from '../layouts';

import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
// import Countdown from 'react-countdown'
// import parsePhoneNumber from 'libphonenumber-js'

import { CloudDownload, SimCardDownload } from '@mui/icons-material';

import { filter as filterData, isEqual, size } from 'lodash';

import ModalDialog from '../components/dialog';
import { generateSignature, number_format } from '../helpers/general';

// import wavFile from '../public/sounds/notif.wav';

export default function History() {
  const router = useRouter()
  const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!?"'@#\$%\^&\*.,])(?=.{8,})/
  let schemaData = yup.object().shape({
      email: yup.string().email().required(),
      password: yup.string().matches(passwordRegExp, 'Min 8 Chars, Uppercase, Lowercase, Number and Special Character').required(),
  })

  // const [audio, setAudio] = React.useState(_audio);
  const [loading, setLoading] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(true);
  const [openModal, setOpenModal] = React.useState(false);
  const [openModal2, setOpenModal2] = React.useState(false);
  const [datasAll, setDatasAll] = React.useState([]);
  const [datas, setDatas] = React.useState([]);
  const [datas2, setDatas2] = React.useState([]);
  const [files, setFiles] = React.useState([]);
  const [OTP, setOTP] = React.useState([]);
  const [filter, setFilter] = React.useState(false);
  const [dataDetail, setDataDetail] = React.useState({});
  const [values, setValues] = useState({
    email: '',
    password: '',
  })
  const [alertMessage, setAlertMessage] = React.useState({
    open: false,
    type: 'success',
    message: ''
  })

  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

  useEffect(() => {
    if (size(datasAll) > 0 && !isEqual(datasAll, datas2)) {
      const AUDNotifier = require('aud-notifier')
      setDatas2([...datasAll])
      AUDNotifier.Permission.requestPermission({
        onGranted: function() {
          AUDNotifier.sendNotification('OTPUS', {
            audio: window.location.origin+'/sounds/notif4.wav'
          })
        }
      })
      setTimeout(() => AUDNotifier.clear(), 1000)
    }
}, [datas, datasAll]);

  const getDatas = async (_filter) => {
    const _uri = 'transactions/orders_product/list_orders'
    const _secret = await generateSignature(_uri)
    // const _filter = filter

    fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
        method: 'POST',
        headers: {
          'x-signature': _secret?.signature,
          'x-timestamp': _secret?.timestamp,
          'Authorization': CryptoJS.AES.decrypt(Store.get('token') ?? '', process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS.enc.Utf8).replace(/\"/g, ''),
        },
        body: JSON.stringify({filter: '1=1'})
    })
    .then(res => res.json())
    .then(res => {
      setDatasAll(res?.data)
    }).catch(() => setLoading(false))
  }
  
  useEffect(() => {
      if (filter) {
        setDatas(filterData(datasAll, ['is_file', filter]))
      } else {
        setDatas(datasAll)
      }
      if (dataDetail?.order_id && dataDetail?.is_file === '0') {
        getOTP(dataDetail?.order_id)
      }
  }, [filter, datasAll])
  
  useEffect(() => {
    if (Store.get('token')) {
      getDatas()
      setInterval(() => {
        getDatas()
      }, 5000)
    } else {
      window.location = '/auth'
      router.push('/auth')
      return false
    }
  }, [])

  const getFiles = async (orderID) => {
    const _uri = 'transactions/orders_product/get_files'
    const _secret = await generateSignature(_uri)

    setLoading(true)
    await fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
        method: 'POST',
        headers: {
          'x-signature': _secret?.signature,
          'x-timestamp': _secret?.timestamp,
          'Authorization': CryptoJS.AES.decrypt(Store.get('token') ?? '', process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS.enc.Utf8).replace(/\"/g, ''),
        },
        body: JSON.stringify({"order_id": orderID, filter: '1=1'})
    })
    .then(res => res.json())
    .then(res => {
      setFiles(res?.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  const getOTP = async (orderID) => {
    const _uri = 'transactions/orders_product/get_otp'
    const _secret = await generateSignature(_uri)

    // setLoading(true)
    await fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
        method: 'POST',
        headers: {
          'x-signature': _secret?.signature,
          'x-timestamp': _secret?.timestamp,
          'Authorization': CryptoJS.AES.decrypt(Store.get('token') ?? '', process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS.enc.Utf8).replace(/\"/g, ''),
        },
        body: JSON.stringify({"order_id": orderID, filter: '1=1'})
    })
    .then(res => res.json())
    .then(res => {
      setOTP(res?.data)
      // setLoading(false)
    }).catch(() => setLoading(false))
  }

  const downloadAllFiles = async (orderID, allFiles) => {
    const _uri = 'transactions/orders_product/download_files'
    const _secret = await generateSignature(_uri)

    setOpenModal(false)
    setLoading(true)
    await fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
        method: 'POST',
        headers: {
          'x-signature': _secret?.signature,
          'x-timestamp': _secret?.timestamp,
          'Authorization': CryptoJS.AES.decrypt(Store.get('token') ?? '', process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS.enc.Utf8).replace(/\"/g, ''),
        },
        body: JSON.stringify({"order_id": orderID, "download_type": allFiles, "filter": '1=1'})
    })
    .then(res => res.json())
    .then(res => {
      setAlertMessage({
        open: true,
        type: (res?.code == 1) ? 'error' : 'success',
        message: res?.message
      })

      if (filter) {
        setDatas(filterData(res?.data, ['is_file', filter]))
      } else {
        setDatas(res?.data)
      }
      setFiles(res?.files)
      setLoading(false)
      setOpenModal(true)
      window.open(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}downloads/${orderID}.zip`, '_blank', 'noreferrer');
    })
    .then(async () => {
      await setTimeout(async () => {
        const _uri2 = 'transactions/orders_product/delete_zip'
        const _secret2 = await generateSignature(_uri2)
        await fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri2}`, {
          method: 'POST',
          headers: {
            'x-signature': _secret2?.signature,
            'x-timestamp': _secret2?.timestamp,
            'Authorization': CryptoJS.AES.decrypt(Store.get('token') ?? '', process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS.enc.Utf8).replace(/\"/g, ''),
          },
          body: JSON.stringify({"order_id": orderID, filter: '1=1'})
        })
      }, 5000)
    })
    .catch(() => setLoading(false))
  }

  const showPhoneNumber = async (_id) => {
    const _uri = 'transactions/orders_product/show_phone_number'
    const _secret = await generateSignature(_uri)

    setLoading(true)
    setOpenModal2(false)
    await fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
        method: 'POST',
        headers: {
          'x-signature': _secret?.signature,
          'x-timestamp': _secret?.timestamp,
          'Authorization': CryptoJS.AES.decrypt(Store.get('token') ?? '', process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS.enc.Utf8).replace(/\"/g, ''),
        },
        body: JSON.stringify({order_id: dataDetail?.order_id, id: _id, filter: '1=1'})
    })
    .then(res => res.json())
    .then(res => {
      if (filter) {
        setDatas(filterData(res?.data, ['is_file', filter]))
      } else {
        setDatas(res?.data)
      }
      setOTP(res?.otp)
      setLoading(false)
      setOpenModal2(true)
      e.target.files = null
    }).catch(() => setLoading(false))
  }

  return (
    <>
      <Layout type="dashboard">
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

                <h2>
                  History Order Products &emsp;
                  <FormControl>
                    <InputLabel id="demo-simple-select-label">Filter</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={filter}
                      label="Filter"
                      size='small'
                      onChange={e => setFilter(e?.target?.value)}
                    >
                      <MenuItem value={false}>All</MenuItem>
                      <MenuItem value={"1"}>File</MenuItem>
                      <MenuItem value={"0"}>OTP</MenuItem>
                    </Select>
                  </FormControl>
                </h2><br/>

              <DataTable id="main-data-table" value={datas} size={'large'} paginator rows={10} rowsPerPageOptions={[10, 25, 50, 100]} tableStyle={{ minWidth: '1rem' }}>
                  <Column key={'no'} field={'no'} header={'Order ID'} body={
                      (data) => ((data?.is_file === '1') ? <Link onClick={() => {setOpenModal(true); setDataDetail(data); getFiles(data?.order_id);}}>{(data?.order_id)}</Link> : <Link onClick={() => {setOpenModal2(true); setDataDetail(data); getOTP(data?.order_id);}}>{(data?.order_id)}</Link>)
                  } />
                  <Column key={'Type'} field={'Type'} header={'Type'} body={
                      (data) => (data?.is_file === '1') ? 'File' : 'OTP'
                  } />
                  <Column key={'operator'} field={'operator'} header={'Product'} body={
                      (data) => data?.operator_name
                  } />
                  <Column key={'country'} field={'country'} header={'Country'} body={
                      (data) => data?.country
                  } />
                  <Column key={'total_order'} field={'total_order'} header={'Total Order'} body={
                      (data) => number_format(data?.total)
                  } />
                  <Column key={'total_done'} field={'total_done'} header={'Total Done'} body={
                      (data) => number_format(data?.is_done) ?? '0'
                  } />
                  <Column key={'status'} field={'status'} header={'Status'} body={
                      (data) => ((data?.status === 'Done') ? <p style={{color: 'orange'}}>{data?.status}</p> : ((data?.is_file === '1') ? <Link onClick={() => {setOpenModal(true); setDataDetail(data); getFiles(data?.order_id);}}>{data?.status}</Link> : <Link onClick={() => {setOpenModal2(true); setDataDetail(data); getOTP(data?.order_id);}}>{data?.status}</Link>))
                  } />
                  <Column key={'created_date'} field={'created_date'} header={'Last Update'} body={
                      (data) => moment(data?.created_date).format('ddd, DD/MM/YYYY HH:mm')
                  } />
                  <Column key={'action'} field={'action'} header={'Action'} body={
                      (data) => ((data?.is_file === '1') ? 
                      <Button variant='contained' color={(data?.status === 'Done') ? 'warning' : 'primary'} size='small' onClick={() => {setOpenModal(true); setDataDetail(data); getFiles(data?.order_id);}}>Detail</Button> :
                      <Button variant='contained' color={(data?.status === 'Done') ? 'warning' : 'primary'} size='small' onClick={() => {setOpenModal2(true); setDataDetail(data); getOTP(data?.order_id);}}>Detail</Button>
                      )
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

      <ModalDialog titleModal={"(File) Order Detail " + dataDetail?.order_id} openModal={openModal} setOpenModal={setOpenModal}>
          <Box style={{width: 550}}>
            <h3>{dataDetail?.operator_name} - <Link sx={{fontSize: '24px !important'}}>{dataDetail?.country}</Link></h3>
            <p>Total Order : <b>{number_format(dataDetail?.total)}</b> | Total Done : <b>{number_format(size(files))}</b></p>
            <br/>

                { (size(files) > 0 && (moment(dataDetail?.created_date).add(70, 'hours')) > moment()) && <Box sx={{textAlign: 'center', mb: 3}}>

                  <Button component="label" variant="contained" onClick={(e) => downloadAllFiles(dataDetail?.order_id, 'all')} startIcon={<CloudDownload />}>
                    Download All Files
                  </Button>

                  {(size(filterData(files, ['is_downloaded', '0'])) > 0) && <> &emsp; <Button component="label" color='success' variant="contained" onClick={(e) => downloadAllFiles(dataDetail?.order_id, 'idle')} startIcon={<SimCardDownload />}>
                    Download Idle Files
                  </Button></>}

                </Box>}

            <DataTable value={files} size={'small'} paginator rows={100} rowsPerPageOptions={[100]} tableStyle={{ minWidth: '1rem' }}>
                  <Column key={'filename'} field={'filename'} header={'Product Name'} body={
                      (file) => file?.filename
                  } />
                  <Column key={'filesize'} field={'filesize'} header={'Product Size'} body={
                      (file) => file?.filesize
                  } />
                  <Column key={'is_downloaded'} field={'is_downloaded'} header={'Is Downloaded'} body={
                      (file) => (file?.is_downloaded === '0') ? 'No' : 'Yes'
                  } />
              </DataTable>
          </Box>
      </ModalDialog>

      <ModalDialog titleModal={"(OTP) Order Detail " + dataDetail?.order_id} openModal={openModal2} setOpenModal={setOpenModal2}>
          <Box style={{width: 550}}>
            <h3>{dataDetail?.operator_name} - <Link sx={{fontSize: '24px !important'}}>{dataDetail?.country}</Link></h3>
            <p>Total Order : <b>{number_format(dataDetail?.total)}</b> | Total Done : <b>{number_format(size(filterData(OTP, ['is_request', '2'])))}</b></p>
            <Button variant='contained' color='warning' size='small' onClick={() => getOTP(dataDetail?.order_id)} sx={{mb: 2}}>Refresh</Button>

            <DataTable value={OTP} size={'small'} paginator rows={100} rowsPerPageOptions={[100]} tableStyle={{ minWidth: '1rem' }}>
                  <Column key={'phone_number'} field={'phone_number'} header={'Phone Number'} body={
                      (file) => (parseInt(file?.is_request) < 1) ? 
                      <Button variant='contained' size='small' onClick={() => showPhoneNumber(file?.id)}>Show {file?.phone_number}</Button> : file?.phone_number
                  } />
                  <Column key={'otp_code'} field={'otp_code'} header={'OTP Code'} body={
                      (file) => file?.otp_code
                  } />
              </DataTable>
          </Box>
      </ModalDialog>
      
    
      <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={openDialog}
      >
      </Backdrop>
      <Dialog onClose={() => setOpenDialog(false)} open={openDialog}>
        <Button variant='contained' color="primary" size='large' onClick={() => setOpenDialog(false)}>
          Show My Orders
        </Button>
      </Dialog>
      
    </>
  )
}
