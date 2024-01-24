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
import { useRouter } from 'next/router';
import React from 'react';
import Store from 'store';

import {
  AddShoppingCart,
  Dashboard,
  ManageHistory,
  Person,
  PriceCheck,
  ShoppingCart
} from '@mui/icons-material';
import ModalDialog from '../../components/dialog';
import { generateSignature } from '../../helpers/general';

export default function HeaderAuth({children}) {
  const router = useRouter()
  const _user = Store.get('user') ? (CryptoJS.AES.decrypt(Store.get('user') ?? '', process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS?.enc?.Utf8)) : '{}'
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
          'Authorization': CryptoJS?.AES?.decrypt(Store.get('token_admin'), process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS?.enc?.Utf8).replace(/\"/g, ''),
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
          'Authorization': CryptoJS?.AES?.decrypt(Store.get('token_admin'), process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS?.enc?.Utf8).replace(/\"/g, ''),
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

  const buttonDialogs = (
    <Button onClick={handleChangeAPIKey}>
      Generate New API Key
    </Button>)

  return (
    <>
    <div>
        <Toolbar onClick={() => window.location = ('/admin/dashboard')} sx={{mt: 4}}>
          <img src="/images/logo_admin.png"  width="80" height="80"/>
        </Toolbar>
        <List sx={{mt: 3, ml: 2, mr: 2}}>
          <ListItem disablePadding onClick={() => window.location = ('/admin/dashboard')}>
            <ListItemButton>
              <ListItemIcon>
                <Dashboard color={router?.asPath?.split("/")[2] === 'dashboard' ? 'primary' : '#C7C7C7'} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{fontWeight: router?.asPath?.split("/")[2] === 'dashboard' ? 'bold' : 'normal', color: router?.asPath?.split("/")[2] === 'dashboard' ? '#12a4d9' : '#C7C7C7'}} primary={'Dashboard'} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding onClick={() => window.location = ('/admin/history')}>
            <ListItemButton>
              <ListItemIcon>
                <ManageHistory color={router?.asPath?.split("/")[2] === 'history' ? 'primary' : '#C7C7C7'} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{fontWeight: router?.asPath?.split("/")[2] === 'history' ? 'bold' : 'normal', color: router?.asPath?.split("/")[2] === 'history' ? '#12a4d9' : '#C7C7C7'}} primary={'File Orders'} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding onClick={() => window.location = ('/admin/history_otp')}>
            <ListItemButton>
              <ListItemIcon>
                <ShoppingCart color={router?.asPath?.split("/")[2] === 'history_otp' ? 'primary' : '#C7C7C7'} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{fontWeight: router?.asPath?.split("/")[2] === 'history_otp' ? 'bold' : 'normal', color: router?.asPath?.split("/")[2] === 'history_otp' ? '#12a4d9' : '#C7C7C7'}} primary={'OTP Orders'} />
            </ListItemButton>
          </ListItem>
          {/* <ListItem disablePadding onClick={() => window.location = ('/admin/wallet')}>
            <ListItemButton>
              <ListItemIcon>
                <AccountBalanceWallet color={router?.asPath?.split("/")[2] === 'wallet' ? 'primary' : '#C7C7C7'} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{fontWeight: router?.asPath?.split("/")[2] === 'wallet' ? 'bold' : 'normal', color: router?.asPath?.split("/")[2] === 'wallet' ? '#12a4d9' : '#C7C7C7'}} primary={'User Wallet'} />
            </ListItemButton>
          </ListItem> */}
          <ListItem disablePadding onClick={() => window.location = ('/admin/deposit')}>
            <ListItemButton>
              <ListItemIcon>
                <PriceCheck color={router?.asPath?.split("/")[2] === 'deposit' ? 'primary' : '#C7C7C7'} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{fontWeight: router?.asPath?.split("/")[2] === 'deposit' ? 'bold' : 'normal', color: router?.asPath?.split("/")[2] === 'deposit' ? '#12a4d9' : '#C7C7C7'}} primary={'All Deposits'} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding onClick={() => window.location = ('/admin/products')}>
            <ListItemButton>
              <ListItemIcon>
                <AddShoppingCart color={router?.asPath?.split("/")[2] === 'products' ? 'primary' : '#C7C7C7'} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{fontWeight: router?.asPath?.split("/")[2] === 'products' ? 'bold' : 'normal', color: router?.asPath?.split("/")[2] === 'products' ? '#12a4d9' : '#C7C7C7'}} primary={'Products'} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding onClick={() => window.location = ('/admin/users')}>
            <ListItemButton>
              <ListItemIcon>
                <Person color={router?.asPath?.split("/")[2] === 'users' ? 'primary' : '#C7C7C7'} />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{fontWeight: router?.asPath?.split("/")[2] === 'users' ? 'bold' : 'normal', color: router?.asPath?.split("/")[2] === 'users' ? '#12a4d9' : '#C7C7C7'}} primary={'Users'} />
            </ListItemButton>
          </ListItem>
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
