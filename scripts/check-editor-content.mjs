import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(repositoryRoot, relativePath), 'utf8'));
}

const [site, practiceContent, services, providers, teamData] = await Promise.all([
  readJson('src/data/site.json'),
  readJson('src/data/practice-content.json'),
  readJson('src/data/services.json'),
  readJson('src/data/providers.json'),
  readJson('src/data/modern-team.json')
]);

const errors = [];
const requireText = (value, label) => {
  if (typeof value !== 'string' || value.trim().length === 0) errors.push(`${label} is required.`);
};
const requireUnique = (values, label) => {
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  if (duplicates.length > 0) errors.push(`${label} contains duplicates: ${[...new Set(duplicates)].join(', ')}.`);
};

requireText(site.practiceName, 'Practice name');
requireText(site.phoneDisplay, 'Display phone number');
requireText(site.phoneHref, 'Click-to-call phone number');
requireText(site.contactEmail, 'Office contact email');
if (typeof site.contactEmail === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.contactEmail.trim())) {
  errors.push('Office contact email must be a valid email address.');
}
requireText(site.address?.street, 'Street address');
requireText(site.address?.city, 'City');
requireText(site.address?.state, 'State');
requireText(site.address?.postalCode, 'ZIP code');

if (!Array.isArray(site.hours) || site.hours.length !== 7) {
  errors.push('Office hours must contain exactly seven day entries.');
}
if (site.announcement?.enabled && !site.announcement?.text?.trim()) {
  errors.push('Announcement text is required when the announcement is enabled.');
}

const groups = practiceContent.servicesPage?.groups ?? [];
if (groups.length === 0) errors.push('At least one service group is required.');
const groupIds = groups.map((group) => group.id);
requireUnique(groupIds, 'Service group IDs');
for (const group of groups) {
  requireText(group.id, 'Service group ID');
  requireText(group.title, `Title for service group ${group.id || '(missing ID)'}`);
  requireText(group.summary, `Summary for service group ${group.id || '(missing ID)'}`);
  requireText(group.planning, `Planning note for service group ${group.id || '(missing ID)'}`);
}

const visibleServices = services.filter((service) => service.visible);
if (visibleServices.length === 0) errors.push('At least one visible service is required.');
requireUnique(visibleServices.map((service) => service.order), 'Visible service display orders');
requireUnique(visibleServices.map((service) => service.name.trim().toLowerCase()), 'Visible service names');
for (const service of visibleServices) {
  requireText(service.name, 'Visible service name');
  if (!groupIds.includes(service.groupId)) {
    errors.push(`Visible service "${service.name}" uses unknown groupId "${service.groupId}".`);
  }
}

const allProfiles = [...providers, ...teamData.team];
requireUnique(allProfiles.map((profile) => profile.id), 'Team and provider IDs');
const visibleProviders = providers.filter((provider) => provider.visible);
if (visibleProviders.length === 0) errors.push('At least one visible dentist profile is required.');
for (const provider of visibleProviders) {
  requireText(provider.name, `Provider name for ${provider.id}`);
  requireText(provider.role, `Provider role for ${provider.id}`);
  if (provider.status === 'sample') {
    errors.push(`Sample provider ${provider.id} cannot be visible.`);
  }
  if (!Array.isArray(provider.details) || provider.details.length === 0) {
    errors.push(`Visible provider ${provider.id} needs at least one modern biography paragraph.`);
  }
  if (!Array.isArray(provider.biography) || provider.biography.length === 0) {
    errors.push(`Visible provider ${provider.id} needs at least one classic biography paragraph.`);
  }
}
for (const member of teamData.team.filter((item) => item.visible)) {
  requireText(member.name, `Team profile name for ${member.id}`);
  requireText(member.role, `Team profile role for ${member.id}`);
  requireText(member.bio, `Team profile biography for ${member.id}`);
  if (member.status === 'sample') errors.push(`Sample team profile ${member.id} cannot be visible.`);
}

requireText(practiceContent.about?.headline, 'About-page headline');
requireText(practiceContent.about?.introduction, 'About-page introduction');
if (!Array.isArray(practiceContent.about?.storyParagraphs) || practiceContent.about.storyParagraphs.length === 0) {
  errors.push('About-page story needs at least one paragraph.');
}
requireText(practiceContent.teamPage?.headline, 'Team-page headline');
requireText(practiceContent.servicesPage?.headline, 'Services-page headline');

if (errors.length > 0) {
  console.error('Office content validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  console.error('The previous deployed site remains available; correct the editor fields and save again.');
  process.exit(1);
}

console.log(`Office content validation passed: ${visibleProviders.length} visible provider profile(s), ${teamData.team.filter((item) => item.visible).length} visible team profile(s), and ${visibleServices.length} visible service(s).`);
