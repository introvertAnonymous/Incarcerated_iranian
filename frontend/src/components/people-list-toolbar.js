import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  SvgIcon, Typography
} from '@mui/material';
import Router from 'next/router';
import { Search as SearchIcon } from '../icons/search';
import { Upload as UploadIcon } from '../icons/upload';
import { Download as DownloadIcon } from '../icons/download';
import { useRecoilState } from 'recoil';
import { searchPeople } from '../atoms/searchPeople';

export const CustomerListToolbar = (props) => {
  const handleAddNewPerson = () => { Router.push('/new-person').catch(console.error); }
  const [search, setSearch] = useRecoilState(searchPeople);
  return (
    <Box {...props}>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          m: -1
        }}
      >
        <Typography
          sx={{ m: 1 }}
          variant="h4"
        >
          People
        </Typography>
        <Box sx={{ m: 1 }}>
          <Button
            startIcon={(<UploadIcon fontSize="small" />)}
            sx={{ mr: 1 }}
            disabled
          >
            Import
          </Button>
          <Button
            startIcon={(<DownloadIcon fontSize="small" />)}
            sx={{ mr: 1 }}
            disabled
          >
            Export
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={handleAddNewPerson}
          >
            Add new person
          </Button>
        </Box>
      </Box>
      <Box sx={{ mt: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ maxWidth: 500 }}>
              <TextField
                fullWidth
                value={search}
                onChange={(event) => { setSearch(event.target.value) }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SvgIcon
                        color="action"
                        fontSize="small"
                      >
                        <SearchIcon />
                      </SvgIcon>
                    </InputAdornment>
                  )
                }}
                placeholder="Search people"
                variant="outlined"

              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
