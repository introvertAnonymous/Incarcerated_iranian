import { useEffect, useState } from 'react';
import Router from 'next/router';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { ClickAwayListener } from '@mui/base';
import { AppBar, Box, IconButton, InputBase, List, ListItem, ListItemButton, ListItemText, TextField, Toolbar, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import { peopleList } from '../atoms/peopleList';
import { useRecoilState, } from 'recoil';
import { searchPeople } from '../atoms/searchPeople';

const DashboardNavbarRoot = styled(AppBar)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[3]
}));

export const DashboardNavbar = (props) => {
    const { onSidebarOpen, ...other } = props;
    const [peopleListValue, setPeopleListValue] = useRecoilState(peopleList);
    const [searchValue, setSearchValue] = useRecoilState(searchPeople)
    const [hideSearchPane, setHideSearchPane] = useState(false);
    useEffect(() => {
        if (searchValue) {
            const options = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Origin': '',
                    'Host': process.env.NEXT_PUBLIC_API_URL.replace("http://", "").replace("https://", ""),
                },
                body: JSON.stringify({ search: searchValue })
            };
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/items?size=5`, options = options)
                .then(response => response.json())
                .then(data => { setPeopleListValue(data); })
        } else {
            setPeopleListValue([])
        }
    }, [searchValue])

    return (
        <>
            <DashboardNavbarRoot
                sx={{
                    left: {
                        lg: 280
                    },
                    width: {
                        lg: 'calc(100% - 280px)'
                    }
                }}
                {...other}>
                <Toolbar
                    disableGutters
                    sx={{
                        minHeight: 64,
                        left: 0,
                        px: 2
                    }}
                >
                    <IconButton
                        onClick={onSidebarOpen}
                        sx={{
                            display: {
                                xs: 'inline-flex',
                                lg: 'none'
                            }
                        }}
                    >
                        <MenuIcon fontSize="small" />
                    </IconButton>
                    <Tooltip title="Search">
                        <IconButton sx={{ ml: 1 }} >
                            <SearchIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    {!props.peoplepage &&
                        <InputBase
                            sx={{ ml: 1, flex: 1 }}
                            placeholder="Search People"
                            onKeyDown={(event) => { if (event.key === "ArrowDown") { setHideSearchPane(false) } }}
                            value={searchValue}
                            onChange={event => { setSearchValue(event.target.value); setHideSearchPane(false); }}
                            inputProps={{ 'aria-label': 'search people' }}
                        />}
                    {/* <Box sx={{ flexGrow: 1 }} /> */}
                </Toolbar>
                {!props.peoplepage && (peopleListValue || []).length > 0 && <ClickAwayListener onClickAway={() => { setHideSearchPane(true) }}>
                    <List sx={{ width: '100%' }}>
                        {!hideSearchPane && peopleListValue.map(d => (<ListItem key={d.uri}
                            component="div"
                            disablePadding>
                            <ListItemButton onClick={() => { Router.push(`/person?uri=${d.uri}`).catch(console.error); setHideSearchPane(true); }}>
                                <ListItemText sx={{ color: "black" }}
                                    primary={d?.name?.fa || ""} />
                            </ListItemButton>
                        </ListItem>))}</List></ClickAwayListener>}
            </DashboardNavbarRoot>
        </>
    );
};

DashboardNavbar.propTypes = {
    onSidebarOpen: PropTypes.func
};