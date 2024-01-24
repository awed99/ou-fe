import {
  Alert,
  Backdrop,
  Box,
  CircularProgress,
  Grid,
  Snackbar
} from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react';
import Style from '../constanta/style.json';
import Layout from '../layouts';

// import Countdown from 'react-countdown'
// import parsePhoneNumber from 'libphonenumber-js'


export default function Discount() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [alertMessage, setAlertMessage] = React.useState({
    open: false,
    type: 'success',
    message: ''
  })

  return (
    <>
      <Layout type="dashboard">
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

                <h1>OTP-US Wholesale prices and discounts up to 40% on Groceries Price</h1>
                <p>Accumulation of All member's Top up balance from US $12 and become a VIP Groceries Price of the OTP-US Loyalty Program</p>
                <br/>
                <p>
                  <strong>Big Discount Update</strong>
                </p>
                <p>The OTP-US Loyalty Program has become easier and more profitable.</p>
                <p>The main goal of the update is to provide our VIP Customers with all the conditions, based on the specifics of their work with special prices for all.</p>
                <br/>
                <p>
                  <strong>Key points in the update:</strong>
                </p>
                <ul>
                  <li>We have added&nbsp; <strong>discounts on Groceries Price up to 40%</strong>
                  </li>
                  <li>
                    <strong>Cashback</strong>&nbsp;on all accounts often remained unused, so we&nbsp; <strong>replaced it with discounts and other bonuses</strong>
                  </li>
                  <li>
                    <strong>Added discounts for all products in the OTP-US ecosystem</strong>
                  </li>
                  <li>
                    <strong>We simplified the progress bar:</strong>&nbsp;removed the levels, while keeping the levels. The level is assigned depending on the amount of replenishment during the week
                  </li>
                  <li>
                    <strong>Recalculation is now performed every Monday,</strong>&nbsp;and on Sunday you will receive a reminder with the amount to replenish, necessary to move to the next level
                  </li>
                  <li>
                    <strong>Amounts to be replenished have changed to increase the level</strong>
                  </li>
                </ul>
                <br/>
                <p>Benefits for program VIP Groceries Price of the OTP-US Loyalty Program</p>
                <ul>
                  <li>
                    <strong>Groceries Prices for numbers</strong>
                  </li>
                  <li>
                    <strong>Up to 40% discount</strong>&nbsp;on Groceries Price numbers
                  </li>
                  <li>
                    <strong>Groceries Prices for ready-made accounts</strong>
                  </li>
                  <li>Personal&nbsp; <strong>VIP Support</strong>
                  </li>
                  <li>
                    <strong>Additional Features</strong>
                  </li>
                </ul>
                <br/>
                <p>
                  <img alt="What is level?" src="https://smsactivate.s3.eu-central-1.amazonaws.com/assets/img/loyalty/loyalty-levels.svg" />
                </p>
                <br/>
                <p>
                  <strong>Level VIP Member Table</strong>
                </p>
                <table className="styled-table" >
                  <thead>
                    <tr>
                      <th>
                        <p>Level and <br /> Accumulation Amounts </p>
                      </th>
                      <th>
                        <p>Bonuses</p>
                      </th>
                      <th>
                        <p>Wholesale numbers prices</p>
                      </th>
                      <th>
                        <p>Wholesale account prices</p>
                      </th>
                      <th>
                        <p>VIP Discounts</p>
                      </th>
                      <th>
                        <p>Removing the ban</p>
                      </th>
                      <th>
                        <p>White List</p>
                      </th>
                      <th>
                        <p>VIP Support</p>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>I &gt; US $12</td>
                      <td>available</td>
                      <td>available</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                    </tr>
                    <tr>
                      <td>II &gt;&nbsp;US $60</td>
                      <td>available</td>
                      <td>available</td>
                      <td>5%</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                    </tr>
                    <tr>
                      <td>III &gt;&nbsp;US $120</td>
                      <td>available</td>
                      <td>available</td>
                      <td>7.5%</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                    </tr>
                    <tr>
                      <td>IV&nbsp;&gt;&nbsp;US $240</td>
                      <td>available</td>
                      <td>available</td>
                      <td>10%</td>
                      <td>available</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                    </tr>
                    <tr>
                      <td><b>V &gt;&nbsp;US $600</b></td>
                      <td>available forever</td>
                      <td>available</td>
                      <td>12.5%</td>
                      <td>available</td>
                      <td>available</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                    </tr>
                    <tr>
                      <td><b>VI &gt; US $1,200</b></td>
                      <td>available forever</td>
                      <td>available</td>
                      <td>15%</td>
                      <td>available</td>
                      <td>available</td>
                      <td>available</td>
                      <td>&nbsp;</td>
                    </tr>
                    <tr>
                      <td><b>VII &gt; US $1,800</b></td>
                      <td>available forever</td>
                      <td>available</td>
                      <td>20%</td>
                      <td>available</td>
                      <td>available</td>
                      <td>available</td>
                      <td>&nbsp;</td>
                    </tr>
                    <tr>
                      <td><b>VIII &gt; US $2,400</b></td>
                      <td>available forever</td>
                      <td>available</td>
                      <td>25%</td>
                      <td>available</td>
                      <td>available</td>
                      <td>available</td>
                      <td>&nbsp;</td>
                    </tr>
                    <tr>
                      <td><b>IX &gt; US $3,600</b></td>
                      <td>available forever</td>
                      <td>available</td>
                      <td>30%</td>
                      <td>available</td>
                      <td>available</td>
                      <td>available</td>
                      <td>&nbsp;</td>
                    </tr>
                    <tr>
                      <td><b>X &gt; US $4,800</b></td>
                      <td>available forever</td>
                      <td>available</td>
                      <td>40%</td>
                      <td>available</td>
                      <td>available</td>
                      <td>available</td>
                      <td>available</td>
                    </tr>
                  </tbody>
                </table>
                
                
                
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
