import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';

export default function useResponsive() {
  const theme = useTheme();
  const xsUp = useMediaQuery(theme.breakpoints.up('xs'));
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const xlUp = useMediaQuery(theme.breakpoints.up('xl'));
  const xsDown = useMediaQuery(theme.breakpoints.down('xs'));
  const smDown = useMediaQuery(theme.breakpoints.down('sm'));
  const mdDown = useMediaQuery(theme.breakpoints.down('md'));
  const lgDown = useMediaQuery(theme.breakpoints.down('lg'));
  const xlDown = useMediaQuery(theme.breakpoints.down('xl'));

  return {
    theme,
    xsUp,
    xsDown,
    smUp,
    smDown,
    mdUp,
    mdDown,
    lgUp,
    lgDown,
    xlUp,
    xlDown,
  };
}
