import FacebookIcon from '@mui/icons-material/FacebookRounded';
import IconButton from '@mui/material/IconButton';

export const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=100064043532108';

export function FacebookLink() {
  return (
    <IconButton
      component="a"
      href={FACEBOOK_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fish World on Facebook (opens in a new tab)"
      color="inherit"
      sx={{
        width: 44,
        height: 44,
        flexShrink: 0,
        alignSelf: 'center',
        borderRadius: '50%',
        p: 0,
        color: '#FFFFFF',
        '&:hover': { color: 'secondary.light', bgcolor: 'transparent' },
      }}
    >
      <FacebookIcon sx={{ fontSize: 44 }} />
    </IconButton>
  );
}
