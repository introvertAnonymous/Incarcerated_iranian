import Head from 'next/head';
import { Box, Container } from '@mui/material';
import { PeopleListResults } from '../components/people-list-results';
import { CustomerListToolbar } from '../components/people-list-toolbar';
import { DashboardLayout } from '../components/dashboard-layout';


const Page = () => {
  return (<>
    <Head>
      <meta name="viewport"
        content="width=device-width, initial-scale=1.0" />
      <title>
        People
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
        <CustomerListToolbar />
        <Box sx={{ mt: 3 }}>
          <PeopleListResults />
        </Box>
      </Container>
    </Box>
  </>)
}

Page.getLayout = (page) => (
  <DashboardLayout peoplePage={1}>
    {page}
  </DashboardLayout>
);

export default Page;
