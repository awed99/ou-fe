import { Visibility, VisibilityOff } from '@mui/icons-material'
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
  Snackbar,
  TextField
} from '@mui/material'
import { values as vals } from 'lodash'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import ReCAPTCHA from "react-google-recaptcha"
import * as yup from 'yup'
import Style from '../../constanta/style.json'
import Language from '../../languages'
import Layout from '../../layouts'
import styles from '../../styles/Auth.module.css'

import Button from '../../components/button'
import { handleSubmitRegister } from '../../hooks/auth'
import { handleChangeEl } from '../../hooks/general'

export default function Register() {
  const router = useRouter()
  const phoneRegExp = /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3,4}\)?)\s?-?\s?(\(?\d{3,5}\)?)?$/
  const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!?"'@#\$%\^&\*.,])(?=.{8,})/
  
  let schemaData = yup.object().shape({
    first_name: yup.string().required(),
    last_name: yup.string(),
    email: yup.string().email().required(),
    phone_number: yup.string().matches(phoneRegExp, 'Phone number is not valid').required(),
    password: yup.string().matches(passwordRegExp, 'Min 8 Chars, Uppercase, Lowercase, Number and Special Character').required(),
    confirm_password: yup.string().oneOf([yup.ref('password'), null], 'Passwords doesn\'t match')
  })

  const [showPassword, setShowPassword] = useState(false)
  const [captcha, setCaptcha] = useState('')
  const [captchaRisk, setCaptchaRisk] = useState(0)
  const [errorsField, setErrorsField] = useState()
  const [values, setValues] = useState({
    first_name: '',
    last_name: '',
    phone_number: '+62',
    email: '',
    password: '',
    confirm_password: '',
  })
  const [loading, setLoading] = useState(false)
  const [alertMessage, setAlertMessage] = useState({
    open: false,
    type: 'success',
    message: ''
  })
  
  const handleSubmit = async (e) => {
    if (vals(errorsField)?.length > 0) {
      setAlertMessage({
        open: true,
        type: 'error',
        message: (vals(errorsField)[0] == 'Error') ? 'Fill all required fields!' : vals(errorsField)[0]
      })
      return false
    }
    if (!captcha) {
      setAlertMessage({
        open: true,
        type: 'error',
        message: 'Captcha is required!'
      })
      return false
    } else {
        if (captchaRisk < 0.5) {
          setAlertMessage({
            open: true,
            type: 'error',
            message: 'High risk action detected!'
          })
          return false
        } else {
          
          setLoading(true)
          const res = await handleSubmitRegister(e, schemaData, values)

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
      
    }

  }

  // useEffect(() => {
  //   console.log('values: ', values)
  // }, [values])

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

                    <Grid container sx={{mt: 2}}>
                      
                      <Grid sx={{p:1}} xs={12} md={12} xl={6} lg={6}>
                        <TextField fullWidth id="standard-basic" label={Language('general')?.first_name} variant="standard"
                        onChange={(e) => handleChangeEl('first_name', e, values, setValues, schemaData, setErrorsField)}
                        value={values?.first_name}
                        error={errorsField?.first_name} helperText={errorsField?.first_name?.replace(/\_/g, ' ')} />
                      </Grid>

                      <Grid sx={{p:1}} xs={12} md={12} xl={6} lg={6}>
                        <TextField fullWidth id="standard-basic" label={Language('general')?.last_name} variant="standard"
                        onChange={(e) => handleChangeEl('last_name', e, values, setValues, schemaData, setErrorsField)}
                        value={values?.last_name}
                        error={errorsField?.last_name} helperText={errorsField?.last_name?.replace(/\_/g, ' ')} />
                      </Grid>

                      <Grid sx={{p:1}} xs={12} md={12} xl={12} lg={12}>
                        <TextField fullWidth id="standard-basic" label={Language('general')?.email} variant="standard"
                        onChange={(e) => handleChangeEl('email', e, values, setValues, schemaData, setErrorsField)}
                        value={values?.email}
                        error={errorsField?.email} helperText={errorsField?.email?.replace(/\_/g, ' ')} />
                      </Grid>

                      <Grid sx={{p:1}} xs={12} md={12} xl={12} lg={12}>
                        <TextField fullWidth id="standard-basic" label={Language('general')?.phone_number} variant="standard"
                        onChange={(e) => handleChangeEl('phone_number', e, values, setValues, schemaData, setErrorsField)}
                        value={values?.phone_number}
                        error={errorsField?.phone_number} helperText={errorsField?.phone_number?.replace(/\_/g, ' ')} />
                      </Grid>

                      <Grid sx={{p:1}} xs={12} md={12} xl={12} lg={12}>
                        <TextField fullWidth id="standard-basic" label={Language('general')?.password} variant="standard"
                        onChange={(e) => handleChangeEl('password', e, values, setValues, schemaData, setErrorsField)}
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
                      </Grid>

                      <Grid sx={{p:1}} xs={12} md={12} xl={12} lg={12}>
                        <TextField fullWidth id="standard-basic" label={Language('general')?.confirm_password} variant="standard" type="password"
                        onChange={(e) => handleChangeEl('confirm_password', e, values, setValues, schemaData, setErrorsField)}
                        value={values?.confirm_password}
                        error={errorsField?.confirm_password} helperText={errorsField?.confirm_password?.replace(/\_/g, ' ')} />
                      </Grid>

                    </Grid>
                    
                    <Box sx={{width: '100%', mt: '2vh'}}>
                      <ReCAPTCHA
                        sitekey={process.env.NEXT_PUBLIC_GOOGLE_CAPTCHA_SITE_KEY}
                        onChange={e => setCaptcha(e)}
                      />
                    </Box>
                    <Box sx={{width: '100%', mt: '2vh'}}>
                      <FormGroup>
                        <FormControlLabel control={<Checkbox defaultChecked />} className={styles?.textKeepMeLoggedIn} label={Language('general')?.agreement} />
                      </FormGroup>
                    </Box>
                    <Box sx={{width: '100%', mt: '2vh'}}>
                      <Button props={{
                        disabled: !captcha,
                        fullWidth: true,
                        variant: 'contained',
                        onClick: (e) => handleSubmit(e)
                      }}>{Language('general')?.signup}</Button>
                    </Box>
                    <Box sx={{width: '100%', mt: '2vh'}}>
                      <Divider> {Language('general')?.or} </Divider>
                    </Box>
                    <Box sx={{width: '100%', mt: '2vh'}}>
                      <Button
                      props={{
                        fullWidth: true,
                        variant: 'outlined',
                        onClick: () => router.push('/auth')
                      }}>{Language('general')?.login}</Button>
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
                <p className={styles?.textIcon1a}>OTP-US Register</p>
                <p className={styles?.textIcon1b}>Let's connected to us, to get new beneficial experience.</p>
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
