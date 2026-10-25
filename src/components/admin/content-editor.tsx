'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, Card, Chip, CircularProgress, Divider, Stack, TextField, Typography } from '@mui/material';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import OpenInNew from '@mui/icons-material/OpenInNew';
import { brandingSchema, businessSchema, isPageSlug, pagePath, pageSchema, type ContentSection, type ContentSnapshot, type PageSlug, type SiteContent } from '@/lib/content';
import { useAdminChanges } from './admin-shell';
import { ImageField } from './image-field';
import { readJson } from './media-library';

export const FIELD_LABELS: Record<string, string> = {
  siteName: 'Site name', tagline: 'Brand tagline', logoLight: 'Logo for light backgrounds', logoDark: 'Logo for dark backgrounds', logoAlt: 'Logo description', faviconLight: 'Browser icon for light mode', faviconDark: 'Browser icon for dark mode', faviconSvg: 'Scalable browser icon', appleIcon: 'Apple touch icon',
  phone: 'Store phone', email: 'Store email', street: 'Street address', city: 'City', state: 'State', zip: 'ZIP code', mapsUrl: 'Directions URL', footerDescription: 'Footer introduction', visitTitle: 'Visit section heading', visitDescription: 'Visit section text', hours: 'Opening hours',
  navLabel: 'Menu label', title: 'Main heading', eyebrow: 'Small text above heading', description: 'Page introduction', image: 'Main image', imageAlt: 'Main image description', seoTitle: 'Search title', seoDescription: 'Search description', primaryLabel: 'Main button text', primaryHref: 'Main button destination', secondaryLabel: 'Second button text', secondaryHref: 'Second button destination', collectionTitle: 'Shop section heading', sectionTitle: 'Content section heading', sectionIntro: 'Content section introduction', sectionImage: 'Content section image', sectionImageAlt: 'Content image description', sectionCaption: 'Content image caption', sections: 'Content cards',
};
export type EditorTarget = 'branding' | 'business' | PageSlug;
export const fetchSnapshot = async () => readJson<ContentSnapshot>(await fetch('/api/site-config', { cache: 'no-store' }));
function select(content: SiteContent, target: EditorTarget): Record<string, unknown> { return isPageSlug(target) ? content.pages[target] : content[target]; }

export function EditorCard({ title, help, children }: { title: string; help?: string; children: ReactNode }) {
  return <Card variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}><Typography variant="h6" sx={{ mb: help ? 0.5 : 3 }}>{title}</Typography>{help && <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{help}</Typography>}{children}</Card>;
}

export function ContentEditor({ target }: { target: EditorTarget }) {
  const query = useQuery({ queryKey: ['admin-content'], queryFn: fetchSnapshot, refetchOnWindowFocus: false, retry: false });
  if (query.isPending) return <CircularProgress aria-label="Loading content" />;
  if (query.error) return <Alert severity="error" action={<Button onClick={() => void query.refetch()}>Retry</Button>}>{query.error.message}</Alert>;
  return <ContentForm key={target} target={target} snapshot={query.data} />;
}

