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
import { filter } from 'lodash';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import Store from 'store';
import * as yup from 'yup';
import Style from '../constanta/style.json';
import Layout from '../layouts';

import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
// import Countdown from 'react-countdown'
// import parsePhoneNumber from 'libphonenumber-js'

import ModalDialog from '../components/dialog';
import { currency_format, generateSignature, number_format } from '../helpers/general';

export default function Wallet() {
  const router = useRouter()
  const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!?"'@#\$%\^&\*.,])(?=.{8,})/
  let schemaData = yup.object().shape({
      email: yup.string().email().required(),
      password: yup.string().matches(passwordRegExp, 'Min 8 Chars, Uppercase, Lowercase, Number and Special Character').required(),
  })

  const [loading, setLoading] = React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);
  const [amountTopup, setAmountTopup] = useState('')
  const [datas, setDatas] = React.useState([]);
  const [dataDetail, setDataDetail] = React.useState({});
  const [ewalletPhone, setEwalletPhone] = useState('')
  const [alertMessage, setAlertMessage] = React.useState({
    open: false,
    type: 'success',
    message: ''
  })

  const paymentMethods = [
    {id: 11, label: 'QRIS (max USD 500)'},
    {id: 1, label: 'Virtual Account Bank BCA'},
    {id: 2, label: 'Virtual Account Bank BRI'},
    {id: 3, label: 'Virtual Account Bank CIMB'},
    {id: 4, label: 'Virtual Account Bank BNI'},
    {id: 5, label: 'Virtual Account Bank MANDIRI'},
    {id: 6, label: 'Virtual Account Bank Maybank'},
    {id: 7, label: 'Virtual Account Bank Permata'},
    {id: 8, label: 'Virtual Account Bank DANAMON'},
    {id: 9, label: 'Virtual Account Bank BSI'},
    {id: 10, label: 'Virtual Account Bank BNC'},
    // {id: 12, label: 'OVO (max USD 100)'},
    {id: 13, label: 'DANA (max USD 100)'},
    {id: 14, label: 'LinkAja'},
    // {id: 15, label: 'GOPAY'},
    // {id: 16, label: 'Shopee Pay'},
  ]
  const [valuePM, setValuePM] = useState();
  const [inputValuePM, setInputValuePM] = useState('');

  const getDatas = async (afterCreate=false) => {
    const _uri = 'finance/topup/list'
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
          item.expired_date = moment(item?.created_datetime).add(1, 'hours').format('ddd, DD MMM YYYY - HH:mm')
          item.amount = currency_format(item?.amount)
          __data.push(item)
          _loop++
        })
        if (afterCreate) {
          setDataDetail(__data[0])
          setOpenModal(true)
        }
        setDatas(__data)
        setTimeout(() => {
          getDatas()
        }, 10000)
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
    const _uri = 'finance/topup/topup_balance'
    const _secret = await generateSignature(_uri)

    fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
        method: 'POST',
        headers: {
          'x-signature': _secret?.signature,
          'x-timestamp': _secret?.timestamp,
          'Authorization': CryptoJS.AES.decrypt(Store.get('token') ?? '', process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS.enc.Utf8).replace(/\"/g, ''),
        },
        body: JSON.stringify({
            "amount": amountTopup,
            "service": valuePM?.id,
            "phone_number": ewalletPhone,
        })
    })
    .then(res => res.json())
    .then(res => {
      if (res?.error_messages) {
        setAlertMessage({
          open: true,
          type: 'error',
          message: res?.error_messages
        })
        getDatas()
        setLoading(false)
        return false
      }
      if (valuePM?.id >= 12 && valuePM?.id <= 16) {
        window.open(res?.data?.checkout_url, '_blank').focus();
        getDatas()
      } else {
        getDatas(true)
      }
      setAmountTopup('')
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

                <h2>My Wallet</h2><br/>

                <div style={{maxWidth: '350px', width: '100%', display: 'inline-block'}}>
                    <div>
                        <Paper sx={{padding: '20px'}}>
                            <p>
                                <h1 style={{textAlign: 'left'}}>{filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '26'])[0]?.translated_text}</h1>
                            </p>
                            <br/>
                            <Paper sx={{padding: '20px', bgcolor: '#F3F3F9'}}>
                                <p style={{textAlign: 'left'}}>{filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '27'])[0]?.translated_text}</p>
                                <p style={{fontSize: '28px', textAlign: 'left'}}><b>{currency_format(parseFloat(CryptoJS.AES.decrypt(`${Store.get('chipper')}`, `${process.env.NEXT_PUBLIC_APP_API_KEY}`).toString(CryptoJS.enc.Utf8)))}</b></p>
                            </Paper>

                            <br/>

                            <NumericFormat
                              // {...props}
                              value={amountTopup}
                              // mask={mask}
                              customInput={TextField}
                              label={filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '28'])[0]?.translated_text}
                              placeholder="Min. USD 1"
                              variant="outlined"
                              size="small"
                              fullWidth
                              thousandSeparator={','}
                              onValueChange={(values) => setAmountTopup(values?.value)}
                              InputLabelProps={{
                                shrink: true,
                              }}
                              InputProps={{
                                  endAdornment: (
                                  <>USD</>
                                  ),
                              }}
                            />

                            <Box sx={{mt:2}}>                              
                              <Autocomplete
                                value={valuePM}
                                onChange={(event, newValuePM) => {
                                  setValuePM(newValuePM);
                                }}
                                inputValue={inputValuePM}
                                onInputChange={(event, newInputValuePM) => {
                                  setInputValuePM(newInputValuePM);
                                }}
                                id="combo-box-demo"
                                size="small"
                                options={paymentMethods}
                                renderInput={(params) => <TextField size='small' {...params} label="Payment Method" />}
                              />
                            </Box>

                            {(valuePM?.id >= 12 && valuePM?.id <= 16) && <TextField
                                label={'E-Wallet Phone Number 08xx'}
                                variant="outlined"
                                size="small"
                                fullWidth
                                style={{marginTop: '10px'}}
                                onChange={(e) => setEwalletPhone(e?.target?.value)}
                                value={ewalletPhone}
                            />}

                            <br/>*Fee $0.5 (included)
                            <br/>*Expired in 1 Hour
                            <br/><Link onClick={() => window.open('https://t.me/otpus2', '_blank').focus()}>*International Payment, Contact Us</Link><br/><br/><br/>
                            <Button variant='contained' onClick={createTopup} style={{float: 'right', marginTop: '-30px'}}>{filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '26'])[0]?.translated_text}</Button>
                        </Paper>
                    </div>
                </div>

                <br/><br/><Divider /><br/>
                
                <Box>
                    <DataTable value={datas} size={'large'} paginator rows={10} rowsPerPageOptions={[10, 25, 50, 100]} tableStyle={{ minWidth: '1rem' }}>
                        <Column key={'no'} field={'no'} header={'Topup Inv'} body={
                            (data) => ((data?.status !== 'Pending') ? <p style={{color: 'gray'}}>{(data?.invoice_number)}</p> : <Link onClick={() => {(parseInt(data?.payment_type ?? 0) >= 12 && parseInt(data?.payment_type ?? 0) <= 16) ? window.open(data?.link_url, '_blank').focus() : setDataDetail(data); (parseInt(data?.payment_type ?? 0) >= 12 && parseInt(data?.payment_type ?? 0) <= 16) ? setOpenModal(false) :  setOpenModal(true)}}>{(data?.invoice_number)}</Link>)
                        } />
                        <Column key={'updated_datetime'} field={'updated_datetime'} header={'Expired Date'} body={
                            (data) => data?.expired_date
                        } />
                        <Column key={'name'} field={'name'} header={'Method'} body={
                            (data) => filter(paymentMethods, ['id', parseInt(data?.payment_type ?? 0)])[0]?.label ?? 'By Admin'
                        } />
                        <Column key={'amount'} field={'amount'} header={'Amount'} body={
                            (data) => data?.amount
                        } />
                        <Column key={'status'} field={'status'} header={'Status'} body={
                            (data) => ((data?.status === 'Expired') ? <p style={{color: 'red'}}>{data?.status}</p> : <Link onClick={() => {(parseInt(data?.payment_type ?? 0) >= 12 && parseInt(data?.payment_type ?? 0) <= 16) ? window.open(data?.link_url, '_blank').focus() : setDataDetail(data); (parseInt(data?.payment_type ?? 0) >= 12 && parseInt(data?.payment_type ?? 0) <= 16) ? setOpenModal(false) :  setOpenModal(true)}}>{data?.status}</Link>)
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

      <ModalDialog titleModal="Payment Detail" openModal={openModal} setOpenModal={setOpenModal}>
          <Box style={{width: 550}}>
            {((parseInt(dataDetail?.payment_type) >= 1 && parseInt(dataDetail?.payment_type) <= 11) || parseInt(dataDetail?.payment_type) == 17) && <>
              <p>Payment Amount : IDR {number_format(dataDetail?.payment_amount)} *(Included fee)</p>
              <p>Expired Time : {dataDetail?.expired_date}</p>
              <p>Payment Method : {filter(paymentMethods, ['id', parseInt(dataDetail?.payment_type ?? 0)])[0]?.label}</p>
              {(parseInt(dataDetail?.payment_type) == 17 || parseInt(dataDetail?.payment_type) == 11) ? <>
                <img src={dataDetail?.payment_image} />
              </> : <>
                <p>Payment Number : <b>{dataDetail?.payment_number}</b></p>
              </>}
            </>}
          </Box>
      </ModalDialog>
    </>
  )
}
