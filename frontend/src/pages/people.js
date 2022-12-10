import Head from 'next/head';
import { Box, Container } from '@mui/material';
import { PeopleListResults } from '../components/people-list-results';
import { CustomerListToolbar } from '../components/people-list-toolbar';
import { DashboardLayout } from '../components/dashboard-layout';
import { useState } from 'react';


const Page = () => {
  const [search, setSearch] = useState("");
  return (<>
    <Head>
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
        <CustomerListToolbar search={search}
          setSearch={setSearch} />
        <Box sx={{ mt: 3 }}>
          <PeopleListResults />
        </Box>
      </Container>
    </Box>
  </>)
}

Page.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Page;