function ContentForm({ target, snapshot }: { target: EditorTarget; snapshot: ContentSnapshot }) {
  const router = useRouter();
  const client = useQueryClient();
  const { setDirty } = useAdminChanges();
  const [form, setForm] = useState<Record<string, unknown>>(() => structuredClone(select(snapshot.content, target)));
  const [message, setMessage] = useState('');
  const [reloading, setReloading] = useState(false);
  const [reloadError, setReloadError] = useState('');
  const baseline = select(snapshot.content, target);
  const changed = Object.keys(form).filter((key) => JSON.stringify(form[key]) !== JSON.stringify(baseline[key]));
  const dirty = changed.length > 0;
  const pageTarget = isPageSlug(target);
  const value = (key: string) => String(form[key] ?? '');
  const update = (key: string, next: unknown) => { setForm((current) => ({ ...current, [key]: next })); setMessage(''); };
  const fields = (keys: string[], multiline: string[] = []) => keys.map((key) => <TextField key={key} label={FIELD_LABELS[key] ?? key} value={value(key)} onChange={(event) => update(key, event.target.value)} multiline={multiline.includes(key)} minRows={multiline.includes(key) ? 3 : undefined} />);
  const imageField = (key: string, altKey?: string, help?: string, dark = false) => <ImageField key={key} label={FIELD_LABELS[key]} value={value(key)} help={help} dark={dark} onChange={(url, alt) => { setMessage(''); setForm((current) => ({ ...current, [key]: url, ...(altKey && alt ? { [altKey]: alt } : {}) })); }} />;
  const sections = (form.sections ?? []) as ContentSection[];
  const updateSection = (index: number, values: Partial<ContentSection>) => update('sections', sections.map((section, position) => position === index ? { ...section, ...values } : section));

  useEffect(() => {
    setDirty(dirty);
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    if (dirty) window.addEventListener('beforeunload', beforeUnload);
    return () => { setDirty(false); window.removeEventListener('beforeunload', beforeUnload); };
  }, [dirty, setDirty]);

  const save = useMutation({
    mutationFn: async () => {
      const validation = (target === 'branding' ? brandingSchema : target === 'business' ? businessSchema : pageSchema).safeParse(form);
      if (!validation.success) throw new Error(validation.error.issues.map((issue) => `${issue.path.map((key) => FIELD_LABELS[String(key)] ?? key).join(' → ')}: ${issue.message}`).join('\n'));
      const body = { section: pageTarget ? 'page' : target, ...(pageTarget ? { slug: target } : {}), revision: snapshot.revision, data: validation.data };
      return readJson<ContentSnapshot>(await fetch('/api/site-config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }));
    },
    onSuccess: (next) => {
      setReloadError('');
      client.setQueryData(['admin-content'], next);
      void client.invalidateQueries({ queryKey: ['admin-activity'] });
      setForm(structuredClone(select(next.content, target)));
      setMessage('Saved and published. Your changes are now on the website.');
      router.refresh();
    },
  });

  const reload = async () => {
    if (dirty && !window.confirm('Discard unsaved changes and load the latest published version?')) return;
    setReloading(true);
    setReloadError('');
    try { const next = await fetchSnapshot(); client.setQueryData(['admin-content'], next); setForm(structuredClone(select(next.content, target))); setMessage('Loaded the latest published version.'); save.reset(); }
    catch (error) { setReloadError(error instanceof Error ? error.message : 'Unable to reload content.'); }
    finally { setReloading(false); }
  };

  return <Box component="form" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }}    sx={{justifyContent: "space-between", alignItems: { sm: 'center' }, gap: 2}}>
        <Box><Typography variant="overline" color="primary.main">Site studio / {pageTarget ? 'Pages' : 'Settings'}</Typography><Typography variant="h3" sx={{ fontSize: { xs: 30, md: 38 }, mt: 0.5 }}>{pageTarget ? `${snapshot.content.pages[target].navLabel} page` : target === 'branding' ? 'Branding & logos' : 'Business details'}</Typography></Box>
        <Button href={pageTarget ? pagePath(target) : '/'} target="_blank" endIcon={<OpenInNew />} variant="outlined">View published {pageTarget ? 'page' : 'site'}</Button>
      </Stack>
      <Typography color="text.secondary">Edit the labeled fields below. Saving publishes this section immediately; other pages and settings stay as they are.</Typography>
      {!snapshot.storageAvailable && <Alert severity="error">The database is disconnected. You can review and prepare changes, but publishing is unavailable until the database connection is restored.</Alert>}
      {save.error && <Alert severity="error" sx={{ whiteSpace: 'pre-line' }} action={<Button onClick={() => void reload()} disabled={reloading}>Reload latest</Button>}>{save.error.message}</Alert>}
      {message && <Alert severity="success">{message}</Alert>}
      {reloadError && <Alert severity="error">{reloadError}</Alert>}
      <Box component="fieldset" disabled={save.isPending || reloading} sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
        <Stack spacing={3}>
          {target === 'branding' && <>
            <EditorCard title="Brand identity"><Stack spacing={2.5}>{fields(['siteName', 'tagline', 'logoAlt'])}</Stack></EditorCard>
            <EditorCard title="Your two logos" help="These names describe the background behind the logo. Check each preview before saving.">
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4 }}>
                {imageField('logoLight', undefined, 'Used on the white sticky header, other page headers, and the mobile menu.')}
                {imageField('logoDark', undefined, 'Used over the reef image on the home page and in the dark footer.', true)}
              </Box>
            </EditorCard>
            <EditorCard title="Browser & bookmark icons" help="Browser and search caches can take time to refresh after an icon changes."><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>{['faviconLight', 'faviconDark', 'faviconSvg', 'appleIcon'].map((key) => imageField(key, undefined, undefined, key === 'faviconDark'))}</Box></EditorCard>
          </>}
          {target === 'business' && <>
            <EditorCard title="Contact & location" help="These details appear in the public header, footer, and contact sections. Buttons using your current phone, email, or directions link update too."><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>{fields(['phone', 'email', 'street', 'city', 'state', 'zip', 'mapsUrl'])}</Box></EditorCard>
            <EditorCard title="Store hours"><Stack spacing={2}>{(form.hours as SiteContent['business']['hours']).map((entry, index, hours) => <TextField key={entry.day} label={entry.day} value={entry.hours} helperText="For example: 12:00 PM – 4:00 PM, or Closed" onChange={(event) => update('hours', hours.map((day, position) => position === index ? { ...day, hours: event.target.value } : day))} />)}</Stack></EditorCard>
            <EditorCard title="Visit section & footer"><Stack spacing={2.5}>{fields(['visitTitle', 'visitDescription', 'footerDescription'], ['visitDescription', 'footerDescription'])}</Stack></EditorCard>
          </>}
          {pageTarget && <>
            <EditorCard title="Page introduction" help="The first content visitors see when opening this page."><Stack spacing={2.5}>{fields(['navLabel', 'eyebrow', 'title', 'description'], ['description'])}{imageField('image', 'imageAlt')}{fields(['imageAlt'])}</Stack></EditorCard>
            <EditorCard title="Page buttons" help="Use a site path such as /contact or /livestock, or a complete HTTPS address. Clear a button’s text to hide it."><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>{fields(['primaryLabel', 'primaryHref', 'secondaryLabel', 'secondaryHref'])}</Box></EditorCard>
            <EditorCard title="Content section"><Stack spacing={2.5}>{target === 'home' && fields(['collectionTitle'])}{fields(['sectionTitle', 'sectionIntro'], ['sectionIntro'])}{imageField('sectionImage', 'sectionImageAlt')}{fields(['sectionImageAlt', 'sectionCaption'])}</Stack></EditorCard>
            <EditorCard title={target === 'livestock' ? 'Store categories' : 'Content cards'} help={target === 'livestock' ? 'These categories also power the home page shop cards and category filters. Editing the title keeps the existing category link working.' : 'Add, edit, or reorder the cards that appear in this page’s content section.'}>
              <Stack spacing={3}>{sections.map((section, index) => <Box key={section.id} sx={{ p: 2.5, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                <Stack direction="row"    sx={{mb: 2, flexWrap: "wrap", gap: 1, alignItems: "center"}}><Typography  sx={{flexGrow: 1, fontWeight: 700}}>Card {index + 1}</Typography><Button size="small" disabled={index === 0} onClick={() => { const next = [...sections]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; update('sections', next); }}>Move up</Button><Button size="small" disabled={index === sections.length - 1} onClick={() => { const next = [...sections]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; update('sections', next); }}>Move down</Button><Button size="small" color="error" onClick={() => update('sections', sections.filter((_, position) => position !== index))}>Remove</Button></Stack>
                <Stack spacing={2.5}>
                  <TextField label="Card heading" value={section.title} onChange={(event) => updateSection(index, { title: event.target.value })} />
                  <TextField label="Card text" multiline minRows={3} value={section.body} onChange={(event) => updateSection(index, { body: event.target.value })} />
                  <ImageField label="Card image" value={section.image} onChange={(url, alt) => updateSection(index, { image: url, ...(alt ? { imageAlt: alt } : {}) })} />
                  <TextField label="Card image description" value={section.imageAlt} onChange={(event) => updateSection(index, { imageAlt: event.target.value })} />
                  <TextField label="Card link text (optional)" value={section.linkLabel} onChange={(event) => updateSection(index, { linkLabel: event.target.value })} />
                  <TextField label="Card link destination" value={section.linkHref} onChange={(event) => updateSection(index, { linkHref: event.target.value })} />
                </Stack>
              </Box>)}</Stack>
              <Button sx={{ mt: 3 }} variant="outlined" disabled={sections.length >= 40} onClick={() => update('sections', [...sections, { id: `section-${crypto.randomUUID().slice(0, 8)}`, title: 'New section', body: '', image: '', imageAlt: '', linkLabel: '', linkHref: '' }])}>Add content card</Button>
            </EditorCard>
            <EditorCard title="Search appearance" help="Used in this page’s browser title and search description."><Stack spacing={2.5}>{fields(['seoTitle', 'seoDescription'], ['seoDescription'])}<Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}><Typography color="primary"  sx={{fontWeight: 700}}>{value('seoTitle') || value('title')} | {snapshot.content.branding.siteName}</Typography><Typography variant="body2" color="text.secondary">{value('seoDescription') || value('description')}</Typography></Box></Stack></EditorCard>
          </>}
        </Stack>
      </Box>
      <Box sx={{ position: 'sticky', bottom: 12, zIndex: 5, bgcolor: 'background.paper', p: 2.5, borderRadius: 3, border: 1, borderColor: dirty ? 'primary.main' : 'divider', boxShadow: '0 8px 30px rgba(11,38,49,.1)' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }}    sx={{justifyContent: "space-between", gap: 2, alignItems: { sm: 'center' }}}><Box><Typography  sx={{fontWeight: 700}}>{dirty ? `${changed.length} ${changed.length === 1 ? 'field' : 'fields'} changed` : 'No unpublished changes'}</Typography><Typography variant="caption" color="text.secondary">{snapshot.updatedAt ? `Last saved ${new Date(snapshot.updatedAt).toLocaleString()}` : 'Showing the original site content'}</Typography></Box><Stack direction="row"  sx={{gap: 1}}><Button onClick={() => void reload()} disabled={save.isPending || reloading}>Discard changes</Button><Button type="submit" startIcon={<SaveOutlined />} variant="contained" disabled={!dirty || !snapshot.storageAvailable || save.isPending || reloading}>{save.isPending ? 'Publishing…' : 'Save & publish'}</Button></Stack></Stack>
        {dirty && <><Divider sx={{ my: 1.5 }} /><Stack direction="row"   sx={{flexWrap: "wrap", gap: 0.75}}>{changed.map((key) => <Chip key={key} size="small" label={FIELD_LABELS[key] ?? key} />)}</Stack></>}
      </Box>
    </Stack>
  </Box>;
}
