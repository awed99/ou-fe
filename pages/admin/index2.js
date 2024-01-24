import {
  AddShoppingCart
} from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Divider,
  Fab,
  Grid,
  InputAdornment,
  List, ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Snackbar,
  Tab,
  Tabs,
  TextField
} from '@mui/material';
import CryptoJS from "crypto-js";
import { filter, includes, pull, size } from 'lodash';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Store from 'store';
import * as yup from 'yup';
import Style from '../../constanta/style.json';
import Layout from '../../layouts';
// import parsePhoneNumber from 'libphonenumber-js'

import { generateSignature, number_format } from '../../helpers/general';
import { handleSubmitConfirm } from '../../hooks/confirm';

export default function Dashboard() {
  const router = useRouter()
  const passwordRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!?"'@#\$%\^&\*.,])(?=.{8,})/
  let schemaData = yup.object().shape({
      email: yup.string().email().required(),
      password: yup.string().matches(passwordRegExp, 'Min 8 Chars, Uppercase, Lowercase, Number and Special Character').required(),
  })

  const [loading, setLoading] = React.useState(false);
  const [loading2, setLoading2] = React.useState(false);
  const [onCanceling, setOnCanceling] = React.useState(false);
  const [tabValue, setTabValue] = useState(1)
  const [countrySelected, setCountrySelected] = React.useState('ID');
  const [countryDataSelected, setCountryDataSelected] = React.useState({"label":'Indonesia', "code":'ID', "id":"6"});
  const [operatorsData, setOperatorsData] = React.useState([]);
  const [operatorSelected, setOperatorSelected] = React.useState('');
  const [services, setServices] = React.useState([]);
  const [servicesTotal, setServicesTotal] = React.useState(0);
  const [servicesAll, setServicesAll] = React.useState([]);
  const [multiServices, setMultiServices] = React.useState([]);
  const [isMultiService, setIsMultiService] = React.useState(false);
  const [showFav, setShowFav] = React.useState(false);
  const [serviceFav, setServiceFav] = React.useState(Store.get('service_favourites'));
  const [filterService, setFilterService] = React.useState('');
  const [listActivations, setListActivations] = React.useState(Store.get('list_activations'));
  const [expanded, setExpanded] = React.useState(false);
  const [availLists, setAvailLists] = React.useState(0)
  const [values, setValues] = useState({
    email: '',
    password: '',
  })
  const [alertMessage, setAlertMessage] = React.useState({
    open: false,
    type: 'success',
    message: ''
  })
  
  const handleChangeAccordion = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  }

  function parseHtmlEntities(str) {
    if (size(str) > 3) {
      return str?.replace(/&#([0-9]{1,3});/gi, function(match, numStr) {
        var num = parseInt(numStr, 10); // read num as normal number
        return String.fromCharCode(num);
    });
    }
  }
  
  const handleSubmit = async (e) => {
    const res = await handleSubmitConfirm(e, schemaData, values)
    
    // console.log('res: ', res)
  }

  const getOperators = async () =>{
    const _uri = 'service/get_operators0'
    const _secret = await generateSignature(_uri)

    fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
        method: 'POST',
        headers: {
          'x-signature': _secret?.signature,
          'x-timestamp': _secret?.timestamp,
        },
        body: JSON.stringify({
            "country_id": countryDataSelected?.id
        })
    })
    .then(res => res.json())
    .then(res => {
      setOperatorsData(res?.data)
    })
  }

  const getService = async () =>{
    const _uri = 'service/list_products'
    const _secret = await generateSignature(_uri)

    fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
        method: 'POST',
        headers: {
          'x-signature': _secret?.signature,
          'x-timestamp': _secret?.timestamp,
        },
        body: JSON.stringify({
            "operator_code": operatorSelected,
        })
    })
    .then(res => res.json())
    .then(res => {
      setServicesAll(res?.data)
      setServices(res?.data)
      setServicesTotal(res?.total_data)
    })
  }
  
  useEffect(() => {
    const _x = setInterval(() => {
      setListActivations(Store.get('list_activations'))
    }, 1000)

    return () => {
      clearInterval(_x)
    }
  }, [])
  
  useEffect(() => {
    if (loading2) {
      setLoading(false)
      setLoading2(false)
    }
  }, [listActivations?.dataLists, listActivations?.dataList5])
  
  useEffect(() => {
    setFilterService('')
    getOperators()
  }, [countryDataSelected])
  
  useEffect(() => {
    setFilterService('')
    if (operatorSelected?.length > 0) {
      setServices([])
      // console.log('operatorSelected: ', operatorSelected)
      getService()
      setAvailLists(number_format((Math.floor(Math.random() * (75000 - 70000 + 1)) + 70000).toString()))
    }
  }, [operatorSelected])

  useEffect(() => {
    setFilterService('')
    if (showFav) {
      const _services = []
      serviceFav?.map(item => {
        _services.push(filter(servicesAll, ['service_code', item])[0])
      })
      setServices(_services)
    } else {
      setServices(servicesAll)
    }
  }, [showFav])

  const handleFav = (itemCode) => {
    const _dataCodes = Store.get('service_favourites') ?? []
    const _services = services
    if (includes(_dataCodes, itemCode)) {
      setServices([])
      pull(_dataCodes, itemCode)
      Store.set('service_favourites', _dataCodes)
      setServiceFav(_dataCodes)
      setServices(_services)
    } else {
      setServices([])
      _dataCodes.push(itemCode)
      Store.set('service_favourites', _dataCodes)
      setServiceFav(_dataCodes)
      setServices(_services)
    }
  }
  
  const orderNumber = async () => {
    setLoading(true)
    if (!Store.get('token')) {
      router.push('/auth')
      return false
    }
    if (
      (CryptoJS.AES.decrypt(Store.get('token') ?? '', process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS.enc.Utf8).replace(',', '') === '') 
      ) {
      setAlertMessage({
        open: true,
        type: 'error',
        message: "You have to login first!"
      })
      setLoading(false)
    }
    if (
      parseInt(filterService) < 1
      ) {
      setAlertMessage({
        open: true,
        type: 'error',
        message: "Minimum Order 1 Pcs"
      })
      setLoading(false)
    }
    if (
      (CryptoJS.AES.decrypt(Store.get('chipper') ?? '', process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS.enc.Utf8).replace(',', '') === '') || 
      eval(CryptoJS.AES.decrypt(Store.get('chipper') ?? '', process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS.enc.Utf8).replace(',', '')) < (parseFloat((filterService === '') ? 0 : filterService) * filter(operatorsData, ['operator_code', operatorSelected])[0]?.op_price ?? 0).toFixed(2)
      ) {
      setAlertMessage({
        open: true,
        type: 'error',
        message: "Your Balance is not enough to Order Product: " + filter(operatorsData, ['operator_code', operatorSelected])[0]?.operator_name
      })
      setLoading(false)
      return false 
    }
    
    const _uri = 'transactions/orders_product/create'
    const _secret = await generateSignature(_uri)
    fetch(`${process.env.NEXT_PUBLIC_BE_API_DOMAIN}${_uri}`, {
      method: 'POST',
      headers: {
        'x-signature': _secret?.signature,
        'x-timestamp': _secret?.timestamp,
        'Authorization': CryptoJS.AES.decrypt(Store.get('token') ?? '', process.env.NEXT_PUBLIC_APP_API_KEY).toString(CryptoJS.enc.Utf8).replace(/\"/g, ''),
      },
      body: JSON.stringify({
        id_country: countryDataSelected?.id ?? 0,
        operator: operatorSelected,
        total: filterService,
        is_file: filter(operatorsData, ['operator_code', operatorSelected])[0]?.is_file,
      })
    })
    .then(res => res.json())
    .then((res) => {
      if (res.code === 1) {
        alert(res.message)
        setLoading(false);
        return false
      }
      Store.set('last_order_date', moment(Date()).format('YYYY-MM-DD'));
      // setLoading(false);
      setLoading2(true)
      window.location = '/history'
    }).catch(() => {setLoading(false)})
  }
  
  const orderNumbers = () => {
    let _loop = 1
    // console.log('multiServices: ',multiServices)
    multiServices?.map(serviceCode => {
      const _service = filter(services, ['service_code', serviceCode])[0]
      const _avail = _service?.stocks
      orderNumber(_service, _avail, size(multiServices), _loop)
      _loop++
    })
    setMultiServices([])
    setTimeout(() => {
      setServices([...servicesAll])
    }, 1000)
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

                <Grid container spacing={{xs:0, md:0, xl:2, lg:1}}>
                  <Grid item xs={12} md={12} xl={4} lg={4} sx={{p:3, border: '1px solid #333', borderRadius: 2, mb: 2}}>
                    <Tabs
                      value={tabValue}
                      onChange={(e, val) => setTabValue(val)}
                      sx={{mb: 5}}
                    >
                      <Tab
                        value={1}
                        label="Activator"
                        wrapped
                      />
                    </Tabs>

                      {/* <Box>
                        <div>
                          <b>{filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '6'])[0]?.translated_text}</b> 
                          <Tooltip title="To buy several services for one number">
                            <HelpOutline style={{fontSize: '16px'}}/>
                          </Tooltip>
                          <div style={{float: 'right', marginTop: '-10px'}}>
                            <Switch checked={isMultiService} onChange={(e) => {setIsMultiService(e?.target?.checked); setMultiServices([])}}/>
                          </div>
                        </div>
                      </Box> */}

                      <Box sx={{mt:2}}>
                        {((tabValue === 1) && Store.get('list_countries')) && <>
                          <b>
                            1 Country Available
                          </b>
                          <Autocomplete
                            sx={{mt:1}}
                            disableClearable
                            id="country-select-demo"
                            size="small"
                            onAbort={() => {setCountrySelected('ID'); setCountryDataSelected({"label":"Indonesia", "code": "ID", "id":"6"});}}
                            value={countryDataSelected || []}
                            onChange={(i, val) => {setOperatorSelected(''); setCountrySelected(val?.code); setCountryDataSelected(val);}}
                            options={[{"label":"Indonesia", "code": "ID", "id":"6"}]}
                            autoHighlight
                            getOptionLabel={(option) => option?.label}
                            renderOption={(props, option) => (
                              <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                                <img
                                  loading="lazy"
                                  width="20"
                                  src={`https://flagcdn.com/w20/${option?.code?.toLowerCase()}.png`}
                                  srcSet={`https://flagcdn.com/w40/${option?.code?.toLowerCase()}.png 2x`}
                                  alt=""
                                />
                                {option.label} ({option.code})
                              </Box>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label={filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '37'])[0]?.translated_text}
                                inputProps={{
                                  ...params.inputProps,
                                }}
                              />
                            )}
                          />
                      </>}
                    </Box>
                    
                    <Box sx={{mt:2}}>
                      <b>Choose Activator</b> 
                      <Select
                        sx={{mt:1}}
                        size='small'
                        onChange={(item) => setOperatorSelected(item?.target?.value)}
                        value={operatorSelected}
                        fullWidth
                      >
                        {
                          operatorsData?.map((item) => (<MenuItem key={item?.operator_code} value={item?.operator_code}>{item?.operator_name ?? item?.operator_code}</MenuItem>))
                        }
                      </Select>
                    </Box>
                    
                    <Box sx={{mt:2}}>
                      {operatorSelected && (<p> 

                        <TextField
                          onFocus={() => setShowFav(false)}
                          fullWidth
                          value={filterService}
                          onChange={e => setFilterService(e.target.value)}
                          placeholder="Min 1 Pcs"
                          variant="outlined"
                          size="small"
                          style={{marginTop: '10px'}}
                          type="number"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                Pcs
                              </InputAdornment>
                            ),
                          }}
                        />

                        <Box sx={{mt: '10px'}}><b>
                          Price: USD {(parseFloat((filterService === '') ? 0 : filterService) * filter(operatorsData, ['operator_code', operatorSelected])[0]?.op_price ?? 0).toFixed(2)}
                        </b></Box>

                        <Button onClick={orderNumber} variant="contained" fullWidth sx={{mt:4}} disabled={(filterService === '' || filterService === '0')}>Order</Button>
                      </p>)}

                      {(size(multiServices) > 0 && isMultiService) && <Fab color="primary" aria-label="add"
                      sx={{
                        mt: '15px',
                        float: 'right',
                      }}>
                      <AddShoppingCart onClick={orderNumbers} />
                      </Fab>}
                    </Box>

                  </Grid>

                  <Grid item xs={12} md={12} xl={8} lg={8}>
                  
                  <h3 sx={{mt: '-45px'}}>{availLists} Available Products List</h3>
                  <List
                        sx={{ width: '100%', bgcolor: 'background.paper', border: '1px solid black', borderRadius: '10px',
                        overflow: 'auto', maxHeight: 420, mt: '10px' }}
                        aria-label="contacts"
                      >
                        {
                          size(services) > 0 && services?.map((item, index) => (<>
                            <ListItem key={item?.filename} disablePadding 
                              sx={{bgcolor: (index%2==0) && '#F6F6FF'}}
                              disabled={item?.stocks === '0'}
                              // secondaryAction={<>
                              // {(!isMultiService) && <IconButton aria-label="comment" 
                              //   // onClick={() => orderNumber(item, item?.stocks)}
                              //   disabled={item?.stocks === '0'}
                              // >
                              //   <AddShoppingCart style={{color: '#12a4d9'}} />
                              // </IconButton>}
                              // </>
                              // }
                              >
                              <ListItemButton>
                                
                                  {/* {(isMultiService) && <ListItemIcon style={{minWidth: '30px !important'}}>
                                    <Checkbox
                                    edge="start"
                                    checked={multiServices.indexOf(item?.filename) !== -1}
                                    tabIndex={-1}
                                    disableRipple
                                    onChange={() => handleMultiService(item?.filename)}
                                    disabled={item?.stocks === '0'}
                                    // inputProps={{ 'aria-labelledby': labelId }}
                                  /></ListItemIcon>} */}
                                
                                <ListItemIcon>
                                  <AddShoppingCart style={{color: '#12a4d9'}} />
                                  {/* <Star style={{color: (includes(serviceFav ?? [], item?.filename)) ? '#12a4d9' : '#999999'}} onClick={() => handleFav(item?.service_code)} /> */}
                                </ListItemIcon>
                                {
                                  <ListItemText primary={item?.size + ' - ' + moment(item?.created_datetime).format('ddd, DD/MM/YYYY HH:mm')} secondary={item?.filename} />
                                }
                              </ListItemButton>
                            </ListItem>
                            <Divider />
                            </>))
                        }
                      </List>
                      
                  </Grid>


                </Grid>
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
