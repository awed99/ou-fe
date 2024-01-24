import Base64 from 'crypto-js/enc-base64';
import hmacSHA256 from 'crypto-js/hmac-sha256';
import moment from 'moment';

export const number_format = (x) => {
    return x?.toString()?.replace(/\,/g, '')?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const currency_format = (x) => {
    // return x?.toString()?.replace(/\,/g, '')?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      }).format(x ?? 0);
}

export const format_rupiah = (angka, prefix) => {
  if (angka) {
    const number_string = angka.replace(/\,/g, '')?.replace(/[^,\d]/g, '').toString()
    const splitx   		= number_string?.split('.')
    const sisa     		= splitx[0]?.length % 3
    let rupiah     		= splitx[0]?.substr(0, sisa)
    const ribuan     		= splitx[0]?.substr(sisa).match(/\d{3}/gi)

    // tambahkan titik jika yang di input sudah menjadi angka ribuan
    if (ribuan) {
        const separator = sisa ? ',' : ''
        rupiah += separator + ribuan.join(',')
    }

    rupiah = splitx[1] != undefined ? rupiah + '.' + splitx[1] : rupiah

    return prefix == undefined ? rupiah : (rupiah ? 'Rp. ' + rupiah : '')
  } else {
    return angka
  }
}

export const spacing4Char = (x) => {
    const joy = x?.match(/.{1,4}/g);
    return joy?.join(' ')
}

const operator = {
    tri: {
        name: 'Tri',
        img: 'tri',
    },
    telkomsel: {
        name: 'Telkomsel',
        img: 'telkomsel',
    },
    im3: {
        name: 'Im3',
        img: 'im3',
    },
    xl: {
        name: 'XL',
        img: 'xl',
    },
    axis: {
        name: 'Axis',
        img: 'axis',
    },
    smartfren: {
        name: 'Smartfren',
        img: 'smartfren',
    },
}

export const checkOperatorByNumber = async (val, setPhoneNumber, setImgOperator, setIsValid) => {
    setPhoneNumber(val)
    const _val = val.substring(0, 4)
    if (
        _val === '0811' ||
        _val === '0812' ||
        _val === '0813' ||
        _val === '0821' ||
        _val === '0822' ||
        _val === '0823' ||
        _val === '0852' ||
        _val === '0853'
    ) {
        setImgOperator(operator?.telkomsel?.img)
    } else if (
        _val === '0814' ||
        _val === '0815' ||
        _val === '0816' ||
        _val === '0855' ||
        _val === '0856' ||
        _val === '0857' ||
        _val === '0858'
    ) {
        setImgOperator(operator?.im3?.img)
    } else if (
        _val === '0895' ||
        _val === '0896' ||
        _val === '0897' ||
        _val === '0898' ||
        _val === '0899'
    ) {
        setImgOperator(operator?.im3?.img)
    } else if (
        _val === '0817' ||
        _val === '0818' ||
        _val === '0819' ||
        _val === '0859' ||
        _val === '0877' ||
        _val === '0878' ||
        _val === '0879'
    ) {
        setImgOperator(operator?.xl?.img)
    } else if (
        _val === '0831' ||
        _val === '0838'
    ) {
        setImgOperator(operator?.axis?.img)
    } else if (
        _val === '0881' ||
        _val === '0882' ||
        _val === '0883' ||
        _val === '0884'
    ) {
        setImgOperator(operator?.smartfren?.img)
    } else {
        setImgOperator('')
    }
    await setIsValid(await schemaData.isValid({phone: val}))
}

export const isValidPLN = async (val, setPlnNumber, setIsValid) => {
    setPlnNumber(val)
    setIsValid(await schemaDataPln.isValid({pln: val}))
}

export const generateSignature = async (_uri) => {
    const httpMethod    = 'POST';
    const _time         = moment().unix();
    const pattern       = (httpMethod + ":" + _uri + ":" + _time).toUpperCase();
    const secretKey     = process.env.NEXT_PUBLIC_BE_API_KEY

    const hmacDigest0    = await Base64.stringify(hmacSHA256(pattern, secretKey))
    const hmacDigest    = await (hmacSHA256(pattern, secretKey)).toString()

    return {
        signature: hmacDigest,
        timestamp: _time
    }
}