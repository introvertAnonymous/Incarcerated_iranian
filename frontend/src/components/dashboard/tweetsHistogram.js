import { Bar } from 'react-chartjs-2';
import { Box, Button, Card, CardContent, CardHeader, Divider, useTheme } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

const raw_data = {
  "recent_tweets_hist": [
    {
      "start": "2022-11-26T11:04:50+00:00",
      "end": "2022-11-27T00:00:00+00:00",
      "tweet_count": 5
    },
    {
      "start": "2022-11-27T00:00:00+00:00",
      "end": "2022-11-28T00:00:00+00:00",
      "tweet_count": 7
    },
    {
      "start": "2022-11-28T00:00:00+00:00",
      "end": "2022-11-29T00:00:00+00:00",
      "tweet_count": 343
    },
    {
      "start": "2022-11-29T00:00:00+00:00",
      "end": "2022-11-30T00:00:00+00:00",
      "tweet_count": 72
    },
    {
      "start": "2022-11-30T00:00:00+00:00",
      "end": "2022-12-01T00:00:00+00:00",
      "tweet_count": 16
    },
    {
      "start": "2022-12-01T00:00:00+00:00",
      "end": "2022-12-02T00:00:00+00:00",
      "tweet_count": 9
    },
    {
      "start": "2022-12-02T00:00:00+00:00",
      "end": "2022-12-03T00:00:00+00:00",
      "tweet_count": 4
    },
    {
      "start": "2022-12-03T00:00:00+00:00",
      "end": "2022-12-03T11:04:50+00:00",
      "tweet_count": 3
    }
  ],
  "recent_tweets_hist_verified": [
    {
      "start": "2022-11-26T11:04:50+00:00",
      "end": "2022-11-27T00:00:00+00:00",
      "tweet_count": 0
    },
    {
      "start": "2022-11-27T00:00:00+00:00",
      "end": "2022-11-28T00:00:00+00:00",
      "tweet_count": 0
    },
    {
      "start": "2022-11-28T00:00:00+00:00",
      "end": "2022-11-29T00:00:00+00:00",
      "tweet_count": 2
    },
    {
      "start": "2022-11-29T00:00:00+00:00",
      "end": "2022-11-30T00:00:00+00:00",
      "tweet_count": 0
    },
    {
      "start": "2022-11-30T00:00:00+00:00",
      "end": "2022-12-01T00:00:00+00:00",
      "tweet_count": 0
    },
    {
      "start": "2022-12-01T00:00:00+00:00",
      "end": "2022-12-02T00:00:00+00:00",
      "tweet_count": 0
    },
    {
      "start": "2022-12-02T00:00:00+00:00",
      "end": "2022-12-03T00:00:00+00:00",
      "tweet_count": 0
    },
    {
      "start": "2022-12-03T00:00:00+00:00",
      "end": "2022-12-03T11:04:50+00:00",
      "tweet_count": 0
    }
  ]
}
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export const TweetHistogram = ({ recent_tweets_hist_verified, recent_tweets_hist, ...props }) => {
  const theme = useTheme();

  const data = {
    datasets: [
      {
        backgroundColor: '#3F51B5',
        barPercentage: 0.5,
        barThickness: 12,
        borderRadius: 4,
        categoryPercentage: 0.5,
        data: recent_tweets_hist_verified.map(p => p.tweet_count),
        label: `Verified tweets [${recent_tweets_hist_verified.reduce((a, b) => a + b.tweet_count, 0)}]`,
        maxBarThickness: 10
      },
      {
        backgroundColor: '#EEEEEE',
        barPercentage: 0.5,
        barThickness: 12,
        borderRadius: 4,
        categoryPercentage: 0.5,
        data: recent_tweets_hist.map(p => p.tweet_count),
        label: `All tweets [${recent_tweets_hist.reduce((a, b) => a + b.tweet_count, 0)}]`,
        maxBarThickness: 10
      }
    ],
    labels: recent_tweets_hist.map(p => { const d = new Date(p.start); return d.getDate() + " " + months[d.getMonth()]; })
  };

  const options = {
    animation: false,
    cornerRadius: 20,
    layout: { padding: 0 },
    legend: { display: false },
    maintainAspectRatio: false,
    responsive: true,
    xAxes: [
      {
        ticks: {
          fontColor: theme.palette.text.secondary
        },
        gridLines: {
          display: false,
          drawBorder: false
        }
      }
    ],
    yAxes: [
      {
        ticks: {
          fontColor: theme.palette.text.secondary,
          beginAtZero: true,
          min: 0
        },
        gridLines: {
          borderDash: [2],
          borderDashOffset: [2],
          color: theme.palette.divider,
          drawBorder: false,
          zeroLineBorderDash: [2],
          zeroLineBorderDashOffset: [2],
          zeroLineColor: theme.palette.divider
        }
      }
    ],
    tooltips: {
      backgroundColor: theme.palette.background.paper,
      bodyFontColor: theme.palette.text.secondary,
      borderColor: theme.palette.divider,
      borderWidth: 1,
      enabled: true,
      footerFontColor: theme.palette.text.secondary,
      intersect: false,
      mode: 'index',
      titleFontColor: theme.palette.text.primary
    }
  };

  return (
    <Card {...props}>
      <CardHeader
        action={(
          <Button
            endIcon={<ArrowDropDownIcon fontSize="small" />}
            size="small"
          >
            {"Last " + recent_tweets_hist.length + " days"}
          </Button>
        )}
        title="Recent Tweet histogram"
      />
      <Divider />
      <CardContent>
        <Box
          sx={{
            height: 400,
            position: 'relative'
          }}
        >
          <Bar
            data={data}
            options={options}
          />
        </Box>
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
          endIcon={<ArrowRightIcon fontSize="small" />}
          size="small"
        >
          Overview
        </Button>
      </Box>
    </Card>
  );
};
