import "@fortawesome/fontawesome-free/css/all.min.css";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  // const _socket = socketIO.connect(process.env.NEXT_PUBLIC_SOCKET)
  
  // return  <PrimeReactProvider value={{ unstyled: false }}>
  //           <Component {...pageProps} />
  //         </PrimeReactProvider>
  return <Component {...pageProps} />
}
