import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import useTheme from '@mui/material/styles/useTheme';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useAuth } from '../contexts/AuthContext';
import isEmptyModules from '../utils/validations';

export default function SideDrawer({
  navLink,
  location,
  open,
  handleClick,
  handleClickAway,
}) {
  const theme = useTheme();
  const styles = {
    list: {
      width: 250,
    },
    linkText: {
      textDecoration: `none`,
      textTransform: `uppercase`,
      color: `black`,
    },
    boldText: {
      textDecoration: `none`,
      textTransform: `uppercase`,
      '& .MuiTypography-root': {
        fontWeight: 'bold',
        color: theme.palette.primary.main,
      },
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
  };
  const [state, setState] = useState({ right: false });
  const auth = useAuth();
  const authCondition = auth.loggedIn !== false && auth.sessionTimeout !== true;
  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setState({ [anchor]: open });
  };

  const sideDrawerList = (anchor) => (
    <Box sx={styles.list} role="presentation">
      <List component="nav">
        {authCondition && (
          <ListItem
            button
            component={Link}
            to={'/'}
            onClick={toggleDrawer(anchor, false)}
            onKeyDown={toggleDrawer(anchor, false)}
          >
            <ListItemText
              secondary="Beranda"
              sx={location === '/' ? styles.boldText : styles.linkText}
            />
          </ListItem>
        )}
        {authCondition &&
          navLink.map(
            ({ name, menu }, index) =>
              !isEmptyModules(navLink, name) && (
                <Box key={('sdrw' + name + index).toString()}>
                  <ClickAwayListener onClickAway={() => handleClickAway(name)}>
                    <ListItem onClick={() => handleClick(name)}>
                      <ListItemText
                        secondary={name}
                        sx={
                          menu
                            .filter((item) => item.path === location)
                            .map((item) => item.path)
                            .toString() === location
                            ? styles.boldText
                            : styles.linkText
                        }
                      />
                      {open[name] ? (
                        <ExpandLess color="secondary" />
                      ) : (
                        <ExpandMore color="primary" />
                      )}
                    </ListItem>
                  </ClickAwayListener>
                  <Collapse in={open[name]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {menu.map(
                        ({ title, path, active }, index) =>
                          active === 'Y' && (
                            <ListItem
                              button
                              component={Link}
                              to={path}
                              key={(
                                'sdrwtitle' +
                                title +
                                path +
                                index
                              ).toString()}
                              sx={styles.nested}
                              onClick={toggleDrawer(anchor, false)}
                              onKeyDown={toggleDrawer(anchor, false)}
                            >
                              <ListItemText
                                secondary={title}
                                sx={
                                  location === path
                                    ? styles.boldText
                                    : styles.linkText
                                }
                              />
                            </ListItem>
                          ),
                      )}
                    </List>
                  </Collapse>
                </Box>
              ),
          )}
        <ListItem
          button
          component={Link}
          to={authCondition ? '/' : '/login'}
          onClick={
            authCondition
              ? () => auth.signout(() => setState({ [anchor]: false }))
              : toggleDrawer(anchor, false)
          }
          onKeyDown={
            authCondition
              ? () => auth.signout(() => setState({ [anchor]: false }))
              : toggleDrawer(anchor, false)
          }
        >
          <ListItemText
            secondary={authCondition ? 'Logout' : 'Login'}
            sx={location === '/login' ? styles.boldText : styles.linkText}
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <IconButton
        edge="end"
        aria-label="menu"
        onClick={toggleDrawer('right', true)}
      >
        <MenuIcon fontSize="large" sx={{ color: '#513474' }} />
      </IconButton>
      <Drawer
        anchor="right"
        open={state.right}
        onClose={toggleDrawer('right', false)}
      >
        {sideDrawerList('right')}
      </Drawer>
    </>
  );
}
