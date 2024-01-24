import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Snackbar,
  TextField
} from '@mui/material';
import CryptoJS from "crypto-js";
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
// import NumberFormat from 'react-number-format';
import { NumericFormat } from 'react-number-format';
import Store from 'store';
import * as yup from 'yup';
import Style from '../../constanta/style.json';
import Layout from '../../layouts';

import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
// import Countdown from 'react-countdown'
// import parsePhoneNumber from 'libphonenumber-js'

import ModalDialog from '../../components/dialog';
import { generateSignature, number_format } from '../../helpers/general';

export default function Deposit() {
  const router = useRouter()
  const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!?"'@#\$%\^&\*.,])(?=.{8,})/
  let schemaData = yup.object().shape({
      email: yup.string().email().required(),
      password: yup.string().matches(passwordRegExp, 'Min 8 Chars, Uppercase, Lowercase, Number and Special Character').required(),
  })

  const [loading, setLoading] = React.useState(false);
  const [openModal, setOpenModal] = useState(false)
  const [amountWithdraw, setAmountWithdraw] = useState('')
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
    const _uri = 'admin/journal/list'
    const _secret = await generateSignature(_uri)

    fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
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
        setLoading(false)
    }).catch(() => setLoading(false))
  }
  
  useEffect(() => {
    if (Store.get('token_admin')) {
      getDatas()
    } else {
      window.location = '/admin'
      router.push('/admin')
      return false
    }
  }, [])

  const withdraw = async () => {
    setOpenModal(false)
    if (amountWithdraw?.length < 1) {
        setAlertMessage({
          open: true,
          type: 'error',
          message: 'Please fill the amount min. Rp 10,000'
        })
        return false
    }
    if ((!parseInt(amountWithdraw)) || parseInt(amountWithdraw) < 10000) {
        setAlertMessage({
          open: true,
          type: 'error',
          message: 'Please fill the amount min. Rp 10,000'
        })
        return false
    }
    setLoading(true)
    const _uri = 'admin/journal/add'
    const _secret = await generateSignature(_uri)

    fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
        method: 'POST',
        headers: {
          'x-signature': _secret?.signature,
          'x-timestamp': _secret?.timestamp,
          'Authorization': CryptoJS.AES.decrypt(Store.get('token_admin') ?? '', process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS.enc.Utf8).replace(/\"/g, ''),
        },
        body: JSON.stringify({
            "amount": amountWithdraw
        })
    })
    .then(res => res.json())
    .then(res => {
      setAlertMessage({
        open: true,
        type: (res?.code == 1) ? 'error' : 'success',
        message: res?.message
      })
      setAmountWithdraw('')
      setDatas(res?.data)
      setLoading(false)
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

                <h2>Journal Finance</h2><br/>

                <div style={{maxWidth: '350px', width: '100%', display: 'inline-block'}}>
                    <div>
                        <Paper sx={{padding: '20px'}}>
                          <NumericFormat
                            // {...props}
                            value={amountWithdraw}
                            // mask={mask}
                            customInput={TextField}
                            prefix={'Rp '}
                            label="Withdraw Amount"
                            placeholder="Min. Rp 10,000"
                            variant="outlined"
                            size="small"
                            fullWidth
                            thousandSeparator={','}
                            onValueChange={(values) => setAmountWithdraw(values?.value)}
                          />

                          <br/><br/><br/>

                          <Button variant='contained' onClick={() => setOpenModal(true)} style={{float: 'right', marginTop: '-30px'}}>Withdraw</Button>
                        </Paper>
                    </div>
                </div>

                <br/><br/><Divider /><br/>
                
                <Box>
                    <DataTable value={datas} size={'large'} paginator rows={100} rowsPerPageOptions={[100, 200, 500, 1000]} tableStyle={{ minWidth: '1rem' }}>
                        {/* <Column key={'no'} field={'no'} header={'Email'} body={
                            (data) => (data?.email)
                        } /> */}
                        <Column key={'username'} field={'username'} header={'User Name'} body={
                            (data) => data?.username
                        } />
                        <Column key={'created_datetime'} field={'created_datetime'} header={'Date'} body={
                            (data) => moment(data?.created_at).format('ddd, DD MMM YYYY - HH:mm')
                        } />
                        <Column key={'amount_credit'} field={'amount_credit'} header={'Credit IDR'} body={
                            (data) => number_format(data?.amount_credit)
                        } />
                        <Column key={'amount_debet'} field={'amount_debet'} header={'Debet IDR'} body={
                            (data) => number_format(data?.amount_debet)
                        } />
                        <Column key={'amount_credit_usd'} field={'amount_credit_usd'} header={'Credit USD'} body={
                            (data) => number_format(parseFloat(data?.amount_credit_usd).toFixed(2))
                        } />
                        <Column key={'amount_debet_usd'} field={'amount_debet_usd'} header={'Debet USD'} body={
                            (data) => number_format(parseFloat(data?.amount_debet_usd).toFixed(2))
                        } />
                        <Column key={'description'} field={'description'} header={'Description'} body={
                            (data) => (data?.description)
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

      <ModalDialog titleModal="Logout Confirmation" openModal={openModal} setOpenModal={setOpenModal} handleSubmitFunction={withdraw}>
          <Box style={{width: 550}}>
              Are you sure want to Withdraw Rp {number_format(amountWithdraw)} ?
          </Box>
      </ModalDialog>
    </>
  )
}
