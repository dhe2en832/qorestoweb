import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useHistory } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Logo from '../../images/logo.svg';
import SideDrawer from './SideDrawer';
import HideOnScroll from './HideOnScroll';
import ScrollRestoration from './ScrollRestoration';

export default function Navigation({ navLink }) {
  const styles = {
    appBar: {
      backgroundColor: '#fafafa',
    },
    navBar: {
      display: 'flex',
      justifyContent: 'space-between',
      paddingLeft: 0,
    },
  };
  const [open, setOpen] = useState({});
  const location = useLocation().pathname;
  const { push } = useHistory();

  const handleClick = (param) => {
    setOpen((prevState) => {
      return { ...prevState, [param]: !prevState[param] };
    });
  };
  const handleClickAway = (param) => {
    if (open[param] === true) {
      setOpen((prevState) => {
        return { ...prevState, [param]: false };
      });
    }
  };

  const mainNav = () => {
    return (
      <>
        <IconButton aria-label="image-brand" component={Link} to="/" sx={{ mt: 0.2 }}>
          <img src={Logo} alt="csa-logo" width="30" height="30" />
        </IconButton>
        <SideDrawer
          navLink={navLink}
          location={location}
          open={open}
          handleClick={handleClick}
          handleClickAway={handleClickAway}
        />
      </>
    );
  };
  const formNav = () => {
    const splitLocation = location.split('/');
    const parentLocation = splitLocation[1];
    return (
      <Button
        onClick={() => push(`/${parentLocation}`)}
        variant="outlined"
        color="secondary"
        aria-label="button-go-back"
        size="small"
      >
        <ArrowBack fontSize="small" />
      </Button>
    );
  };
  return (
    <>
      <ScrollRestoration />
      <HideOnScroll>
        <AppBar position="fixed" sx={styles.appBar}>
          <Toolbar sx={{ my: -1 }}>
            <Container maxWidth="lg" sx={styles.navBar}>
              {location.includes('/add') || location.includes('/edit') ? formNav() : mainNav()}
            </Container>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
    </>
  );
}

Navigation.propTypes = {
  navLink: PropTypes.array.isRequired,
};
