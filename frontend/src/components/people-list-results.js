import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import PerfectScrollbar from 'react-perfect-scrollbar';

import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography
} from '@mui/material';
import { fetchToken } from '../lib/auth';

export const PeopleListResults = ({ ...rest }) => {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [people, setPeople] = useState([])
  const [countPeople, setCountPeople] = useState(10);
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
    fetch(`http://localhost:8000/items/count`, options = options)
      .then(response => response.json())
      .then(data => { setCountPeople(data); })
  }, []);

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
    fetch(`http://localhost:8000/items/items?size=${limit}&offset=${page * limit}&sort=recent_tweets_count`, options = options)
      .then(response => response.json())
      .then(data => { setPeople(data); })
  }, [limit, page])

  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Card {...rest}>
      <PerfectScrollbar>
        <Box sx={{ minWidth: 1050 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Wikidata
                </TableCell>
                <TableCell>
                  Name
                </TableCell>
                <TableCell>
                  Status
                </TableCell>
                <TableCell>
                  City
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active
                    direction="asc"
                  >
                    Recent Tweets
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {people.slice(0, limit).map((person) => (
                <NextLink
                  key={person.wikidata}
                  href={"/person?wikidata=" + String(person.wikidata)}
                  passHref
                >
                  <TableRow
                    hover
                    key={person.wikidata}
                    style={{ cursor: "pointer" }}
                  >
                    <TableCell>
                      <Box
                        sx={{
                          alignItems: 'center',
                          display: 'flex'
                        }}
                      >
                        <Typography
                          color="textPrimary"
                          variant="body1"
                        >
                          {person.wikidata}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {person.name.fa}
                    </TableCell>
                    <TableCell>
                      {person.status.value || "نامعلوم"}
                    </TableCell>
                    <TableCell>
                      {person.city?.value?.fa || "نامعلوم"}
                    </TableCell>
                    <TableCell>
                      {person.recent_tweets_count}
                    </TableCell>
                  </TableRow>
                </NextLink>
              ))}
            </TableBody>

          </Table>
        </Box>
      </PerfectScrollbar>
      <TablePagination
        component="div"
        count={countPeople}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleLimitChange}
        page={page}
        rowsPerPage={limit}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card >
  );
};

