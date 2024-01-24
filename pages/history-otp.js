import {
  Alert,
  Backdrop,
  Box,
  CircularProgress,
  Grid,
  Link,
  Snackbar
} from '@mui/material';
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

import { generateSignature } from '../helpers/general';

export default function HistoryOTP() {
  const router = useRouter()
  const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!?"'@#\$%\^&\*.,])(?=.{8,})/
  let schemaData = yup.object().shape({
      email: yup.string().email().required(),
      password: yup.string().matches(passwordRegExp, 'Min 8 Chars, Uppercase, Lowercase, Number and Special Character').required(),
  })

  const [loading, setLoading] = React.useState(false);
  const [datas, setDatas] = React.useState([]);
  const [values, setValues] = useState({
    email: '',
    password: '',
  })
  const [alertMessage, setAlertMessage] = React.useState({
    open: false,
    type: 'success',
    message: ''
  })

  const getDatas = async () => {
    const _uri = 'transactions/orders/list_orders'
    const _secret = await generateSignature(_uri)

    fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
        method: 'POST',
        headers: {
          'x-signature': _secret?.signature,
          'x-timestamp': _secret?.timestamp,
          'Authorization': CryptoJS.AES.decrypt(Store.get('token') ?? '', process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS.enc.Utf8).replace(/\"/g, ''),
        },
        // body: JSON.stringify({
        //     "country_id": countryDataSelected?.id,
        //     "country_code": countryDataSelected?.code
        // })
    })
    .then(res => res.json())
    .then(res => {
      setDatas(res?.data)
    }).catch(() => setLoading(false))
  }
  
  useEffect(() => {
    if (Store.get('token')) {
      getDatas()
    } else {
      window.location = '/auth'
      router.push('/auth')
      return false
    }
    
    // const _x = setInterval(() => {
    //     getDatas()
    // }, 1000)

    // return () => {
    //   clearInterval(_x)
    // }
  }, [])

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

                <h2>History Order</h2><br/>

              <DataTable value={datas} size={'large'} paginator rows={10} rowsPerPageOptions={[10, 25, 50, 100]} tableStyle={{ minWidth: '1rem' }}>
                  <Column key={'no'} field={'no'} header={'Order ID'} body={
                      (data) => (data?.invoice_number?.split('/'))[4]
                  } />
                  <Column key={'service_name'} field={'service_name'} header={'Service'} body={
                      (data) => data?.service_name
                  } />
                  <Column key={'country'} field={'country'} header={'Country'} body={
                      (data) => data?.country
                  } />
                  <Column key={'number'} field={'number'} header={'Number'} body={
                      (data) => data?.number
                  } />
                  <Column key={'sms_text'} field={'sms_text'} header={'Message'} body={
                      (data) => data?.sms_text ?? '-'
                  } />
                  <Column key={'status'} field={'status'} header={'Status'} body={
                      (data) => ((data?.status === 'Cancel') ? <p style={{color: 'red'}}>{data?.status}</p> : <Link>{data?.status}</Link>)
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
    </>
  )
}
