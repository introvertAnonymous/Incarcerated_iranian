import { useEffect, useState } from 'react';
import NextLink from 'next/link';

import {
  Box,
  Card,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import { useRecoilState, useRecoilValue } from 'recoil';
import { searchPeople } from '../atoms/searchPeople';
import { statusFilter } from '../atoms/statusFilter';
import { tagFilter } from '../atoms/tagFilter';

export const PeopleListResults = ({ ...rest }) => {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [people, setPeople] = useState([])
  const [countPeople, setCountPeople] = useState(10);
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortColumn, setSortColumn] = useState("recent_tweets_count");
  const search = useRecoilValue(searchPeople);
  const statusFilterValue = useRecoilValue(statusFilter);
  const [tagFilterValue, setTagFilterValue] = useRecoilState(tagFilter);
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
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/count?search=${search}`, options = options)
      .then(response => response.json())
      .then(data => { setCountPeople(data); }).catch(err => console.error("error in count", err));
  }, [search]);

  useEffect(() => {
    const options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': '',
        'Host': process.env.NEXT_PUBLIC_API_URL.replace("http://", "").replace("https://", ""),
      },
      body: JSON.stringify({ offset: page * limit, sort: sortColumn, asc: sortDirection == "asc", search: search, status_filter: statusFilterValue, tag_filter: tagFilterValue })
    };
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/items?size=${limit}`, options = options)
      .then(response => response.json())
      .then(data => { setPeople(data); }).catch(err => console.error("error in items", err))
  }, [limit, page, sortDirection, search, sortColumn, statusFilterValue, tagFilterValue])
  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeSortDirection = (sortKey) => {
    setSortColumn(sortKey)
    if (sortDirection == "asc") {
      setSortDirection("desc")
    } else {
      setSortDirection("asc")
    }

  }

  return (
    <Card {...rest}>
      <TableContainer>
        <Box sx={{ minWidth: 1050 }}>
          <Table size='medium'>
            <TableHead>
              <TableRow>
                <TableCell>
                  Name
                </TableCell>
                <TableCell>
                  Status
                </TableCell>
                <TableCell>
                  City
                </TableCell>
                <TableCell onClick={() => handleChangeSortDirection("decision")}>
                  <TableSortLabel
                    active={sortColumn === "decision"}
                    direction={sortDirection}
                  >
                    Decision
                  </TableSortLabel>
                </TableCell>
                <TableCell onClick={() => handleChangeSortDirection("conviction")}>
                  <TableSortLabel
                    active={sortColumn === "conviction"}
                    direction={sortDirection}
                  >
                    Conviction
                  </TableSortLabel>
                </TableCell>
                <TableCell onClick={() => handleChangeSortDirection("tags")}>
                  <TableSortLabel active={sortColumn === "tags"}
                    direction={sortDirection}>
                    Tags
                  </TableSortLabel>
                </TableCell>
                <TableCell onClick={() => handleChangeSortDirection("recent_tweets_count")}>
                  <TableSortLabel
                    active={sortColumn === "recent_tweets_count"}
                    direction={sortDirection}
                  >
                    Recent Tweets
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {people.slice(0, limit).map((person) => (
                <NextLink
                  key={person.uri}
                  href={"/person?uri=" + String(person.uri)}
                  passHref
                >
                  <TableRow
                    hover
                    key={person.uri}
                    style={{ cursor: "pointer" }}
                  >
                    <TableCell>
                      {person.name.en ? person.name.en + " - " + person.name.fa : person.name.fa}
                    </TableCell>
                    <TableCell>
                      {person.status.value || "-"}
                    </TableCell>
                    <TableCell>
                      {person.city || "-"}
                    </TableCell>
                    <TableCell>
                      {person.decision || "-"}
                    </TableCell>
                    <TableCell>
                      {person.conviction || "-"}
                    </TableCell>
                    <TableCell>
                      {(person.tags || []).map((tag) => (<Chip key={tag}
                        onClick={(event) => { event.preventDefault(); tagFilterValue === tag ? setTagFilterValue("") : setTagFilterValue(tag); }}
                        label={tag}
                        sx={{ zIndex: 999 }}
                        variant={tagFilterValue === tag ? "filled" : "outlined"} />))}
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
      </TableContainer>
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

