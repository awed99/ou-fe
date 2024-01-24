import { Visibility, VisibilityOff } from '@mui/icons-material'
import {
  Alert,
  Backdrop,
  Box,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Snackbar,
  TextField,
  Typography
} from '@mui/material'
import { size, values as vals } from 'lodash'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import * as yup from 'yup'
import Style from '../../constanta/style.json'
import Language from '../../languages'
import Layout from '../../layouts'
import styles from '../../styles/Auth.module.css'

import Button from '../../components/button'
import { generateSignature } from '../../helpers/general'
import { handleSubmitNewPassword } from '../../hooks/auth'
import { handleChangeEl } from '../../hooks/general'

export default function NewPassword() {
  const router = useRouter()
  const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!?"'@#\$%\^&\*.,])(?=.{8,})/
  let schemaData = yup.object().shape({
    password: yup.string().matches(passwordRegExp, 'Min 8 Chars, Uppercase, Lowercase, Number and Special Character').required(),
    confirm_password: yup.string().oneOf([yup.ref('password'), null], 'Passwords doesn\'t match')
  })

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)
  const [countDownTime, setCountDownTime] = useState(true)
  const [captcha, setCaptcha] = useState('')
  const [errorsField, setErrorsField] = useState()
  const [values, setValues] = useState({
    password: '',
    confirm_password: '',
  })
  const [alertMessage, setAlertMessage] = useState({
    open: false,
    type: 'success',
    message: ''
  })
  
  const handleSubmit = async (e) => {
    if (size(values?.password) < 5) {
      setAlertMessage({
        open: true,
        type: 'error',
        message: 'New Password is required!'
      })
      return false
    }
    if (vals(errorsField)?.length > 0) {
      setAlertMessage({
        open: true,
        type: 'error',
        message: (vals(errorsField)[0] == 'Error') ? 'Fill all required fields!' : vals(errorsField)[0]
      })
      return false
    }
    
    setLoading(true)
    const res = await handleSubmitNewPassword(e, schemaData, values, router.query?.token ?? '')
    setIsDisabled(true)

    setLoading(false)
    // console?.log('res: ', res)
    if (res?.code < 1) {
      setTimeout(() => router.push('/auth'), 2500)
    }

    setAlertMessage({
      open: true,
      type: (res?.code > 0) ? 'error' : 'success',
      message: (res?.code > 0) ? res?.error :  res?.message
    })

    return false
  }

  const countDown = (_i) => {
    setCountDownTime(_i)
    if (_i < 1) {
        router.push('/auth')
    } else {
        setTimeout(() => countDown(_i - 1), 1000)
    }
  }

  const checkValidToken = async () => {
    const _uri = 'users/check_valid_token'
    const _secret = await generateSignature(_uri)
    const resX = await fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
        method: 'POST',
        headers: {
          'x-signature': _secret?.signature,
          'x-timestamp': _secret?.timestamp,
          'Authorization': router.query?.token ?? '',
        },
        // body: JSON.stringify(values),
        // body: dataX,
    })
    .then(async (res) => await res.json())
    .then(async (res) => {
      setAlertMessage({
        open: true,
        type: (res?.code > 0) ? 'error' : 'success',
        message: (res?.code > 0) ? res?.message :  res?.message
      })      
      if (res?.code > 0) {
        setTimeout(() => router.push('/auth'), 2500)
      }
    })
  }

  useEffect(() => {
    if (router.query?.token) {
      checkValidToken()
    }
  }, [router.query?.token])

  useEffect(() => {
    if (isDisabled) {
        countDown(10)
    }
  }, [isDisabled])

  return (
    <>
      <Layout type="auth">
        <Box sx={{ background: 'none', flexGrow: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Grid container>
            <Grid xs={12} md={6} xl={6} lg={6} 
              sx={{
                p: {
                  xs: 0,
                  md: 1,
                  lg: 2,
                  xl: 3,
                },
              // display: 'flex', 
              background: Style?.color?.white,
              borderRadius: {
                xs: 2,
                md: 0,
                lg: 0,
                xl: 0,
              }, 
              borderTopLeftRadius: {
                xs: 7,
                md: 7,
                lg: 7,
                xl: 7,
              }, 
              borderBottomLeftRadius: {
                xs: 7,
                md: 7,
                lg: 7,
                xl: 7,
              }
              }}>
                <form style={{width: '100%'}}>
                  <Box sx={{p: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%'}}>
                    <img src='/icon.png' width={50} />
                    <Typography sx={{fontSize: {
                        xs: 18,
                        md: 20,
                        lg: 22,
                        xl: 24,
                        }, mt: 4, textAlign: 'center'}}><b>{Language('general')?.create_new_password}</b></Typography>
                    <Box sx={{width: '100%', mt: '5vh'}}>
                        <TextField fullWidth id="standard-basic" label={Language('general')?.new_password} variant="standard"
                        onChange={(e) => handleChangeEl('password', e, values, setValues, schemaData, setErrorsField)}
                        disabled={isDisabled}
                        value={values?.password}
                        error={errorsField?.password} helperText={errorsField?.password?.replace(/\_/g, ' ')}
                        type={showPassword ? 'text' : 'password'}
                        InputProps={{
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
                        }}
                        />
                    </Box>
                    <Box sx={{width: '100%', mt: '2vh'}}>
                      <TextField fullWidth id="standard-basic" label={Language('general')?.confirm_new_password} type='password' variant="standard"
                      onChange={(e) => handleChangeEl('confirm_password', e, values, setValues, schemaData, setErrorsField)}
                      disabled={isDisabled}
                      value={values?.confirm_password}
                      error={errorsField?.confirm_password} helperText={errorsField?.confirm_password} />
                    </Box>
                    <Box sx={{width: '100%', mt: '7vh'}}>
                      <Button props={{
                        disabled: isDisabled,
                        fullWidth: true,
                        variant: 'contained',
                        onClick: (e) => handleSubmit(e)
                      }}>{(isDisabled) ? countDownTime + Language('general')?.go_to_login : Language('general')?.change_password}</Button>
                    </Box>
                  </Box>
                </form>
            </Grid>
            <Grid xs={6} 
              sx={{
              display: { lg: 'flex', md: 'flex', sm: 'none', xs: 'none' }, 
              background: Style?.color?.primary, 
              borderTopRightRadius: 7, 
              borderBottomRightRadius: 7,}}>
              <Box sx={{p: {
                  xs: 0,
                  md: 1,
                  lg: 5,
                  xl: 5,
                }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%'}}>
                <img src='/images/auth/icon1.png' width='60%' />
                <p className={styles?.textIcon1a}>OTP-US New Password</p>
                <p className={styles?.textIcon1b}>Stay safe with us, to get new beneficial experience.</p>
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
