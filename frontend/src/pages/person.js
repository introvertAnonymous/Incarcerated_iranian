import Head from 'next/head';
import { Box, Container, Grid, Typography } from '@mui/material';
import { PersonDetails } from '../components/person-details';
import { DashboardLayout } from '../components/dashboard-layout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { RequireToken, fetchToken } from '../lib/auth'


const Page = () => {
  const [values, setValues] = useState();
  const router = useRouter();
  const wiki_id = router.query.wikidata;
  useEffect(() => {
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': '',
        'Host': 'localhost:8000',
        'Authorization': `Bearer ${fetchToken()}`,
      },
    };
    if (wiki_id) {
      fetch(`http://localhost:8000/items/item?wiki_id=${wiki_id}`, options = options)
        .then(response => response.json())
        .then(data => { setValues(data); })
    }
  }, [wiki_id])

  const name = values?.name?.en || values?.name?.fa || "Unknown name!";
  return <RequireToken>
    <Head>
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
      <Container maxWidth="lg">
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
            lg={8}
            md={6}
            xs={12}
          >
            {values && <PersonDetails wiki_id={wiki_id}
              values={values} />}
          </Grid>
        </Grid>
      </Container>
    </Box>
  </RequireToken>;
};

Page.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Page;
