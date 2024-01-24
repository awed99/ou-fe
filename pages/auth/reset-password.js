import {
  Alert,
  Backdrop,
  Box,
  CircularProgress,
  Divider,
  Grid,
  Snackbar,
  TextField,
  Typography
} from '@mui/material'
import { size, values as vals } from 'lodash'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import ReCAPTCHA from "react-google-recaptcha"
import * as yup from 'yup'
import Style from '../../constanta/style.json'
import Language from '../../languages'
import Layout from '../../layouts'
import styles from '../../styles/Auth.module.css'

import Button from '../../components/button'
import { handleSubmitResetPassword } from '../../hooks/auth'
import { handleChangeEl } from '../../hooks/general'

export default function ResetPassword() {
  const router = useRouter()
  let schemaData = yup.object().shape({
      email: yup.string().email().required(),
  })

  const [loading, setLoading] = useState(false)
  const [captcha, setCaptcha] = useState('')
  const [captchaRisk, setCaptchaRisk] = useState(0)
  const [errorsField, setErrorsField] = useState()
  const [values, setValues] = useState({
    email: '',
  })
  const [alertMessage, setAlertMessage] = useState({
    open: false,
    type: 'success',
    message: ''
  })
  
  const handleSubmit = async (e) => {
    if (size(values?.email) < 5) {
      setAlertMessage({
        open: true,
        type: 'error',
        message: 'Email is required!'
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
          const res = await handleSubmitResetPassword(e, schemaData, values)

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
                    <Typography sx={{fontSize: {
                        xs: 18,
                        md: 20,
                        lg: 22,
                        xl: 24,
                        }, mt: 4, textAlign: 'center'}}><b>{Language('general')?.reset_password_title}</b></Typography>
                    <Typography sx={{fontSize: 16, textAlign: 'center'}}>{Language('general')?.reset_password_sub_title}</Typography>
                    <Box sx={{width: '100%', mt: '3vh'}}>
                      <TextField fullWidth id="standard-basic" label={Language('general')?.email} variant="standard"
                      onChange={(e) => handleChangeEl('email', e, values, setValues, schemaData, setErrorsField)}
                      value={values?.email}
                      error={errorsField?.email} helperText={errorsField?.email} />
                    </Box>
                    <Box sx={{width: '100%', mt: '2vh'}}>
                      <ReCAPTCHA
                        sitekey={process.env.NEXT_PUBLIC_GOOGLE_CAPTCHA_SITE_KEY}
                        onChange={e => setCaptcha(e)}
                      />
                    </Box>
                    <Box sx={{width: '100%', mt: '2vh'}}>
                      <Button props={{
                        disabled: !captcha,
                        fullWidth: true,
                        variant: 'contained',
                        onClick: (e) => handleSubmit(e)
                      }}>{Language('general')?.reset_password}</Button>
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
                  lg: 5,
                  xl: 5,
                }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%'}}>
                <img src='/images/auth/icon1.png' width='60%' />
                <p className={styles?.textIcon1a}>OTP-US Forgot Password</p>
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
