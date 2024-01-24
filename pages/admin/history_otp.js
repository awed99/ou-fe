import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  Grid,
  Link,
  Snackbar,
  TextField
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CryptoJS from "crypto-js";
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Store from 'store';
import * as yup from 'yup';
import Style from '../../constanta/style.json';
import Layout from '../../layouts';


import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
// import Countdown from 'react-countdown'
// import parsePhoneNumber from 'libphonenumber-js'

import { filter as filterData, isEqual, size } from 'lodash';

import { PhoneAndroid } from '@mui/icons-material';

import ModalDialog from '../../components/dialog';
import { generateSignature, number_format } from '../../helpers/general';

export default function History() {
  const router = useRouter()
  const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!?"'@#\$%\^&\*.,])(?=.{8,})/
  let schemaData = yup.object().shape({
      email: yup.string().email().required(),
      password: yup.string().matches(passwordRegExp, 'Min 8 Chars, Uppercase, Lowercase, Number and Special Character').required(),
  })

  const [loading, setLoading] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(true);
  const [openModal, setOpenModal] = React.useState(false);
  const [openModal2, setOpenModal2] = React.useState(false);
  const [datas, setDatas] = React.useState([]);
  const [datas2, setDatas2] = React.useState([]);
  const [OTP, setOTP] = React.useState([]);
  const [tempOTP, setTempOTP] = React.useState([]);
  const [updateOTPID, setUpdateOTPID] = React.useState(0);
  const [dataDetail, setDataDetail] = React.useState({});
  const [phoneNumber, setPhoneNumber] = useState('')
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

  const getDatas = async () => {
    const _uri = 'admin/orders/list_otp'
    const _secret = await generateSignature(_uri)

    await fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
        method: 'POST',
        headers: {
          'x-signature': _secret?.signature,
          'x-timestamp': _secret?.timestamp,
          'Authorization': CryptoJS.AES.decrypt(Store.get('token_admin') ?? '', process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS.enc.Utf8).replace(/\"/g, ''),
        },
    })
    .then(res => res.json())
    .then(res => {
      setDatas(res?.data)
      setTimeout(() => {
        getDatas()
      }, 5000)
    }).catch(() => setLoading(false))
  }

  const getOTP = async (orderID) => {
    const _uri = 'admin/orders/get_otp'
    const _secret = await generateSignature(_uri)

    // setLoading(true)
    await fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
        method: 'POST',
        headers: {
          'x-signature': _secret?.signature,
          'x-timestamp': _secret?.timestamp,
          'Authorization': CryptoJS.AES.decrypt(Store.get('token_admin') ?? '', process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS.enc.Utf8).replace(/\"/g, ''),
        },
        body: JSON.stringify({"order_id": orderID})
    })
    .then(res => res.json())
    .then(res => {
      setOTP(res?.data)
      // setLoading(false)
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
    if (size(datas) > 0 && !isEqual(datas, datas2)) {
      const AUDNotifier = require('aud-notifier')
      setDatas2(datas)
      AUDNotifier.Permission.requestPermission({
        onGranted: function() {
          AUDNotifier.sendNotification('OTPUS', {
            audio: window.location.origin+'/sounds/notif4.wav'
          })
        }
      })
      setTimeout(() => AUDNotifier.clear(), 1000)
    }
    if (dataDetail?.order_id && dataDetail?.is_file === '0') {
      getOTP(dataDetail?.order_id)
    }
}, [datas]);
  
  useEffect(() => {
    if (!openModal2 && size(OTP) > 0) {
      setOpenModal(true)
    }
  }, [openModal2])

  const addPhoneNumber = async (e) => {
    const _uri = 'admin/orders/add_phone_number'
    const _secret = await generateSignature(_uri)

    setLoading(true)
    setOpenModal(false)
    await fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
        method: 'POST',
        headers: {
          'x-signature': _secret?.signature,
          'x-timestamp': _secret?.timestamp,
          'Authorization': CryptoJS.AES.decrypt(Store.get('token_admin') ?? '', process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS.enc.Utf8).replace(/\"/g, ''),
        },
        body: JSON.stringify({order_id: dataDetail?.order_id, phone_number: phoneNumber})
    })
    .then(res => res.json())
    .then(res => {
      setDatas(res?.data)
      setOTP(res?.otp)
      setLoading(false)
      setOpenModal2(false)
      setOpenModal(true)
      setPhoneNumber('')
      e.target.files = null
    }).catch(() => setLoading(false))
  }

  const updateOTP = async (_id, _otp_code, _orderID) => {
    const _uri = 'admin/orders/update_otp'
    const _secret = await generateSignature(_uri)

    setLoading(true)
    // setOpenModal(false)
    await fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
        method: 'POST',
        headers: {
          'x-signature': _secret?.signature,
          'x-timestamp': _secret?.timestamp,
          'Authorization': CryptoJS.AES.decrypt(Store.get('token_admin') ?? '', process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS.enc.Utf8).replace(/\"/g, ''),
        },
        body: JSON.stringify({order_id: _orderID, id: _id, otp_code: _otp_code})
    })
    .then(res => res.json())
    .then(res => {
      setDatas(res?.data)
      setOTP(res?.otp)
      setLoading(false)
      setTempOTP('')
      setUpdateOTPID(0)
      // setOpenModal2(false)
      // setOpenModal(true)
      // setPhoneNumber('')
      e.target.files = null
    }).catch(() => setLoading(false))
  }

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

                <h2>History Order OTP</h2><br/>

              <DataTable value={datas} size={'large'} paginator rows={100} rowsPerPageOptions={[100, 200, 500, 1000]} tableStyle={{ minWidth: '1rem' }}>
                  <Column key={'no'} field={'no'} header={'Order ID'} body={
                      (data) => ((data?.status === 'Done') ? <p style={{color: 'orange'}}>{data?.order_id}</p> : <Link onClick={() => {setOpenModal(true); setDataDetail(data); getOTP(data?.order_id);}}>{(data?.order_id)}</Link>)
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
                      (data) => ((data?.status === 'Done') ? <p style={{color: 'orange'}}>{data?.status}</p> : <Link onClick={() => {setOpenModal(true); setDataDetail(data); getOTP(data?.order_id);}}>{data?.status}</Link>)
                  } />
                  <Column key={'created_date'} field={'created_date'} header={'Last Update'} body={
                      (data) => moment(data?.created_date).format('ddd, DD/MM/YYYY HH:mm')
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

      <ModalDialog titleModal={"(OTP) Order Detail " + dataDetail?.order_id} openModal={openModal} setOpenModal={setOpenModal}>
          <Box style={{width: 550}}>
            <h3>{dataDetail?.operator_name} - <Link sx={{fontSize: '24px !important'}}>{dataDetail?.country}</Link></h3>
            <p>Total Order : <b>{number_format(dataDetail?.total)}</b> | Total Done : <b>{number_format(size(filterData(OTP, ['is_request', '2'])))}</b></p>
            <br/>

              <Box sx={{textAlign: 'center', mb: 3}}>

                  {(size(filterData(OTP, ['is_request', '2'])) < parseInt(dataDetail?.total)) && <><Button component="label" variant="contained" size='small' onClick={() => {setOpenModal(false); setOpenModal2(true);}} startIcon={<PhoneAndroid />}>
                    Add Phone Number
                  </Button>
                  &emsp;</>}
                  <Button variant='contained' color='warning' size='small' onClick={() => getOTP(dataDetail?.order_id)}>Refresh</Button>

                </Box>

            <DataTable value={OTP} size={'small'} paginator rows={100} rowsPerPageOptions={[100]} tableStyle={{ minWidth: '1rem' }}>
                  <Column key={'phone_number'} field={'phone_number'} header={'Phone Number'} body={
                      (file) => file?.phone_number
                  } />
                  <Column key={'otp_code'} field={'otp_code'} header={'OTP Code'} body={
                      (file) => (parseInt(file?.is_request) < 1) ? <i>*Waiting</i> :
                      ((updateOTPID === file?.id) ?<TextField 
                      variant='outlined' 
                      size='small' 
                      onChange={(e) => setTempOTP(e?.target?.value)} 
                      value={tempOTP} 
                      InputProps={{
                        endAdornment: <Button variant='contained' size='small' onClick={() => updateOTP(file?.id, tempOTP, dataDetail?.order_id)}>Send</Button>
                      }}
                      fullWidth/> : 
                      <Button variant='contained' color={(file?.otp_code) ? "primary" : "warning"} size='small' onClick={() => {setUpdateOTPID(file?.id); setTempOTP(file?.otp_code)}}>
                      {file?.otp_code ?? '-'}
                      </Button>)
                  } />
              </DataTable>
          </Box>
      </ModalDialog>

      <ModalDialog titleModal={"Add New Number "} openModal={openModal2} setOpenModal={setOpenModal2} handleSubmitFunction={addPhoneNumber}>
          <Box style={{width: 550}}>
            <h3>{dataDetail?.operator_name} - <Link sx={{fontSize: '24px !important'}}>{dataDetail?.country}</Link></h3>
            <TextField value={phoneNumber} onChange={e => setPhoneNumber(e?.target?.value)} label="Phone Number" variant="outlined" size='small' fullWidth sx={{mt: 3}} />            
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
