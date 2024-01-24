export const handleSubmitConfirm = async (e, schemaData, values) => {
    // console.log(values)
    return schemaData.isValid(values)
    .then(async (valid) => {
      if (valid) {
        e.preventDefault()
        const dataX = new FormData()
        dataX.append('email', values?.email)
        dataX.append('password', values?.password)
        const resX = await fetch(`${process.env.NEXT_PUBLIC_BE_API}web_config/save`, {
            method: 'POST',
            headers: {
            //   'Accept': 'application/json',
            //   'Content-Type': 'application/json'
            },
            // body: JSON.stringify(values),
            body: dataX,
        })
        .then(async (res) => await res.json())
        .then(async (res) => res)
        return resX
      } else {
        return {
          code: '001',
          message: 'Error'
        }
      }
    })
  }