import Head from 'next/head';
import Router from 'next/router';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Alert, Box, Button, Container, Snackbar, TextField, Typography } from '@mui/material';
import { setToken } from '../lib/auth';
import { DashboardLayout } from '../components/dashboard-layout';
import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { authToken } from '../atoms/authToken'

const Page = () => {
  const [wrongSnack, setWrongSnack] = useState(false);
  const setAuthTokenValue = useSetRecoilState(authToken);
  const handleWrongInfoClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setWrongSnack(false);
  };
  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup
        .string()
        .email('Must be a valid email')
        .max(255)
        .required('Email is required'),
      password: Yup
        .string()
        .max(255)
        .required('Password is required')
    }),
    onSubmit: (event, actions) => {
      const options = {
        method: "POST",
        headers: { accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=&username=${event.email}&password=${event.password}&scope=&client_id=&client_secret=`
      };
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/access-token`, options = options).then(response => response.json()).then(resp => {
        if (resp.access_token) {
          setToken(resp.access_token);
          setAuthTokenValue(resp.access_token);
          Router
            .push('/')
            .catch(console.error);
        } else {
          actions.setSubmitting(false);
          setWrongSnack(true);
          actions.setErrors({ email: "Wrong email or password", password: "Wrong email or password" })
        }
      }).catch(function (error) {
        console.error(error, "error");
        actions.setSubmitting(false);
        actions.resetForm();
      });
    }
  });

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <Box
        component="main"
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexGrow: 1,
          minHeight: '100%'
        }}
      >
        <Container maxWidth="sm">
          <form onSubmit={formik.handleSubmit}>
            <Box sx={{ my: 3 }}>
              <Typography
                color="textPrimary"
                variant="h4"
              >
                Sign in
              </Typography>
            </Box>
            <Box
              sx={{
                pb: 1,
                pt: 3
              }}
            >
              <Typography
                align="center"
                color="textSecondary"
                variant="body1"
              >
                login with email address
              </Typography>
            </Box>
            <TextField
              error={Boolean(formik.touched.email && formik.errors.email)}
              fullWidth
              helperText={formik.touched.email && formik.errors.email}
              label="Email Address"
              margin="normal"
              name="email"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="email"
              value={formik.values.email}
              variant="outlined"
            />
            <TextField
              error={Boolean(formik.touched.password && formik.errors.password)}
              fullWidth
              helperText={formik.touched.password && formik.errors.password}
              label="Password"
              margin="normal"
              name="password"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="password"
              value={formik.values.password}
              variant="outlined"
            />
            <Box sx={{ py: 2 }}>
              <Button
                color="primary"
                disabled={formik.isSubmitting}
                fullWidth
                size="large"
                type="submit"
                variant="contained"
              >
                Sign In Now
              </Button>
            </Box>
          </form>
          <Snackbar open={wrongSnack}
            autoHideDuration={6000}
            onClose={handleWrongInfoClose}>
            <Alert onClose={handleWrongInfoClose}
              severity="error"
              sx={{ width: '100%' }}>
              Username or password was wrong!
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout >
    {page}
  </DashboardLayout>
);


export default Page;
