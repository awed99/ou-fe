import {
  Alert,
  Autocomplete,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Link,
  Paper,
  Snackbar,
  TextField
} from '@mui/material';
import CryptoJS from "crypto-js";
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
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
import { currency_format, generateSignature, number_format } from '../../helpers/general';

export default function Deposit() {
  const router = useRouter()
  const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!?"'@#\$%\^&\*.,])(?=.{8,})/
  let schemaData = yup.object().shape({
      email: yup.string().email().required(),
      password: yup.string().matches(passwordRegExp, 'Min 8 Chars, Uppercase, Lowercase, Number and Special Character').required(),
  })

  const [loading, setLoading] = React.useState(false);
  const [openModal, setOpenModal] = useState(false)
  const [amountTopup, setAmountTopup] = useState('')
  const [totalDeposit, setTotalDeposit] = useState(0)
  const [amountDeposit, setAmountDeposit] = useState('')
  const [level, setLevel] = useState('0')
  const [users, setUsers] = useState([])
  const [userSelected, setUserSelected] = useState()
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
    const _uri = 'admin/topup/list_all'
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
        
        const __data2 = []
        let _loop2 = 1
        res?.users?.map(item => {
          __data2.push({no:_loop2, id: item?.id_user, label: item?.username + ' | ' + item?.email })
          _loop2++
        })
        setUsers(__data2)

        setTotalDeposit(res?.total_deposit)
        setLevel(res?.level)
        setDiscount(res?.discount)
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

  const topup = async () => {
    setOpenModal(false)
    // console.log('userSelected', userSelected)
    // return false
    if (amountDeposit?.length < 1) {
        setAlertMessage({
          open: true,
          type: 'error',
          message: 'Please fill the amount min. USD 1'
        })
        return false
    }
    if ((!parseInt(amountDeposit)) || parseInt(amountDeposit) < 1) {
        setAlertMessage({
          open: true,
          type: 'error',
          message: 'Please fill the amount min. USD 1'
        })
        return false
    }
    setLoading(true)
    const _uri = 'admin/topup/topup_balance'
    const _secret = await generateSignature(_uri)

    fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
        method: 'POST',
        headers: {
          'x-signature': _secret?.signature,
          'x-timestamp': _secret?.timestamp,
          'Authorization': CryptoJS.AES.decrypt(Store.get('token_admin') ?? '', process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS.enc.Utf8).replace(/\"/g, ''),
        },
        body: JSON.stringify({
            "id_user": userSelected?.id,
            "amount": amountDeposit,
        })
    })
    .then(res => res.json())
    .then(res => {
      setAlertMessage({
        open: true,
        type: (res?.code == 1) ? 'error' : 'success',
        message: res?.message
      })
      
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

                <h2>All Member's Deposits</h2><br/>

                <div style={{maxWidth: '350px', width: '100%', display: 'inline-block'}}>
                    <div>
                        <Paper sx={{padding: '20px'}}>
                          <Autocomplete
                            disablePortal
                            id="combo-box-demo"
                            variant="outlined"
                            size="small"
                            options={users}
                            sx={{mb: 2}}
                            value={userSelected}
                            onChange={(event, newValue) => {
                              setUserSelected(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} label="Select User" />}
                          />

                          <NumericFormat
                            // {...props}
                            value={amountDeposit}
                            // mask={mask}
                            customInput={TextField}
                            prefix={'USD '}
                            label="Deposit Amount USD *(Included Fee)"
                            placeholder="Min. 1"
                            variant="outlined"
                            size="small"
                            fullWidth
                            thousandSeparator={','}
                            onValueChange={(values) => setAmountDeposit(values?.value)}
                          />

                          <br/><br/><br/>

                          <Button variant='contained' onClick={() => setOpenModal(true)} style={{float: 'right', marginTop: '-30px'}}>Deposit User</Button>
                        </Paper>
                    </div>
                </div>

                <br/><br/><Divider /><br/>
                
                <Box>
                    <DataTable value={datas} size={'large'} paginator rows={100} rowsPerPageOptions={[100, 200, 500, 1000]} tableStyle={{ minWidth: '1rem' }}>
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

      <ModalDialog titleModal="Logout Confirmation" openModal={openModal} setOpenModal={setOpenModal} handleSubmitFunction={topup}>
          <Box style={{width: 550}}>
              Are you sure want to Topup User :
              <h5>{userSelected?.label}</h5>
              <h3>USD {number_format(amountDeposit)}  ?</h3>
          </Box>
      </ModalDialog>
    </>
  )
}
