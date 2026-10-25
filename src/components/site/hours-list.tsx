'use client';

import { useSyncExternalStore } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { HOURS } from '@/lib/site';
import { useSiteContent } from './content-provider';

const noopSubscribe = () => () => {};

function getStoreDayIndex() {
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'America/New_York' }).format(new Date());
  return HOURS.findIndex((h) => h.day === weekday);
}

export function useStoreDayIndex() {
  return useSyncExternalStore(noopSubscribe, getStoreDayIndex, () => -1);
}

export function HoursList() {
  const today = useStoreDayIndex();
  const { business } = useSiteContent();

  return (
    <Box component="dl" sx={{ m: 0, display: 'flex', flexDirection: 'column' }}>
      {business.hours.map((h) => {
        const isToday = h.day === HOURS[today]?.day;
        return (
          <Box
            key={h.day}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              py: 1.25,
              borderBottom: 1,
              borderColor: 'divider',
              fontWeight: isToday ? 700 : 400,
            }}
          >
            <Box component="dt" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {h.day}
              {isToday && <Chip label="Today" size="small" color="secondary" />}
            </Box>
            <Box component="dd" sx={{ m: 0, color: isToday ? 'text.primary' : 'text.secondary' }}>
              {h.hours}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
