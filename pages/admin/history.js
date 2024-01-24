import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  Grid,
  Link,
  Snackbar
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

import { CloudUpload } from '@mui/icons-material';

import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
// import Countdown from 'react-countdown'
// import parsePhoneNumber from 'libphonenumber-js'

// import AUDNotifier from 'aud-notifier';
import { isEqual, size } from 'lodash';

import ModalDialog from '../../components/dialog';
import { generateSignature, number_format } from '../../helpers/general';

export default function History() {
  const router = useRouter()
  const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!?"'@#\$%\^&\*.,])(?=.{8,})/
  let schemaData = yup.object().shape({
      email: yup.string().email().required(),
      password: yup.string().matches(passwordRegExp, 'Min 8 Chars, Uppercase, Lowercase, Number and Special Character').required(),
  })

  // const [audioDom, setAdudioDom] = useState<HTMLAudioElement | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(true);
  const [openModal, setOpenModal] = React.useState(false);
  const [openModal2, setOpenModal2] = React.useState(false);
  const [datas, setDatas] = React.useState([]);
  const [datas2, setDatas2] = React.useState([]);
  const [files, setFiles] = React.useState([]);
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

  const getDatas = async () => {
    const _uri = 'admin/orders/list'
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

  const getFiles = async (orderID) => {
    const _uri = 'admin/orders/get_files'
    const _secret = await generateSignature(_uri)

    setLoading(true)
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
      setFiles(res?.data)
      setLoading(false)
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
}, [datas]);

  const uploadFiles = async (e) => {
    // console.log('e: ', e)
    // return false
    let images = e.target.files;
    var i;
    const formData = new FormData();
    formData.append("order_id", dataDetail?.order_id)
    for (i=0; i<e.target.files.length; i++) {
      formData.append(
          "file[]",
          images[i],
          images[i]?.name
      )
    }

    const _uri = 'admin/orders/upload'
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
        body: formData
    })
    .then(res => res.json())
    .then(res => {
      setDatas(res?.data)
      setFiles(res?.files)
      setLoading(false)
      setOpenModal(true)
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

                <h2>History Order Files</h2><br/>

              <DataTable value={datas} size={'large'} paginator rows={100} rowsPerPageOptions={[100, 200, 500, 1000]} tableStyle={{ minWidth: '1rem' }}>
                  <Column key={'no'} field={'no'} header={'Order ID'} body={
                      (data) => ((data?.status === 'Done') ? <p style={{color: 'orange'}}>{data?.order_id}</p> : <Link onClick={() => {setOpenModal(true); setDataDetail(data); getFiles(data?.order_id);}}>{(data?.order_id)}</Link>)
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
                      (data) => ((data?.status === 'Done') ? <p style={{color: 'orange'}}>{data?.status}</p> : <Link onClick={() => {setOpenModal(true); setDataDetail(data); getFiles(data?.order_id);}}>{data?.status}</Link>)
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

      <ModalDialog titleModal={"(File) Order Detail " + dataDetail?.order_id} openModal={openModal} setOpenModal={setOpenModal}>
          <Box style={{width: 550}}>
            <h3>{dataDetail?.operator_name} - <Link sx={{fontSize: '24px !important'}}>{dataDetail?.country}</Link></h3>
            <p>Total Order : <b>{number_format(dataDetail?.total)}</b> | Total Done : <b>{number_format(size(files))}</b></p>
            <br/>

                { (size(files) < dataDetail?.total) && <Box sx={{textAlign: 'center', mb: 3}}>

                  <Button component="label" variant="contained" startIcon={<CloudUpload />}>
                    Upload files
                    {/* <VisuallyHiddenInput type="file" onChange={(e) => uploadFiles(e)} multiple /> */}
                    <input type="file" onChange={(e) => uploadFiles(e)} multiple style={{display: 'none'}} />
                  </Button>

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
