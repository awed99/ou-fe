import {
  Button,
  Chip, Divider,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText
} from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CryptoJS from "crypto-js";
import { filter } from 'lodash';
import moment from 'moment';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import React from 'react';
import Store from 'store';
import Header from './header';

import { AccountCircle, ArrowDropDown, Login, Logout, Menu as MenuIcon, Settings } from '@mui/icons-material';

import ModalDialog from '../../components/dialog';
import SideBar from './sidebar';

import { currency_format, generateSignature } from '../../helpers/general';

const drawerWidth = 240;

function ResponsiveDrawer({children, listCountries}) {
  const router = useRouter()
  // const [listCountry, setListCountry] = React.useState([])
  const [running, setRunning] = React.useState(true)
  const [timeNow, setTimeNow] = React.useState(moment())
  const [token, setToken] = React.useState('')
  const [openModal, setOpenModal] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorElPopover, setAnchorElPopover] = React.useState(null);
  const [chipper, setChipper] = React.useState('0');
  const openPopover = anchorElPopover ?? false
  const idPopover = openPopover ? 'simple-popover' : undefined;


  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (<SideBar />);

  const updateSaldo = async () => {
    // setLoading(true)
    // axios.post(`http://fi.bestpva.org/service/get_operators`, {
    const _uri = 'finance/saldo/get_user_saldo'
    const _secret = await generateSignature(_uri)
    fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}finance/saldo/get_user_saldo`, {
      method: 'POST',
      headers: {
        'x-signature': _secret?.signature,
        'x-timestamp': _secret?.timestamp,
        'Authorization': CryptoJS?.AES?.decrypt(token, process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS?.enc?.Utf8).replace(/\"/g, '') ?? '-',
      },
      // body: JSON.stringify(values),
      // body: dataX,
    })
    .then((res) => res.json())
    .then((res) => {
      if ((parseInt(res?.status) > 0 || parseInt(res?.code) > 0) && (res?.status != '102' && res?.status != '101')) {
        Store.remove('user')
        Store.remove('token')
        Store.remove('chipper')
        router.push('/auth')
        return false
      }
      setChipper(res?.data?.saldo)
      Store.set('list_activations', res?.list_activations)
      Store.set('chipper', CryptoJS?.AES?.encrypt(`${(res?.data?.saldo)}`, `${process.env.NEXT_PUBLIC_APP_API_KEY}`).toString())
      Store.set('curs', res?.curs)
      
      if (running) {
        setTimeout(() => {
          updateSaldo()
        }, 1000)
      }
    }).catch(() => {
      if (running) {
        setTimeout(() => {
          updateSaldo()
        }, 1000)
      }
    })
  }
  
  const handleLogout = async (e) => {
    Store.remove('user')
    Store.remove('token')
    Store.remove('chipper')
    window.location = ('/auth')
  }

  const updateCountry = async () =>{
      const _uri = 'basedata/list_countries'
      const _secret = await generateSignature(_uri)
  
      fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
          method: 'POST',
          headers: {
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json',
            // 'Host': 'http://api.otp.local:40011',
            'x-signature': _secret?.signature,
            'x-timestamp': _secret?.timestamp,
          },
          // body: JSON.stringify({
          //     "filter": {
          //         "merchant_id": 1
          //     }
          // })
      })
      .then(res => res.json())
      .then(res => {
        // setListCountry(res?.data)
        // Store.set('curs', res?.data?.curs)
        if (listCountries) {
          listCountries(res?.data)
        }
        Store.set('list_countries', res?.data)
        Store.set('curs', res?.curs)
        
        const _idDataLang = filter(res?.languages?.base_languages, ['language_code', 'EN_US'])[0]?.id
        Store.set('all_languages', res?.languages?.setting_language)
        if (!Store.get('id_base_language')) {
          Store.set('id_base_language', _idDataLang)
        }
        Store.set('languages', filter(res?.languages?.setting_language, ['id_base_language', _idDataLang]))
        // Store.set('myIntervalUser', 0)
      })
      // .then(() => window.location = ('/'))
  }

  const handleSetToken = () => {
    // console.log('TOKEN: ', Store.get('token'))
    if (Store.get('token')) {
      setToken(Store.get('token'))
    } else {
      setTimeout(() => handleSetToken(), 1000)
    }
  }

  React.useEffect(() => {
    if (token !== '') {
      updateSaldo()
    }
  }, [token])

  React.useEffect(() => {
    updateCountry()
    if (running) {
      // updateSaldo()
    }
    // if (size(Store.get('list_countries')) < 1) {
    //   updateCountry()
    // }

    setInterval(() => {
      setTimeNow(moment())
    }, 1000)
    
    setTimeout(() => handleSetToken(), 1000)
    // const intervalId = setInterval(() => {
    //     fetchData()
    // }, 10000);
    
    return () => {
      setRunning(false)
    };
  }, [])

  // const container = window !== undefined ? () => window?.document?.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar style={{display: 'flex', justifyContent: 'space-between'}}>
          <div>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography component="span" sx={{fontSize: '90%'}}>
              OTP-US
            </Typography>
          </div>
          {(token !== '') && <Button variant="contained" color='error' onClick={() => router.push('/wallet')}>
            {currency_format(parseFloat(chipper))}
          </Button>}

          <Chip size="large"
            aria-describedby={idPopover}
            onClick={(e) => setAnchorElPopover(e?.currentTarget)}
            icon={<Settings style={{color: 'white'}} />} 
            deleteIcon={<ArrowDropDown style={{color: 'white'}} />}
            onDelete={(e) => setAnchorElPopover(e?.currentTarget)}
            // label="Options" 
            variant="outlined" 
            style={{color: 'white', float: 'right'}} />
        </Toolbar>
      </AppBar>



      <Popover
        id={idPopover}
        open={openPopover}
        anchorEl={anchorElPopover}
        onClose={e => setAnchorElPopover(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <List>
          {(token !== '') && <>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <AccountCircle />
                </ListItemIcon>
                <ListItemText primary="Account" />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton onClick={() => setOpenModal(true)}>
                <ListItemIcon>
                  <Logout />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>}
          {(token === '') && <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => router.push('/auth')}>
                <ListItemIcon>
                  <Login />
                </ListItemIcon>
                <ListItemText primary="Login / Register" />
              </ListItemButton>
            </ListItem>
          </>}
        </List>
      </Popover>

      <nav>
        <Drawer
          // container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 2 }}
      >
        <Toolbar />
        {children}
        {/* {children({listCountries: listCountries})} */}
        {/* {Children.map(children, (child, index) =>
          React.cloneElement(child, {
            listCountries: listCountries
          })
        )}
        {React.cloneElement(children, { listCountries: listCountries })} */}
      </Box>

      <ModalDialog titleModal="Logout Confirmation" openModal={openModal} setOpenModal={setOpenModal} handleSubmitFunction={handleLogout}>
          <Box style={{width: 550}}>
              Are you sure want to logout ?
          </Box>
      </ModalDialog>
    </Box>
  );
}

ResponsiveDrawer.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

export default ResponsiveDrawer;