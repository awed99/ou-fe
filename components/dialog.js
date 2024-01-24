import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import * as React from 'react';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export default function CustomizedDialogs({
    children,
    titleModal="Title Modal",
    ButtonDialogs=false,
    handleSubmitFunction=false,
    openModal=false,
    setOpenModal}) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setOpenModal(false)
  };

  const buttonDialogs = (handleSubmitFunction) => (
      <Button onClick={handleSubmitFunction}>
        Submit
      </Button>)

  React.useEffect(() => {
    setOpen(openModal);
  }, [openModal])

  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        fullWidth={true}
        // maxWidth={'xl'}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          {titleModal}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          {children}
        </DialogContent>
        <DialogActions>
            {
                handleSubmitFunction ? buttonDialogs(handleSubmitFunction) : (ButtonDialogs ? ButtonDialogs : buttonDialogs(handleClose))
            }
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}