import Head from 'next/head';
import { Box, Container, Grid } from '@mui/material';
import { InPrisons } from '../components/dashboard/in-prisons';
import { DashboardLayout } from '../components/dashboard-layout';
import { useEffect, useState } from 'react';
import { CityDistribution } from '../components/dashboard/cityDistribution';
import { PeopleListResults } from '../components/people-list-results';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { statusFilter } from "../atoms/statusFilter";
import { authToken } from '../atoms/authToken';
import { fetchToken } from '../lib/auth';

const Page = () => {
  const [stats, setStats] = useState([]);
  const [cityDist, setCityDist] = useState();
  const [statusFilterValue, setStatusFilterValue] = useRecoilState(statusFilter);
  const setAuthTokenValue = useSetRecoilState(authToken);
  useEffect(() => { setAuthTokenValue(fetchToken()) });
  useEffect(() => {
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': '',
        'Host': process.env.NEXT_PUBLIC_API_URL.replace("http://", "").replace("https://", ""),
      },
    };

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/stats`, options = options)
      .then(response => response.json())
      .then(data => { setStats(data); }).catch(err => console.error("error in stats", err));
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/city_dist`, options = options)
      .then(response => response.json())
      .then(data => { setCityDist(data); }).catch(err => console.error("error in city_dist", err));
  }, []);
  return (
    <>
      <Head>
        <meta name="viewport"
          content="width=device-width, initial-scale=1.0" />
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
            {stats.slice(0, 4).map(s => (<Grid
              item
              key={s.key}
              lg={3}
              sm={6}
              xs={12}
            >
              <InPrisons sx={{ border: statusFilterValue === s.key ? "inset" : "hidden", cursor: "pointer" }}
                name={s.key}
                onClick={() => { statusFilterValue === s.key ? setStatusFilterValue("") : setStatusFilterValue(s.key) }}
                value={s.doc_count} />
            </Grid>))}
            <Grid item
              md={12}
              xs={12}>
              <PeopleListResults />
            </Grid>
            <Grid
              item
              lg={8}
              md={12}
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
