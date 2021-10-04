import React, { useEffect, useCallback } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/BlurCircularOutlined';
import CompanyName from '../../components/CompanyName';
import CompanySlogan from '../../components/CompanySlogan';
import ModuleContext from '../../contexts/ModuleContext';
import { useAuth } from '../../contexts/AuthContext';
import isEmptyModules from '../../utils/validations';

export default function Home() {
  const auth = useAuth();
  const { replace } = useHistory();
  const location = useLocation();
  const redirectToLogin = useCallback(() => {
    replace('/login', { from: location });
  }, [replace, location]);
  const styles = {
    root: {
      padding: '24px',
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
      <Paper sx={styles.root}>
        <CompanyName />
        <CompanySlogan />
      </Paper>
      <Grid container mt={2} mb={5} spacing={2} alignItems="flex-start">
        {ModuleContext.map(
          ({ name, menu }, index) =>
            !isEmptyModules(ModuleContext, name) && (
              <Grid item container key={('hm_menu_items_' + name + index).toString()}>
                <Typography component="h1" variant="h5" color="secondary">
                  {name}
                </Typography>
                <Grid item container spacing={1} mt={0.1}>
                  {menu.map(
                    ({ title, path, active }, index) =>
                      active === 'Y' && (
                        <Grid
                          item
                          xs={12}
                          md={4}
                          component={Link}
                          to={path}
                          sx={styles.linkText}
                          key={('hm_menu_title_items_' + title + path + index).toString()}
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
      </Grid>
    </Container>
  );
}
