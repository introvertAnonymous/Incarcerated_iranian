import Head from 'next/head';
import { Box, Container, Grid } from '@mui/material';
import { InPrisons } from '../components/dashboard/in-prisons';
import { DashboardLayout } from '../components/dashboard-layout';
import { useEffect, useState } from 'react';
import { CityDistribution } from '../components/dashboard/cityDistribution';

const Page = () => {
  const [stats, setStats] = useState([]);
  const [cityDist, setCityDist] = useState();
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

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/stats`, options = options)
      .then(response => response.json())
      .then(data => { setStats(data); });
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/city_dist`, options = options)
      .then(response => response.json())
      .then(data => { setCityDist(data); });
  }, []);
  return (
    <>
      <Head>
        <title>
          Dashboard
        </title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth={false}>
          <Grid
            container
            spacing={3}
          >
            {stats.slice(0, 3).map(s => (<Grid
              item
              key={s.key}
              lg={3}
              sm={6}
              xl={3}
              xs={12}
            >
              <InPrisons name={s.key}
                value={s.doc_count} />
            </Grid>))}
            <Grid
              item
              lg={8}
              md={12}
              xl={9}
              xs={12}
            >
              {cityDist && <CityDistribution prison={cityDist.prison}
                free={cityDist.free} />}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}

Page.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Page;
