import {
  Box,
  Grid,
  Typography
} from '@mui/material'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Countdown from "react-countdown"
import * as yup from 'yup'
import Style from '../../constanta/style.json'
import Language from '../../languages'
import Layout from '../../layouts'
import Styles from '../../styles/Confirm.module.css'

import Button from '../../components/button'
import { handleSubmitConfirm } from '../../hooks/confirm'

export default function Confirm() {
  const router = useRouter()
  const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!?"'@#\$%\^&\*.,])(?=.{8,})/
  let schemaData = yup.object().shape({
      email: yup.string().email().required(),
      password: yup.string().matches(passwordRegExp, 'Min 8 Chars, Uppercase, Lowercase, Number and Special Character').required(),
  })

  const [captcha, setCaptcha] = useState('')
  const [errorsField, setErrorsField] = useState()
  const [values, setValues] = useState({
    email: '',
    password: '',
  })
  
  const handleSubmit = async (e) => {
    const res = await handleSubmitConfirm(e, schemaData, values)
    
    console.log('res: ', res)
  }

  return (
    <>
      <Layout type="blank">
        <Box sx={{ background: 'none', flexGrow: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Grid container>
            <Grid xs={12}
              sx={{
                p: {
                  xs: 0,
                  md: 3,
                  lg: 6,
                  xl: 10,
                },
              // display: 'flex', 
              background: Style?.color?.white,
              borderRadius: 2
              }}>
                  <Box sx={{p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%'}}>
                    <Box className="rounded">
                      <Countdown
                        date={Date.now() + 120000}
                        renderer={({ minutes, seconds, completed  }) => {
                          if (completed) {
                            // router.push('/auth')
                            // Render a completed state
                            // return <Completionist />;
                          } else {
                            // Render a countdown
                            return <span>{minutes}:{seconds}</span>;
                          }}}
                      />
                    </Box>
                    <Typography sx={{textAlign: 'center'}} className={Styles?.titleConfirm}>
                        {Language('general')?.confirm_title}
                    </Typography>
                    <Typography sx={{mt:2, textAlign: 'center'}}>
                        {Language('general')?.confirm_text_a}
                        {'Rahma*********@gmail.com'}
                        {Language('general')?.confirm_text_b}
                    </Typography>
                    <Box sx={{width: '100%', mt: 5, textAlign: 'center'}}>
                      <Button props={{
                        fullWidth: true,
                        variant: 'contained',
                        onClick: (e) => handleSubmit(e),
                        style: {maxWidth: '300px'}
                      }}>{Language('general')?.confirm_button_resend_link}</Button>
                    </Box>
                  </Box>
            </Grid>
          </Grid>
        </Box>
      </Layout>
    </>
  )
}
