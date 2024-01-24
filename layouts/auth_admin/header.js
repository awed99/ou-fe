import Head from 'next/head'

export default function HeaderAuth({children}) {
  return (
    <>
      <Head>
        <title>OTP-US ADMIN</title>
        <meta name="description" content="OTP-US" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/logo_admin.png" />
      </Head>
    </>
  )
}
