import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Link,
  Paper,
  Snackbar
} from '@mui/material';
import CryptoJS from "crypto-js";
import { filter } from 'lodash';
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

import { currency_format, generateSignature } from '../helpers/general';

export default function Deposit() {
  const router = useRouter()
  const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!?"'@#\$%\^&\*.,])(?=.{8,})/
  let schemaData = yup.object().shape({
      email: yup.string().email().required(),
      password: yup.string().matches(passwordRegExp, 'Min 8 Chars, Uppercase, Lowercase, Number and Special Character').required(),
  })

  const [loading, setLoading] = React.useState(false);
  const [amountTopup, setAmountTopup] = useState('')
  const [totalDeposit, setTotalDeposit] = useState(0)
  const [level, setLevel] = useState('0')
  const [discount, setDiscount] = useState('0%')
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
    const _uri = 'finance/topup/list_all'
    const _secret = await generateSignature(_uri)

    fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
        method: 'POST',
        headers: {
          'x-signature': _secret?.signature,
          'x-timestamp': _secret?.timestamp,
          'Authorization': CryptoJS.AES.decrypt(Store.get('token') ?? '', process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS.enc.Utf8).replace(/\"/g, ''),
        },
    })
    .then(res => res.json())
    .then(res => {
        const _data = res?.data
        const __data = []
        let _loop = 1
        _data?.map(item => {
          item.no = _loop
          item.date = moment(item?.created_datetime).format('ddd, DD MMM YYYY - HH:mm')
          item.expired_date = moment(item?.expired_date).format('ddd, DD MMM YYYY - HH:mm')
          item.amount = currency_format(item?.amount)
          __data.push(item)
          _loop++
        })
        setDatas(__data)
        setTotalDeposit(res?.total_deposit)
        setLevel(res?.level)
        setDiscount(res?.discount)
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
  }, [])

  const createTopup = async () => {
    if (amountTopup?.length < 1) {
        alert('Please fill the amount.')
        return false
    }
    if ((!parseInt(amountTopup)) || parseInt(amountTopup) < 1) {
        alert('Please fill the amount min. $1')
        return false
    }
    setLoading(true)
    const _uri = 'finance/topup/topup_general'
    const _secret = await generateSignature(_uri)

    fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
        method: 'POST',
        headers: {
          'x-signature': _secret?.signature,
          'x-timestamp': _secret?.timestamp,
          'Authorization': CryptoJS.AES.decrypt(Store.get('token') ?? '', process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS.enc.Utf8).replace(/\"/g, ''),
        },
        body: JSON.stringify({
            "amount": amountTopup
        })
    })
    .then(res => res.json())
    .then(res => {
        const redirectURL = res?.content?.redirect
        window.open(redirectURL, '_blank').focus();
        setAmountTopup('')
        getDatas()
        setLoading(false)
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

                <h2>All Member's Deposits</h2><br/>

                <div style={{maxWidth: '350px', width: '100%', display: 'inline-block'}}>
                    <div>
                        <Paper sx={{padding: '20px'}}>
                            <p>
                                <h1 style={{textAlign: 'left'}}>Total {filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '26'])[0]?.translated_text}</h1>
                            </p>
                            <br/>
                            <Paper sx={{padding: '20px', bgcolor: '#F3F3F9'}}>
                                {/* <p style={{textAlign: 'left'}}>{filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '27'])[0]?.translated_text}</p> */}
                                <p style={{fontSize: '28px', textAlign: 'left'}}><b>{currency_format(totalDeposit)}</b></p>
                            </Paper>
                            <br/>
                            <Paper sx={{padding: '20px', bgcolor: '#F3F3F9'}}>
                                {/* <p style={{textAlign: 'left'}}>{filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '27'])[0]?.translated_text}</p> */}
                                <p style={{fontSize: '28px', textAlign: 'left'}}><b>
                                  Level: {level} 
                                </b></p>
                                <p style={{fontSize: '28px', textAlign: 'left'}}><b>
                                  Disc: {discount}  
                                </b></p>
                            </Paper>

                            <br/><br/>

                            <Button variant='contained' onClick={() => window.location = '/wallet'} style={{float: 'right', marginTop: '-30px'}}>{filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '26'])[0]?.translated_text}</Button>
                        </Paper>
                    </div>
                </div>

                <br/><br/><Divider /><br/>
                
                <Box>
                    <DataTable value={datas} size={'large'} paginator rows={10} rowsPerPageOptions={[10, 25, 50, 100]} tableStyle={{ minWidth: '1rem' }}>
                        <Column key={'no'} field={'no'} header={'Email'} body={
                            (data) => (data?.email)
                        } />
                        <Column key={'username'} field={'username'} header={'Name'} body={
                            (data) => data?.username
                        } />
                        <Column key={'updated_datetime'} field={'updated_datetime'} header={'Date'} body={
                            (data) => data?.date
                        } />
                        <Column key={'name'} field={'name'} header={'Method'} body={
                            (data) => data?.name
                        } />
                        <Column key={'amount'} field={'amount'} header={'Amount'} body={
                            (data) => data?.amount
                        } />
                        <Column key={'status'} field={'status'} header={'Status'} body={
                            (data) => ((data?.status === 'Expired') ? <p style={{color: 'red'}}>{data?.status}</p> : <Link>{data?.status}</Link>)
                        } />
                    </DataTable>
                </Box>
                
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
