import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type SectionHeadingProps = {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function SectionHeading({ id, eyebrow, title, description, action }: SectionHeadingProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { md: 'flex-end' },
        justifyContent: 'space-between',
        gap: 3,
      }}
    >
      <Box sx={{ maxWidth: 640 }}>
        <Typography variant="overline" sx={{ color: 'secondary.dark' }}>
          {eyebrow}
        </Typography>
        <Typography id={id} variant="h2" sx={{ fontSize: { xs: 32, md: 44 }, mt: 1, textWrap: 'balance' }}>
          {title}
        </Typography>
        {description && (
          <Typography sx={{ mt: 2, color: 'text.secondary', fontSize: 17, textWrap: 'pretty' }}>{description}</Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
