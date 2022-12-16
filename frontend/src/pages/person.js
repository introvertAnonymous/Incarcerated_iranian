import Head from 'next/head';
import { Box, Container, Grid, Typography } from '@mui/material';
import { PersonDetails } from '../components/person-details';
import { DashboardLayout } from '../components/dashboard-layout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';


const Page = () => {
  const [values, setValues] = useState();
  const router = useRouter();
  const uri = router.query.uri;
  useEffect(() => {
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': '',
        'Host': 'localhost:8000',
      },
    };
    if (uri) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/item?uri=${uri}`, options = options)
        .then(response => response.json())
        .then(data => { setValues(data); }).catch(err => { console.error(err); setValues({ not_found: "User not found!" }) })
    }
  }, [uri])

  const name = values?.name?.en || values?.name?.fa || values?.not_found || "Loading ...";
  return <>
    <Head>
      <meta name="viewport"
        content="width=device-width, initial-scale=1.0" />
      <title>
        Person | {name}
      </title>
    </Head>
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8
      }}
    >
      <Container maxWidth="100%">
        <Typography
          sx={{ mb: 3 }}
          variant="h4"
        >
          {name}
        </Typography>
        <Grid
          container
          spacing={3}
        >
          <Grid
            item
            // lg={12}
            // md={12}
            xs={12}
          >
            {values?.name && <PersonDetails uri={uri}
              values={values} />}
          </Grid>
        </Grid>
      </Container>
    </Box>
  </>;
};

Page.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Page;
