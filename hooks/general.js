export const handleChangeEl = (_key, _e, values, setValues, schemaData, setErrorsField) => {
    schemaData.isValid(values)
    .then((valid) => {
        if (!valid) {
        schemaData.validate(values, { abortEarly: false }).catch((err) => {
            const _err = err.inner[0].path
            const _errorsField = {}
            _errorsField[_err] = err.inner[0].errors[0]
            setErrorsField(_errorsField)
        })
        } else {
        setErrorsField({})
        }
    })

    const _data = values
    _data[_key] = _e?.target?.value ?? _e
    setValues({..._data})
}