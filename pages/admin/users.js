import {
  Alert,
  Autocomplete,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Snackbar,
  TextField
} from '@mui/material';
import CryptoJS from "crypto-js";
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Store from 'store';
import * as yup from 'yup';
import Style from '../../constanta/style.json';
import Layout from '../../layouts';

import {
  Visibility, VisibilityOff
} from '@mui/icons-material';

import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
// import Countdown from 'react-countdown'
// import parsePhoneNumber from 'libphonenumber-js'
import { size, values as vals } from 'lodash';

import ModalDialog from '../../components/dialog';
import { generateSignature } from '../../helpers/general';
import { handleChangeEl } from '../../hooks/general';

export default function Users() {
  const router = useRouter()
  const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!?"'@#\$%\^&\*.,])(?=.{8,})/
  let schemaData = yup.object().shape({
      password: yup.string().matches(passwordRegExp, 'Min 8 Chars, Uppercase, Lowercase, Number and Special Character').required(),
  })

  const [loading, setLoading] = React.useState(false);
  const [openModal, setOpenModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorsField, setErrorsField] = useState()
  const [totalDeposit, setTotalDeposit] = useState(0)
  const [amountDeposit, setAmountDeposit] = useState('')
  const [level, setLevel] = useState('0')
  const [users, setUsers] = useState([])
  const [userSelected, setUserSelected] = useState()
  const [discount, setDiscount] = useState('0%')
  const [datas, setDatas] = React.useState([]);
  const [values, setValues] = useState({
    password: '',
  })
  const [alertMessage, setAlertMessage] = React.useState({
    open: false,
    type: 'success',
    message: ''
  })

  const getDatas = async () => {
    const _uri = 'admin/users/list'
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
        
        const __data2 = []
        let _loop2 = 1
        res?.data?.map(item => {
          __data2.push({no:_loop2, id: item?.id_user, label: item?.username + ' | ' + item?.email })
          _loop2++
        })
        setUsers(__data2)
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

  const changePassword = async () => {
    setOpenModal(false)
    // console.log('userSelected', userSelected)
    // return false
    if (vals(errorsField)?.length > 0) {
      setAlertMessage({
        open: true,
        type: 'error',
        message: (vals(errorsField)[0] == 'Error') ? 'Fill all required fields!' : vals(errorsField)[0]
      })
      setLoading(false)
      return false
    }
    setLoading(true)
    const _uri = 'admin/users/change_password'
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
            "password": values?.password,
        })
    })
    .then(res => res.json())
    .then(res => {
      setAlertMessage({
        open: true,
        type: (res?.code == 1) ? 'error' : 'success',
        message: res?.message
      })
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

                <h2>All Users</h2><br/>

                <div style={{maxWidth: '350px', width: '100%', display: 'inline-block'}}>
                    <div>
                        <Paper sx={{padding: '20px'}}>
                          <Autocomplete
                            disablePortal
                            id="combo-box-demo"
                            variant="outlined"
                            size="small"
                            autoComplete='new-password'
                            options={users}
                            sx={{mb: 2}}
                            value={userSelected}
                            onChange={(event, newValue) => {
                              setUserSelected(newValue);
                            }}
                            renderInput={(params) => <TextField autoComplete='new-password' {...params} label="Select User" />}
                          />
                          
                          <Box sx={{width: '100%', mt: '2vh'}}>
                            <TextField fullWidth id="standard-basic" label="Change User's Password" variant="standard"
                            onChange={(e) => handleChangeEl('password', e, values, setValues, schemaData, setErrorsField)}
                            value={values?.password}
                            error={errorsField?.password} helperText={errorsField?.password}
                            type={showPassword ? 'text' : 'password'}
                            autoComplete='new-password'
                            InputProps={{
                              autocomplete: 'new-password',
                              form: {
                                autocomplete: 'off',
                              },
                              endAdornment:
                                <InputAdornment position='end'>
                                  <IconButton
                                    edge='end'
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label='toggle password visibility'
                                  >
                                    {!showPassword ? <Visibility /> : <VisibilityOff />}
                                  </IconButton>
                                </InputAdornment>
                            }} />
                          </Box>

                          <br/><br/><br/>

                          <Button variant='contained' disabled={!size(values?.password) || (vals(errorsField)?.length > 0) || !userSelected?.id} onClick={() => setOpenModal(true)} style={{float: 'right', marginTop: '-30px'}}>Change Password</Button>
                        </Paper>
                    </div>
                </div>

                <br/><br/><Divider /><br/>
                
                <Box>
                    <DataTable value={datas} size={'large'} paginator rows={100} rowsPerPageOptions={[100, 200, 500, 1000]} tableStyle={{ minWidth: '1rem' }}>
                        <Column key={'username'} field={'username'} header={'Name'} body={
                            (data) => data?.username
                        } />
                        <Column key={'no'} field={'no'} header={'Email'} body={
                            (data) => (data?.email)
                        } />
                        <Column key={'created_date'} field={'created_date'} header={'Regist Date'} body={
                            (data) => moment(data?.created_date).format('ddd, DD MMM YYYY - HH:mm')
                        } />
                        <Column key={'last_ip_address'} field={'last_ip_address'} header={'Last IP'} body={
                            (data) => data?.last_ip_address
                        } />
                        <Column key={'telp'} field={'telp'} header={'Telp'} body={
                            (data) => data?.telp_country_code + data?.telp
                        } />
                        <Column key={'user_status'} field={'user_status'} header={'Status'} body={
                            (data) => ((data?.user_status === 'Banned') ? <p style={{color: 'red'}}>{data?.user_status}</p> : <Link>{data?.user_status}</Link>)
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

      <ModalDialog titleModal="Logout Confirmation" openModal={openModal} setOpenModal={setOpenModal} handleSubmitFunction={changePassword}>
          <Box style={{width: 550}}>
              Are you sure want to Update Password for User {userSelected?.label} ?
          </Box>
      </ModalDialog>
    </>
  )
}
