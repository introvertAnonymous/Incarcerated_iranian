import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { AppBar, Avatar, Badge, Box, IconButton, Toolbar, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import { Bell as BellIcon } from '../icons/bell';
import { UserCircle as UserCircleIcon } from '../icons/user-circle';
import { Users as UsersIcon } from '../icons/users';
// import { AccountPopover } from './account-popover';

const DashboardNavbarRoot = styled(AppBar)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[3]
}));

export const DashboardNavbar = (props) => {
    const { onSidebarOpen, ...other } = props;
    const settingsRef = useRef(null);
    //   const [openAccountPopover, setOpenAccountPopover] = useState(false);

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
                        <IconButton sx={{ ml: 1 }} disabled>
                            <SearchIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Box sx={{ flexGrow: 1 }} />
                </Toolbar>
            </DashboardNavbarRoot>
            {/* <AccountPopover
        anchorEl={settingsRef.current}
        open={openAccountPopover}
        onClose={() => setOpenAccountPopover(false)}
      /> */}
        </>
    );
};

DashboardNavbar.propTypes = {
    onSidebarOpen: PropTypes.func
};