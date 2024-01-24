import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Alert,
  Backdrop,
  Box,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Snackbar,
  TextField
} from '@mui/material';
import CryptoJS from "crypto-js";
import { values as vals } from 'lodash';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ReCAPTCHA from "react-google-recaptcha";
import Store from 'store';
import * as yup from 'yup';
import Style from '../../constanta/style.json';
import Language from '../../languages';
import Layout from '../../layouts';
import styles from '../../styles/Auth.module.css';

import Button from '../../components/button';
import { handleSubmitLogin } from '../../hooks/auth';
import { handleChangeEl } from '../../hooks/general';

export default function Login() {
  const router = useRouter()
  const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!?"'@#\$%\^&\*.,])(?=.{8,})/
  let schemaData = yup.object().shape({
      email: yup.string().email().required(),
      password: yup.string().matches(passwordRegExp, 'Min 8 Chars, Uppercase, Lowercase, Number and Special Character').required(),
  })

  const [showPassword, setShowPassword] = useState(false)
  const [errorsField, setErrorsField] = useState()
  const [captcha, setCaptcha] = useState('')
  const [captchaRisk, setCaptchaRisk] = useState(0)
  const [values, setValues] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [alertMessage, setAlertMessage] = useState({
    open: false,
    type: 'success',
    message: ''
  })
  
  const handleSubmit = async (e) => {
    setLoading(true)
    if (vals(errorsField)?.length > 0) {
      setAlertMessage({
        open: true,
        type: 'error',
        message: (vals(errorsField)[0] == 'Error') ? 'Fill all required fields!' : vals(errorsField)[0]
      })
      setLoading(false)
      return false
    }
    if (!captcha) {
      setAlertMessage({
        open: true,
        type: 'error',
        message: 'Captcha is required!'
      })
      setLoading(false)
      return false
    } else {
        if (captchaRisk < 0.5) {
          setAlertMessage({
            open: true,
            type: 'error',
            message: 'High risk action detected!'
          })
          setLoading(false)
          return false
        } else {
          
          const res = await handleSubmitLogin(e, schemaData, values)

          // console.log('res?.data: ', res?.data)
          // console.log('res?.data?.token: ', res?.data?.token)
          
          // console.log('res: ', res)
          // router.push('')

          setAlertMessage({
            open: true,
            type: (res?.code > 0) ? 'error' : 'success',
            message: (res?.code > 0) ? res?.error :  res?.message
          })
          setLoading(false)

          if (res?.code < 1) {
            Store.set('user', CryptoJS.AES.encrypt(`${JSON.stringify(res?.data)}`, `${process.env.NEXT_PUBLIC_APP_API_KEY}`).toString())
            Store.set('token', CryptoJS.AES.encrypt(`${JSON.stringify(res?.data?.token_login)}`, `${process.env.NEXT_PUBLIC_APP_API_KEY}`).toString())
            setTimeout(() => window.location = ('/'), 2500)
          }

          return false
          
        }
      
    }
  }

  useEffect(() => {
    fetch(`https://recaptchaenterprise.googleapis.com/v1/projects/telp-304809/assessments?key=${process.env.NEXT_PUBLIC_GOOGLE_CAPTCHA_API_KEY}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "event": {
            "token": captcha,
            "expectedAction": "USER_ACTION",
            "siteKey": process.env.NEXT_PUBLIC_GOOGLE_CAPTCHA_SITE_KEY,
          }
        })
    })
    .then(res => res.json())
    .then(async (res) => {
      setCaptchaRisk(res?.riskAnalysis?.score)
    })
  }, [captcha])

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
                  <Box sx={{p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%'}}>
                    <img src='/icon.png' width={50} />
                    <Box sx={{width: '100%', mt: '3vh'}}>
                      <TextField fullWidth id="standard-basic" label={Language('general')?.email} variant="standard"
                      onChange={(e) => handleChangeEl('email', e, values, setValues, schemaData, setErrorsField)}
                      value={values?.email}
                      error={errorsField?.email} helperText={errorsField?.email} />
                    </Box>
                    <Box sx={{width: '100%', mt: '2vh'}}>
                      <TextField fullWidth id="standard-basic" label={Language('general')?.password} variant="standard"
                      onChange={(e) => handleChangeEl('password', e, values, setValues, schemaData, setErrorsField)}
                      value={values?.password}
                      error={errorsField?.password} helperText={errorsField?.password}
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
                      }} />
                    </Box>
                    <Box sx={{width: '100%', mt: '2vh'}}>
                      <Link className='pointer' onClick={() => router.push('/auth/reset-password')} sx={{float: 'right'}}>{Language('general')?.forgot_password}</Link>
                    </Box>
                    <Box sx={{width: '100%', mt: '2vh'}}>
                      <ReCAPTCHA
                        sitekey={process.env.NEXT_PUBLIC_GOOGLE_CAPTCHA_SITE_KEY}
                        onChange={e => setCaptcha(e)}
                      />
                    </Box>
                    <Box sx={{width: '100%', mt: '2vh'}}>
                      <FormGroup>
                        <FormControlLabel control={<Checkbox defaultChecked />} className={styles?.textKeepMeLoggedIn} label={Language('general')?.keep_logged_in} />
                      </FormGroup>
                    </Box>
                    <Box sx={{width: '100%', mt: '2vh'}}>
                      <Button props={{
                        disabled: !captcha,
                        fullWidth: true,
                        variant: 'contained',
                        onClick: (e) => handleSubmit(e)
                      }}>{Language('general')?.login}</Button>
                    </Box>
                    <Box sx={{width: '100%', mt: '2vh'}}>
                      <Divider> {Language('general')?.or} </Divider>
                    </Box>
                    <Box sx={{width: '100%', mt: '2vh'}}>
                      <Button
                      props={{
                        fullWidth: true,
                        variant: 'outlined',
                        onClick: () => router.push('/auth/register')
                      }}>{Language('general')?.signup}</Button>
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
                  lg: 2,
                  xl: 3,
                }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%'}}>
                <img src='/images/auth/icon1.png' width='60%' />
                <p className={styles?.textIcon1a}>OTP-US LOGIN</p>
                <p className={styles?.textIcon1b}>Stay connected to us, to get new beneficial experience.</p>
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
