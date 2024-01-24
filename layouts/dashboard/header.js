import Head from 'next/head'

export default function HeaderAuth({children}) {
  return (
    <>
      <Head>
        <title>OTP-US</title>
        <meta name="description" content="OTP-US" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/icon.png" />
      </Head>
    </>
  )
}
