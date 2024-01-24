import {
  Box, Container
} from '@mui/material'
import Header from './header'
  
  import { createTheme, ThemeProvider } from '@mui/material/styles'
import Style from '../../constanta/style.json'
  
  const theme = createTheme({
    palette: {
      primary: {
        main: Style?.color?.primary,
        light: '#4caf50',
        dark: '#86d2cf',
        contrastText: Style?.color?.white,
      },
      secondary: {
        main: Style?.color?.secondary,
        light: '#4caf50',
        dark: '#86d2cf',
        contrastText: Style?.color?.primary,
      },
      // secondary: Style?.color?.secondary,
      // red: Style?.color?.red,
      // white: Style?.color?.white,
      // bg1: Style?.color?.bg1
    },
  })
  
  export default function Blank({children}) {
    return (
      <ThemeProvider theme={theme}>
        <Header />
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100vh', overflow: 'hidden', width: '100% !important' }}>
            <Box sx={{ width: '100% !important', borderRadius: 2 }}>
              {children}
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    )
  }
  