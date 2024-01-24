import { Button } from '@mui/material'

const DefaultButton = ({props, children}) => {
    return (
        <Button color='primary' sx={{p:1, borderRadius: '20px'}} {...props}>{children}</Button>
    )
}

export default DefaultButton