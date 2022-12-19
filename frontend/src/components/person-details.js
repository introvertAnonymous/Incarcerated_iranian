import { useEffect, useState } from 'react';
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
  IconButton,
  Snackbar,
  TextField,
  Typography
} from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { DatePicker } from "jalali-react-datepicker";

import Chip from '@mui/material/Chip';
import { Wikidata as WikidataLogo } from '../icons/wikidata'
import { TweetHistogram } from './tweetsHistogram';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { fetchToken } from '../lib/auth';
import { TwitterTweetEmbed } from 'react-twitter-embed';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { genders, stauses } from "./constants"



const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

export const PersonDetails = (props) => {
  const [saveSuccessOpen, setSaveSuccessOpen] = useState(false);
  const [saveFailOpen, setSaveFailsOpen] = useState(false);
  const [tweetsId, setTweetsId] = useState([]);
  // const [dete, setValue] = useState('2014-08-18T21:11:54');

  const [values, setValues] = useState(
    props.values

  );
  if (props.values?.uri !== values?.uri) {
    setValues(props.values)
  }

  const [newHashtag, setNewHashtag] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newTweet, setNewTweet] = useState("");

  const handleDetentionDatetime = (value) => { setValues({ ...values, detention_datetime: value }) }
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
    } else {
      setValues({
        ...values,
        [event.target.name]: event.target.value
      });
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
  const handleDeleteHashtag = (data) => {
    setValues({ ...values, hashtags: values.hashtags?.filter(k => k !== data) })
  }
  const handleDeleteTag = (data) => {
    setValues({ ...values, tags: values.tags?.filter(k => k !== data) })
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

  const handleNewTag = (event) => {
    if (event.key === "Enter") {
      try {
        event.preventDefault();
      } catch { }
      setValues(past => ({ ...past, tags: Array.from(new Set([...(past.tags || []), newTag])) }));
      setNewTag("");
    }
  }

  const handleNext = () => {
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': '',
        'Host': process.env.NEXT_PUBLIC_API_URL.replace("http://", "").replace("https://", ""),
      },
    };
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/next_item?uri=${values.uri}`, options = options)
      .then(response => response.json())
      .then(data => { Router.push(`/person?uri=${data.uri}`) }).catch(err => { console.error(err); })
  }
  const handleAddNewTweet = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      let t_id = newTweet;
      if (Number.isNaN(Number(newTweet))) {
        t_id = newTweet.split("/")[newTweet.split("/").length - 1];
        if (Number.isNaN(Number(t_id))) {
          console.error("newTweet is not a valid link or tweet id!", newTweet);
        }
      }
      setValues(past => ({ ...past, tweets: [...(past.tweets || []), t_id] }));
      setNewTweet("");

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
        'Host': process.env.NEXT_PUBLIC_API_URL.replace("http://", "").replace("https://", ""),
        'Authorization': `Bearer ${fetchToken()}`,
      },
      body: JSON.stringify({ ...values, detention_datetime: values.detention_datetime ? new Date(new Date(values.detention_datetime).setHours(12)) : null })
    };
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/update`, options = options,)
      .then(response => response.json())
      .then(data => { handleSaveClick("success"); }).catch(err => { console.error(err); handleSaveClick("fail"); })
  }
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
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/tweets/hashtag_tweets?query=(${values.hashtags.join(" OR ")})&limit=10`, options = options)
      .then(response => response.json())
      .then(data => { setTweetsId(data); }).catch(err => { console.error(err); })
  }, [values.hashtags])
  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'start',
      flexDirection: "row",
    }}>
      <Box
        maxWidth={"md"}
        xl={3}
        lg={4}
        sm={6}
        xs={12}>
        <Card>
          <Box
            xl={3}
            lg={4}
            sm={6}
            xs={12}
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
              spacing={1}
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
                // md={6}
                xs={12}
              >
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-detail"
                    id="accordion-details"
                  >
                    <Typography>Details</Typography>
                  </AccordionSummary><AccordionDetails>
                    <Grid
                      container
                      spacing={3}
                    >
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
                        md={3}
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
                        </TextField>
                      </Grid>
                      <Grid
                        item
                        md={3}
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
                        md={3}
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
                        md={3}
                        xs={12}
                      >
                        <TextField
                          fullWidth
                          label="Age"
                          name="age"
                          onChange={handleChange}
                          required
                          value={values?.age || "Unknown"}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid
                        item
                        md={3}
                        xs={12}
                      >
                        <DesktopDatePicker
                          label="Detention date"
                          inputFormat="MM/dd/yyy"
                          value={values.detention_datetime}
                          onChange={handleDetentionDatetime}
                          renderInput={(params) => <TextField {...params} />}
                        />
                      </Grid>
                      <Grid
                        item
                        md={3}
                        xs={12}
                      >
                        <DatePicker
                          timePicker={false}
                          label="تاریخ بازداشت"
                          value={values.detention_datetime ? new Date(values.detention_datetime) : undefined}
                          onClickSubmitButton={(event) => { handleDetentionDatetime(event.value._d) }}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>
              <Grid
                item
                xs={12}
              >
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-tweet-hist"
                    id="tweet-hashtags-accordion"
                  >
                    <Typography>Tags</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextField label="Tags"
                      placeholder="..."
                      name="tags"
                      onChange={(event) => setNewTag(event.target.value)}
                      value={newTag}
                      onKeyDown={handleNewTag}
                      variant="outlined" />
                    <IconButton color="primary"
                      onClick={() => handleNewTag({ key: "Enter" })}
                      aria-label="Example">
                      <AddIcon />
                    </IconButton>
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
                      {values.tags?.map(data => <ListItem key={data}>
                        <Chip
                          label={data}
                          onDelete={() => handleDeleteTag(data)}
                        />
                      </ListItem>)
                      }
                    </Paper>
                  </AccordionDetails>
                </Accordion>
              </Grid>
              <Grid
                item
                xs={12}
              >
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-tweet-hist"
                    id="tweet-hashtags-accordion"
                  >
                    <Typography>Twitter Hashtags</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
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
                          onDelete={() => handleDeleteHashtag(data)}
                        />
                      </ListItem>)
                      }
                    </Paper>
                  </AccordionDetails>
                </Accordion>
              </Grid>
              <Grid
                item
                // md={6}
                xs={12}
              >
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="tweet-hist-accordion"
                  >
                    <Typography>Tweets Histogram</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TweetHistogram recent_tweets_hist={values.recent_tweets_hist?.slice(-7) || []}
                      recent_tweets_hist_verified={values.recent_tweets_hist_verified?.slice(-7) || []} />
                  </AccordionDetails>
                </Accordion>
              </Grid>
              <Grid
                item
                xs={12}
              >
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-tweets"
                    id="tweets-header"
                  >
                    <Typography>Tweets</Typography>
                  </AccordionSummary>

                  <AccordionDetails>
                    <TextField
                      fullWidth
                      label="Add related tweet"
                      name="tweets"
                      onChange={(event) => { setNewTweet(event.target.value) }}
                      onKeyDown={handleAddNewTweet}
                      required
                      value={newTweet}
                      variant="outlined"
                    />
                    <Box
                      md={6}
                      xs={12}
                      // maxWidth="100%"
                      sx={{ display: 'flex', flexGrow: 1, flexDirection: "row", justifyContent: "space-between" }}>
                      {(values.tweets || []).map(tid => <Grid item
                        md={6}
                        xs={12}
                        key={tid}><TwitterTweetEmbed
                          tweetId={tid} /> </Grid>)}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Grid>
              {/* <Grid
                item
                xs={12}
              >
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-news"
                    id="news-header"
                  >
                    <Typography>News</Typography>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      p: 2,
                      flexDirection: "row"
                    }}
                    >
                      <TextField
                        sx={{ width: "20%" }}
                        label="News title"
                        name="news-title"
                        // onChange={(event) => { setNewTweet(event.target.value) }}
                        // onKeyDown={handleAddNewTweet}
                        // value={newTweet}
                        variant="outlined"
                      />
                      <TextField
                        sx={{ width: "60%" }}
                        label="News link"
                        name="news-link"
                        // onChange={(event) => { setNewTweet(event.target.value) }}
                        // onKeyDown={handleAddNewTweet}
                        // value={newTweet}
                        variant="outlined"
                      />

                      <IconButton color="primary"
                        aria-label="Example">
                        <AddIcon />
                      </IconButton>
                    </Box>
                    <Box
                      md={6}
                      xs={12}
                      // maxWidth="100%"
                      sx={{ display: 'flex', flexGrow: 1, flexDirection: "row", justifyContent: "space-between" }}>
                      {(values.tweets || []).map(tid => <Grid item
                        md={6}
                        xs={12}
                        key={tid}><TwitterTweetEmbed
                          tweetId={tid} /> </Grid>)}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Grid> */}
            </Grid>
          </CardContent>
          <Divider />
          <Box
            xl={3}
            lg={4}
            sm={6}
            xs={12}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              p: 2,
              flexDirection: "row"
            }}
          >
            <Button variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForwardIosIcon />}>
              Next
            </Button>
            <Button
              color="primary"
              variant="contained"
              onClick={handleSaveDetails}
              endIcon={<SaveIcon />}
            >
              Save
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
              Could not store into db. Check the console!
            </Alert>
          </Snackbar>
        </Card>
      </Box>
      <Box
        // minWidth={"lg"}
        // xl={4}
        // lg={8}
        // sm={6}
        xs={12}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start',
          flexDirection: "row",
          flexWrap: "wrap",
          marginLeft: 5,
          width: "100%"
        }}>
        {tweetsId.map(tid => <Grid item
          xl="auto"
          lg="auto"
          sm={12}
          xs={12}
          sx={{ minWidth: "100px" }}
          key={tid}><TwitterTweetEmbed
            tweetId={tid}
          /></Grid>)}
      </Box>
    </Box>
  );
};
