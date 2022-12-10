import Head from 'next/head';
import { Box, Container, Grid } from '@mui/material';
import { InPrisons } from '../components/dashboard/in-prisons';
import { DashboardLayout } from '../components/dashboard-layout';

const Page = () => (
  <>
    <Head>
      <title>
        Dashboard | Incarcerated
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
          <Grid
            item
            lg={3}
            sm={6}
            xl={3}
            xs={12}
          >
            <InPrisons />
          </Grid>
          <Grid
            item
            xl={3}
            lg={3}
            sm={6}
            xs={12}
          >
            <InPrisons />
          </Grid>
          <Grid
            item
            xl={3}
            lg={3}
            sm={6}
            xs={12}
          >
            <InPrisons />
          </Grid>

        </Grid>
      </Container>
    </Box>
  </>
);

Page.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Page;
