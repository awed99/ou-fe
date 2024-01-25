import Alert from '@mui/material/Alert';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import CryptoJS from "crypto-js";
import { size } from 'lodash';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import Store from 'store';

import {
  AccountBalanceWallet, CodeOff, Dashboard, History,
  HistoryEdu,
  ManageHistory,
  Percent, Policy, PriceCheck,
  Sms, Telegram, VpnKey, Webhook
} from '@mui/icons-material';
import ModalDialog from '../../components/dialog';
import { generateSignature } from '../../helpers/general';

export default function HeaderAuth({children}) {
  const router = useRouter()
  const _user = Store.get('user') ? (CryptoJS.AES.decrypt(Store.get('user') ?? '', process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS?.enc?.Utf8)) : '{}'
  const [timeNow, setTimeNow] = React.useState(moment())
  const [openModal, setOpenModal] = React.useState(false)
  const [openModal2, setOpenModal2] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [ApiKey, setApiKey] = React.useState(JSON?.parse(_user)?.token_api)
  const [webhookURL, setWebhookURL] = React.useState(JSON?.parse(_user)?.webhook_url)
  const [alertMessage, setAlertMessage] = React.useState({
    open: false,
    type: 'success',
    message: ''
  })
  // console.log(router?.asPath)
  
  const handleChangeAPIKey = async (e) => {
    const _x = confirm('Are you sure, want to Change API Key?')
    if (!_x) {
      return false
    }

    const _uri = 'users/generate_api_key'
    const _secret = await generateSignature(_uri)
    setLoading(true)
    setOpenModal(false)
    const resX = await fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
        method: 'POST',
        headers: {
          'x-signature': _secret?.signature,
          'x-timestamp': _secret?.timestamp,
          'Authorization': CryptoJS?.AES?.decrypt(Store.get('token'), process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS?.enc?.Utf8).replace(/\"/g, ''),
        },
        // body: JSON.stringify(values),
        // body: dataX,
    })
    .then(async (res) => await res.json())
    .then(async (res) => {
      setApiKey(res?.data)
      setAlertMessage({
        open: true,
        type: (res?.code > 0) ? 'error' : 'success',
        message: (res?.code > 0) ? res?.message :  res?.message
      })
        setTimeout(() => {
          setOpenModal(true)
          setLoading(false)
        }, 2500)
    }).catch(() => setLoading(false))
  }
  
  const handleSaveWebhook = async (e) => {
    const _uri = 'users/save_webhook'
    const _secret = await generateSignature(_uri)
    setLoading(true)
    setOpenModal2(false)
    const resX = await fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
        method: 'POST',
        headers: {
          'x-signature': _secret?.signature,
          'x-timestamp': _secret?.timestamp,
          'Authorization': CryptoJS?.AES?.decrypt(Store.get('token'), process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS?.enc?.Utf8).replace(/\"/g, ''),
        },
        body: JSON.stringify({webhook_url: webhookURL}),
        // body: dataX,
    })
    .then(async (res) => await res.json())
    .then(async (res) => {
      setApiKey(res?.data)
      setAlertMessage({
        open: true,
        type: (res?.code > 0) ? 'error' : 'success',
        message: (res?.code > 0) ? res?.message :  res?.message
      })
        setTimeout(() => {
          setOpenModal2(true)
          setLoading(false)
        }, 2500)
    }).catch(() => setLoading(false))
  }

  useEffect(() => {
    setInterval(() => {
      setTimeNow(moment())
    }, 1000)
  }, [])

  const buttonDialogs = (
    <Button onClick={handleChangeAPIKey}>
      Generate New API Key
    </Button>)

  return (
    <>
    <div>
        <Toolbar onClick={() => window.location = ('/')} sx={{mt: 4}}>
          <img src="/images/logo.png"  width="80" height="80"/>
        </Toolbar>
        <Box sx={{pl:3, pr:3, mt: 3, mb:-1, fontSize: '12px'}}>(App Time)<br/>{timeNow.format('ddd, DD MMM YYYY - HH:mm:ss')}</Box>
        <List sx={{mt: 3, ml: 2, mr: 2}}>
          <ListItem disablePadding onClick={() => window.location = ('/')}>
            <ListItemButton>
              <ListItemIcon>
                <Dashboard color={router?.asPath?.split("/")[1] === '' ? 'primary' : '#C7C7C7'} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{fontWeight: router?.asPath?.split("/")[1] === '' ? 'bold' : 'normal', color: router?.asPath?.split("/")[1] === '' ? '#12a4d9' : '#C7C7C7'}} primary={'Home'} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding onClick={() => window.location = ('/sms-otp')}>
            <ListItemButton>
              <ListItemIcon>
                <Sms color={router?.asPath?.split("/")[1] === 'sms-otp' ? 'primary' : '#C7C7C7'} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{fontWeight: router?.asPath?.split("/")[1] === 'sms-otp' ? 'bold' : 'normal', color: router?.asPath?.split("/")[1] === 'sms-otp' ? '#12a4d9' : '#C7C7C7'}} primary={'SMS'} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding onClick={() => window.location = ('/history')}>
            <ListItemButton>
              <ListItemIcon>
                <ManageHistory color={router?.asPath?.split("/")[1] === 'history' ? 'primary' : '#C7C7C7'} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{fontWeight: router?.asPath?.split("/")[1] === 'history' ? 'bold' : 'normal', color: router?.asPath?.split("/")[1] === 'history' ? '#12a4d9' : '#C7C7C7'}} primary={'History Order'} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding onClick={() => window.location = ('/history-otp')}>
            <ListItemButton>
              <ListItemIcon>
                <History color={router?.asPath?.split("/")[1] === 'history-otp' ? 'primary' : '#C7C7C7'} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{fontWeight: router?.asPath?.split("/")[1] === 'history-otp' ? 'bold' : 'normal', color: router?.asPath?.split("/")[1] === 'history-otp' ? '#12a4d9' : '#C7C7C7'}} primary={'History SMS'} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding onClick={() => window.location = ('/wallet')}>
            <ListItemButton>
              <ListItemIcon>
                <AccountBalanceWallet color={router?.asPath?.split("/")[1] === 'wallet' ? 'primary' : '#C7C7C7'} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{fontWeight: router?.asPath?.split("/")[1] === 'wallet' ? 'bold' : 'normal', color: router?.asPath?.split("/")[1] === 'wallet' ? '#12a4d9' : '#C7C7C7'}} primary={'My Wallet'} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding onClick={() => window.location = ('/deposit')}>
            <ListItemButton>
              <ListItemIcon>
                <PriceCheck color={router?.asPath?.split("/")[1] === 'deposit' ? 'primary' : '#C7C7C7'} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{fontWeight: router?.asPath?.split("/")[1] === 'deposit' ? 'bold' : 'normal', color: router?.asPath?.split("/")[1] === 'deposit' ? '#12a4d9' : '#C7C7C7'}} primary={'All Deposits'} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding onClick={() => window.open((process.env.NEXT_PUBLIC_URL_API_DOCS), '_blank').focus()}>
            <ListItemButton>
              <ListItemIcon>
                <CodeOff color={router?.asPath?.split("/")[1] === 'api' ? 'primary' : '#C7C7C7'} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{fontWeight: router?.asPath?.split("/")[1] === 'api' ? 'bold' : 'normal', color: router?.asPath?.split("/")[1] === 'api' ? '#12a4d9' : '#C7C7C7'}} primary={'API'} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding onClick={() => (size(_user) > 3) ? setOpenModal(true) : false}>
            <ListItemButton>
              <ListItemIcon>
                <VpnKey color={router?.asPath?.split("/")[1] === 'my-api-key' ? 'primary' : '#C7C7C7'} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{color: '#C7C7C7'}} primary={'My API Key'} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding onClick={() => (size(_user) > 3) ? setOpenModal2(true) : false}>
            <ListItemButton>
              <ListItemIcon>
                <Webhook color={router?.asPath?.split("/")[1] === 'webhook' ? 'primary' : '#C7C7C7'} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{color: '#C7C7C7'}} primary={'Webhook'} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding onClick={() => window.location = ('/discount')}>
            <ListItemButton>
              <ListItemIcon>
                <Percent color={router?.asPath?.split("/")[1] === 'discount' ? 'primary' : '#C7C7C7'} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{fontWeight: router?.asPath?.split("/")[1] === 'discount' ? 'bold' : 'normal', color: router?.asPath?.split("/")[1] === 'discount' ? '#12a4d9' : '#C7C7C7'}} primary={'Get Discount'} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding onClick={() => window.open('https://t.me/otpus2', '_blank').focus()}>
            <ListItemButton>
              <ListItemIcon>
                <Telegram color={router?.asPath?.split("/")[1] === 'contact-us' ? 'primary' : '#C7C7C7'} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{fontWeight: router?.asPath?.split("/")[1] === 'contact-us' ? 'bold' : 'normal', color: router?.asPath?.split("/")[1] === 'contact-us' ? '#12a4d9' : '#C7C7C7'}} primary={'Contact Us'} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding onClick={() => window.location = ('/privacy-policy')}>
            <ListItemButton>
              <ListItemIcon>
                <Policy color={router?.asPath?.split("/")[1] === 'privacy-policy' ? 'primary' : '#C7C7C7'} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{fontWeight: router?.asPath?.split("/")[1] === 'privacy-policy' ? 'bold' : 'normal', color: router?.asPath?.split("/")[1] === 'privacy-policy' ? '#12a4d9' : '#C7C7C7'}} primary={'Privacy Policy'} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding onClick={() => window.location = ('/term-condition')}>
            <ListItemButton>
              <ListItemIcon>
                <HistoryEdu color={router?.asPath?.split("/")[1] === 'term-condition' ? 'primary' : '#C7C7C7'} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{fontWeight: router?.asPath?.split("/")[1] === 'term-condition' ? 'bold' : 'normal', color: router?.asPath?.split("/")[1] === 'term-condition' ? '#12a4d9' : '#C7C7C7'}} primary={'Term & Cond.'} />
            </ListItemButton>
          </ListItem>
          {/* <Divider />
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <img src="/images/wizzard/ba.png" />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{fontWeight: 'bold', color: '#C7C7C7'}} primary={'Business Address'} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <img src="/images/wizzard/ibi.png" />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{fontWeight: 'bold', color: '#C7C7C7'}} primary={'Identity and Bank Information'} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <img src="/images/wizzard/tp.png" />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{fontWeight: 'bold', color: '#C7C7C7'}} primary={'Transaction Profile'} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <img src="/images/wizzard/pm.png" />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{fontWeight: 'bold', color: '#C7C7C7'}} primary={'Payment method'} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <img src="/images/wizzard/asd.png" />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{fontWeight: 'bold', color: '#C7C7C7'}} primary={'Attachments Supporting Documents'} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <img src="/images/wizzard/dv.png" />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{fontWeight: 'bold', color: '#C7C7C7'}} primary={'Document verification'} />
            </ListItemButton>
          </ListItem> */}
        </List>
      </div>

      <ModalDialog titleModal="API Key Details" openModal={openModal} setOpenModal={setOpenModal} ButtonDialogs={buttonDialogs}>
          <Box style={{width: 550}}>
              <p>My API Key : </p>
              <br />
              <p><b>{ApiKey}</b></p>
          </Box>
      </ModalDialog>

      <ModalDialog titleModal="Weebhook" openModal={openModal2} setOpenModal={setOpenModal2} handleSubmitFunction={handleSaveWebhook}>
          <Box style={{maxWidth: 550, fontSize: '12px'}}>
            <TextField id="outlined-basic" label="Weebhook URL (https://domain.com/webhook.php)" onChange={(e) => setWebhookURL(e.target.value)} variant="outlined" value={webhookURL} fullWidth /><br /><br />
            <Divider /><br />
            <h3>WHAT IS WEBHOOK?</h3>

            <p>Webhook - a mechanism to alert the system about events.</p>
            <p>After purchasing a number, you do not have to constantly send a request to receive incoming SMS.</p>
            <p>We can send you the contents of the SMS to the address (or addresses) that you can specify in the settings</p>
            <p>For example - you specified Webhook url=https://domain.com/webhook.php in your account settings, after which you purchased activation</p>
            <p>As soon as the SMS arrives we will make a POST request to https://domain.com/webhook.php in the following format:</p><br/>
            <p>{'{"activationId": 123456, "service": "go", "text": "Sms text", "code": "12345", "country": 0, "receivedAt": "2023-01-01 12: 00:00"}'}</p>
            <p>Where activationId is the id of the activation to which the SMS was received,</p>
            <p>text - SMS text,</p>
            <p>receivedAt - SMS arrival time in timestamp format (YYYY-MM-DD HH:ii:ss),</p>
            <p>code - sms code,</p>
            <p>service - Activation service</p>
            <p>country - activation country</p><br/>
            <p>When sending a request, we will wait for a response from you with HTTP code 200. If we do not receive such a code, we will resend the same request within 2 hours, but no more than 8 times. If your server does not respond with code 200 all 8 times, we will stop sending requests.</p>
            <p>You can set up to 3 addresses to which we will send Webhooks</p>
          </Box>
      </ModalDialog>
    
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
