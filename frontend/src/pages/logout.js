import Head from 'next/head';
import Router from 'next/router';
import { removeToken } from '../lib/auth';
import { DashboardLayout } from '../components/dashboard-layout';

const Page = () => {
  return (
    <>
      <Head>
        <title>Logout</title>
      </Head>
      <div>{removeToken()}</div>
    </>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout >
    {page}
  </DashboardLayout>
);


export default Page;
