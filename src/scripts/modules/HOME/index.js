import React, { useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/BlurCircularOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import CompanyName from '../../components/CompanyName';
import CompanySlogan from '../../components/CompanySlogan';
import ModuleContext from '../../contexts/ModuleContext';
import { useAuth } from '../../contexts/AuthContext';
import isEmptyModules from '../../utils/validations';

export default function Home() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectToLogin = useCallback(() => {
    navigate('/login', { from: location });
  }, [navigate, location]);
  const styles = {
    root: {
      padding: '24px',
      backgroundColor: '#eee',
      borderRadius: 0
    },
    linkText: {
      textDecoration: 'none',
      textTransform: 'uppercase',
      color: 'black',
      whiteSpace: 'nowrap',
      fontStyle: 'italic',
      textAlign: 'center',
    },
  };

  useEffect(() => {
    if (auth.sessionTimeout === true) {
      redirectToLogin();
    }
  }, [auth, redirectToLogin]);

  return (
    <Container maxWidth="lg">
      <Paper sx={styles.root} elevation={0}>
        <CompanyName />
        <CompanySlogan />
      </Paper>
      <Grid container mt={0} mb={5} spacing={2} alignItems="flex-start">
        {ModuleContext.map(
          ({ name, menu }, index) =>
            !isEmptyModules(ModuleContext, name) && (
              <Grid item container key={('hm_menu_items_' + name + index).toString()}>
                {/* <Typography component="h1" variant="h6" color="secondary">
                  {name}
                </Typography> */}
                <Grid item container spacing={1} mt={0.1}>
                  {menu.map(
                    ({ title, pathLocation, active }, index) =>
                      active === 'Y' && (
                        <Grid
                          item
                          xs={12}
                          md={4}
                          component={Link}
                          to={pathLocation}
                          sx={styles.linkText}
                          key={('hm_menu_title_items_' + title + pathLocation + index).toString()}
                        >
                          <Paper elevation={2} sx={{ p: 2 }}>
                            <Grid container justifyContent="space-between">
                              <MenuIcon />
                              <Typography component="h2" variant="subtitle1" ml={1}>
                                {title}
                              </Typography>
                            </Grid>
                          </Paper>
                        </Grid>
                      )
                  )}
                </Grid>
              </Grid>
            )
        )}
        <Grid item container>
          {/* <Typography component="h1" variant="h6" color="secondary">
            System
          </Typography> */}
          <Grid item container spacing={1} mt={0.1}>
            <Grid
              item
              xs={12}
              md={4}
              sx={styles.linkText}
            >
              <Paper elevation={2} sx={{ p: 2, cursor: 'pointer' }} onClick={() => auth.signout()}>
                <Grid container justifyContent="space-between">
                  <LogoutIcon />
                  <Typography component="h2" variant="subtitle1" ml={1} color="error">
                    Logout
                  </Typography>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
