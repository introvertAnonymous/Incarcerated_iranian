import { useState } from 'react';
import Router from 'next/router';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Snackbar,
  TextField
} from '@mui/material';

import Chip from '@mui/material/Chip';
import { Wikidata as WikidataLogo } from '../icons/wikidata'
import { TweetHistogram } from './tweetsHistogram';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { fetchToken } from '../lib/auth';



const genders = [{ id: "Q6581097", value: { en: "male", fa: "مذکر" } }, { id: "Q6581072", value: { en: "female", fa: "مؤنث" } }, { id: "unknown", value: { fa: "نامعلوم", en: "Unknown" } }]
const stauses = [{ id: "زندانی", value: { en: "In Jail", fa: "زندانی" } },
{ id: "آزاد شد", value: { en: "Free", fa: "آزاد" } },
{ id: "مفقود", value: { fa: "نامعلوم", en: "Unknown" } },
{ id: "در بازداشت کشته شد", value: { fa: "در بازداشت کشته شد", en: "Killed in prison" } },
{ id: "حکم اعدام", value: { fa: "حکم اعدام", en: "Death Penalty" } }]
const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5),
}));
export const PersonDetails = (props) => {
  const [saveSuccessOpen, setSaveSuccessOpen] = useState(false);
  const [saveFailOpen, setSaveFailsOpen] = useState(false);

  const [values, setValues] = useState(
    props.values

  );
  const [newHashtag, setNewHashtag] = useState("");

  const handleChange = (event) => {
    if (event.target.name === "englishName") {
      setValues(past => ({
        ...values,
        name: { ...(past.name || {}), en: event.target.value }
      }));
    } else if (event.target.name === "persianName") {
      setValues(past => ({
        ...values,
        name: { ...(past.name || {}), fa: event.target.value }
      }));
    } else if (event.target.name === "desctiptionEnglish") {
      setValues(past => ({
        ...values,
        description: { ...(past.description || {}), en: event.target.value }
      }));
    } else if (event.target.name === "desctiptionPersian") {
      setValues(past => ({
        ...values,
        description: { ...(past.description || {}), fa: event.target.value }
      }));
    } else if (event.target.name === "twitterUsername") {
      setValues(past => ({
        ...values,
        social_media: { ...(past.social_media || {}), twitter: event.target.value }
      }));
    } else if (event.target.name === "instagramUsername") {
      setValues(past => ({
        ...values,
        social_media: { ...(past.social_media || {}), instagram: event.target.value }
      }));
    } else if (event.target.name === "contextEnglish") {
      setValues(past => ({
        ...values,
        context: { ...(past.context || {}), en: event.target.value }
      }));
    } else if (event.target.name === "contextPersian") {
      setValues(past => ({
        ...values,
        context: { ...(past.context || {}), fa: event.target.value }
      }));
    } else if (event.target.name === "wikidata") {
      setValues(past => ({
        ...values,
        wikidata: event.target.value
      }));
    }

  };
  const changeCity = (event) => {
    const c = event.target.value;
    setValues({ ...values, city: c });
  }
  const changeGender = (event) => {
    const c = event.target.value;
    setValues({ ...values, gender: genders.find((p) => p.id === c) });

  }
  const changeStatus = (event) => {
    const c = event.target.value;
    setValues({ ...values, status: { value: c } });

  }
  const handleDelete = (data) => {
    setValues({ ...values, hashtags: values.hashtags.filter(k => k !== data) })
  }

  const handleClick = (wikidata) => {
    window.open("https://www.wikidata.org/wiki/" + wikidata);
  };
  const handleNewHashtag = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setValues(past => ({ ...past, hashtags: [...(past.hashtags || []), newHashtag] }));
      setNewHashtag("");

    }
  }
  const handleSaveClick = (status) => {
    if (status == "success") {
      setSaveSuccessOpen(true);
    } else if (status == "fail") {
      setSaveFailsOpen(true);
    }

  };

  const handleSaveClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSaveSuccessOpen(false);
    setSaveFailsOpen(false);
  };
  const handleSaveDetails = (event) => {
    if (!fetchToken()) {
      Router
        .push('/login')
        .catch(console.error);
      handleSaveClick("fail");
      return;
    }
    const options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': '',
        'Host': 'localhost:8000',
        'Authorization': `Bearer ${fetchToken()}`,
      },
      body: JSON.stringify(values)
    };
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/update`, options = options,)
      .then(response => response.json())
      .then(data => { handleSaveClick("success"); }).catch(err => { console.error(err); handleSaveClick("fail"); })
  }
  return (
    <Card>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2
        }}
      >
        <CardHeader
          subheader="The information should be updated"
          title="Profile"
        />
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <WikidataLogo sx={{ color: 'action.active', mr: 1, my: 0.5, cursor: "pointer" }}
            onClick={() => handleClick(values.wikidata)} />
          <TextField
            // fullWidth
            label="Wikidata"
            name="wikidata"
            onChange={handleChange}
            value={values?.wikidata}
            variant="outlined"
          />
        </Box>
      </Box>
      <Divider />
      <CardContent>
        <Grid
          container
          spacing={3}
        >
          <Grid
            item
            md={6}
            xs={12}
          >
            <TextField
              fullWidth
              // helperText="Full name in English"
              label="English name"
              name="englishName"
              onChange={handleChange}
              required
              value={values?.name?.en || "Unknown"}
              variant="outlined"
            />
          </Grid>
          <Grid
            item
            md={6}
            xs={12}
          >
            <TextField
              fullWidth
              // helperText="Full name in Persian"
              label="Persian name"
              name="persianName"
              onChange={handleChange}
              required
              value={values?.name?.fa || "نامعلوم"}
              variant="outlined"
            />
          </Grid>
          <Grid
            item
            md={12}
            xs={12}
          >
            <TextField
              fullWidth
              label="Description in English"
              name="desctiptionEnglish"
              multiline
              maxRows={4}
              onChange={handleChange}
              required
              value={values?.description?.en || "Unknown"}
              variant="outlined"
            />
          </Grid>
          <Grid
            item
            md={12}
            xs={12}
          >
            <TextField
              fullWidth
              label="Description in Persian"
              name="desctiptionPersian"
              multiline
              maxRows={4}
              onChange={handleChange}
              required
              value={values?.description?.fa || "Unknown"}
              variant="outlined"
            />
          </Grid>
          <Grid
            item
            md={4}
            xs={12}
          >
            <TextField
              fullWidth
              label="City"
              name="city"
              onChange={changeCity}
              // select
              SelectProps={{ native: true }}
              value={values.city || "Unknown"}
              variant="outlined"
            >
              {/* {cities.map((option) => (
                <option
                  key={option.id}
                  value={option.id}
                >
                  {option.value.fa}
                </option>
              ))} */}
            </TextField>
          </Grid>
          <Grid
            item
            md={4}
            xs={12}
          >
            <TextField
              fullWidth
              label="Gender"
              name="gender"
              onChange={changeGender}
              select
              SelectProps={{ native: true }}
              value={values?.gender?.id ? values.gender.id : "unknown"}
              variant="outlined"
            >
              {genders.map((option) => (
                <option
                  key={option.id}
                  value={option.id}
                >
                  {option.value.fa}
                </option>
              ))}
            </TextField>
          </Grid>
          <Grid
            item
            md={4}
            xs={12}
          >
            <TextField
              fullWidth
              label="Status"
              name="status"
              onChange={changeStatus}
              select
              SelectProps={{ native: true }}
              value={values?.status?.value ? values.status.value : "unknown"}
              variant="outlined"
            >
              {stauses.map((option) => (
                <option
                  key={option.id}
                  value={option.id}
                >
                  {option.value.fa}
                </option>
              ))}
            </TextField>
          </Grid>
          <Grid
            item
            md={6}
            xs={12}
          >
            <TextField
              fullWidth
              label="Twitter username"
              name="twitterUsername"
              onChange={handleChange}
              required
              value={values?.social_media?.twitter || "Unknown"}
              variant="outlined"
            />
          </Grid>
          <Grid
            item
            md={6}
            xs={12}
          >
            <TextField
              fullWidth
              label="Instagram username"
              name="instagramUsername"
              onChange={handleChange}
              required
              value={values?.social_media?.instagram || "Unknown"}
              variant="outlined"
            />
          </Grid>
          <Grid
            item
            md={12}
            xs={12}
          >
            <TextField label="New Hashtag"
              placeholder="..."
              name="newHashtag"
              onChange={(event) => setNewHashtag(event.target.value)}
              value={newHashtag}
              onKeyDown={handleNewHashtag}
              variant="outlined" />
            <Paper
              sx={{
                display: 'flex',
                justifyContent: 'left',
                flexWrap: 'wrap',
                listStyle: 'none',
                p: 0.5,
                m: 0,
              }}
              component="ul"
            >
              {values.hashtags?.map(data => <ListItem key={data}>
                <Chip
                  label={data}
                  onDelete={() => handleDelete(data)}
                />
              </ListItem>)
              }
            </Paper>
          </Grid>
          <Grid
            item
            md={12}
            xs={12}
          >
            <TweetHistogram recent_tweets_hist={values.recent_tweets_hist}
              recent_tweets_hist_verified={values.recent_tweets_hist_verified || []} />
          </Grid>
        </Grid>
      </CardContent>
      <Divider />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          p: 2
        }}
      >
        <Button
          color="primary"
          variant="contained"
          onClick={handleSaveDetails}
        >
          Save details
        </Button>
      </Box>
      <Snackbar open={saveSuccessOpen}
        autoHideDuration={6000}
        onClose={handleSaveClose}>
        <Alert onClose={handleSaveClose}
          severity="success"
          sx={{ width: '100%' }}>
          Succesfully stored in db!
        </Alert>
      </Snackbar>
      <Snackbar open={saveFailOpen}
        autoHideDuration={6000}
        onClose={handleSaveClose}>
        <Alert onClose={handleSaveClose}
          severity="error"
          sx={{ width: '100%' }}>
          Couldnt store into db. Check the console!
        </Alert>
      </Snackbar>
    </Card>
  );
};
