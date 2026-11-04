import { useEffect, useMemo, useState } from 'react';
import {
  FiArrowLeft,
  FiCalendar,
  FiCheck,
  FiChevronRight,
  FiClipboard,
  FiExternalLink,
  FiEye,
  FiFileText,
  FiSearch,
  FiShield,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import BrandLogo from '../components/BrandLogo';
import './RegistrationManagement.css';

type Category = 'school' | 'university';
type RegistrationRecord = Record<string, unknown>;

type RegistrationPageProps = {
  onBack: () => void;
  onLogout: () => void;
};

type FieldEntry = {
  key: string;
  label: string;
  value: string;
};

const normalizeKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const getFieldEntry = (record: RegistrationRecord, aliases: string[]): FieldEntry | undefined => {
  const keys = Object.keys(record);
  for (const alias of aliases) {
    const key = keys.find((candidate) => normalizeKey(candidate) === normalizeKey(alias));
    if (key) {
      const value = formatValue(record[key]);
      if (value) return { key, label: key, value };
    }
  }
  return undefined;
};

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return /^(n\/a|none)$/i.test(trimmed) ? '' : trimmed;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value instanceof Date) return value.toLocaleString();
  return JSON.stringify(value);
};

const getValue = (record: RegistrationRecord, aliases: string[]) =>
  getFieldEntry(record, aliases)?.value ?? '';

const registrationCategoryMatches = (record: RegistrationRecord, category: Category) => {
  const value = getValue(record, ['Category', 'Registration Type', 'category', 'registrationType']).toLowerCase();
  return category === 'school' ? value.includes('school') : value.includes('university');
};

const formatDate = (value: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isSafeExternalUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

const parseMembers = (value: string) => {
  if (!value) return [];
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const parts = line.replace(/^\d+\.\s*/, '').split('|').map((part) => part.trim());
    if (parts.length < 2) return { name: '', details: [], raw: line };
    const details: [string, string][] = [
      ['Grade / Year', parts[1]],
      ['WhatsApp', parts[2]],
      ['Institution', parts[3]],
    ];
    details.push(...parts.slice(4).map((part, index): [string, string] => [`Additional detail ${index + 1}`, part]));
    return {
      name: parts[0] || 'Team member',
      details: details.filter(([, detail]) => Boolean(detail && detail !== '-')),
      raw: '',
    };
  });
};

const teamAliases = ['Team Name', 'teamName'];
const referenceAliases = ['Reference ID', 'referenceId'];
const leaderAliases = ['Leader Full Name', 'Leader Name', 'leaderName'];
const timestampAliases = ['Timestamp', 'Registration Date', 'Registration Timestamp', 'timestamp', 'registrationDate'];

const getInstitutionAliases = (category: Category) => category === 'school'
  ? [
      ['School Name', 'schoolName'],
      ['School District', 'District', 'district'],
    ]
  : [
      ['University / Institute', 'University', 'University Name', 'universityName'],
      ['Faculty', 'faculty'],
      ['Year of Study', 'yearOfStudy'],
      ['Student Reg No', 'Student Registration Number', 'studentRegNo'],
      ['Degree Programme', 'Degree Program', 'degreeProgramme', 'degree'],
      ['Enrolled Undergraduate Check', 'Undergraduate Eligibility', 'eligibility'],
    ];

const displayLabel = (label: string) => {
  const labels: Record<string, string> = {
    'Leader WhatsApp': 'WhatsApp Number',
    'Leader Email': 'Email Address',
    'School District': 'District',
    'Student Reg No': 'Student Registration Number',
    'Degree Programme': 'Degree Programme',
    'Fee Paid (Rs.)': 'Fee Paid',
  };
  return labels[label] || label;
};

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copyStatus, setCopyStatus] = useState<'copied' | 'failed' | ''>('');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus('copied');
      window.setTimeout(() => setCopyStatus(''), 1600);
    } catch (error) {
      console.error('[registration-details] clipboard copy failed', error);
      setCopyStatus('failed');
      window.setTimeout(() => setCopyStatus(''), 2400);
    }
  };

  return (
    <button className="registration-details__copy" type="button" onClick={() => void copy()} aria-label={`Copy ${label}`}>
      {copyStatus === 'copied' ? <FiCheck aria-hidden="true" /> : <FiClipboard aria-hidden="true" />}
      <span>{copyStatus === 'copied' ? 'Copied' : copyStatus === 'failed' ? 'Copy failed' : 'Copy'}</span>
    </button>
  );
}

function DetailsField({ entry, copyable = false }: { entry: FieldEntry; copyable?: boolean }) {
  const valueIsUrl = isSafeExternalUrl(entry.value);
  return (
    <div className="registration-details__field">
      <span className="registration-details__field-label">{displayLabel(entry.label)}</span>
      <div className="registration-details__field-value">
        {valueIsUrl ? (
          <a href={entry.value} target="_blank" rel="noopener noreferrer">
            {entry.label.includes('Link') || entry.label === 'Signature' ? `Open ${displayLabel(entry.label)}` : entry.value}
            <FiExternalLink aria-hidden="true" />
          </a>
        ) : (
          <span>{entry.value}</span>
        )}
        {copyable && !valueIsUrl && <CopyButton value={entry.value} label={displayLabel(entry.label)} />}
      </div>
    </div>
  );
}

function DetailsSection({
  number,
  title,
  icon,
  entries,
}: {
  number: string;
  title: string;
  icon: React.ReactNode;
  entries: FieldEntry[];
}) {
  if (!entries.length) return null;
  return (
    <section className="registration-details__section">
      <div className="registration-details__section-heading">
        <span className="registration-details__section-number">{number}</span>
        <span className="registration-details__section-icon" aria-hidden="true">{icon}</span>
        <h3>{title}</h3>
      </div>
      <div className="registration-details__fields">
        {entries.map((entry) => (
          <DetailsField
            key={entry.key}
            entry={entry}
            copyable={entry.label === 'Leader WhatsApp' || entry.label === 'Leader Email'}
          />
        ))}
      </div>
    </section>
  );
}

function RegistrationDetails({
  record,
  category,
  onClose,
}: {
  record: RegistrationRecord;
  category: Category;
  onClose: () => void;
}) {
  const usedKeys = new Set<string>();
  const take = (aliases: string[]) => {
    const entry = getFieldEntry(record, aliases);
    if (entry) usedKeys.add(entry.key);
    return entry;
  };
  const takeMany = (aliases: string[][]) => aliases.flatMap((fieldAliases) => {
    const entry = take(fieldAliases);
    return entry ? [entry] : [];
  });

  const teamEntries = takeMany([
    teamAliases,
    referenceAliases,
    timestampAliases,
    ['Category', 'Registration Type', 'category', 'registrationType'],
    ['Team Size', 'teamSize'],
  ]);
  const leaderEntries = takeMany([
    leaderAliases,
    ['Leader WhatsApp', 'Leader Phone', 'leaderPhone', 'leaderWhatsApp'],
    ['Leader Email', 'leaderEmail'],
    ...(category === 'school' ? [['Leader Grade', 'Grade', 'grade']] : []),
  ]);
  const memberEntry = take(['Other Team Members', 'Team Members', 'otherMembers']);
  const institutionEntries = takeMany(getInstitutionAliases(category));

  const additionalEntries = Object.entries(record).flatMap(([key, rawValue]) => {
    if (usedKeys.has(key)) return [];
    const value = formatValue(rawValue);
    return value ? [{ key, label: key, value }] : [];
  });
  const members = parseMembers(memberEntry?.value ?? '');
  const teamName = getValue(record, teamAliases) || 'Registration details';
  const referenceId = getValue(record, referenceAliases);
  const timestamp = getValue(record, timestampAliases);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.classList.add('registration-modal-open');
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('registration-modal-open');
    };
  }, [onClose]);

  return (
    <div className="registration-modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        className="registration-details"
        role="dialog"
        aria-modal="true"
        aria-labelledby="registration-details-title"
      >
        <header className="registration-details__header">
          <div className="registration-details__header-copy">
            <span className={`registration-management__badge registration-management__badge--${category}`}>
              <FiShield aria-hidden="true" />
              {category === 'school' ? 'School' : 'University'}
            </span>
            <h2 id="registration-details-title">{teamName}</h2>
            <div className="registration-details__header-meta">
              {referenceId && <span><FiFileText aria-hidden="true" />{referenceId}</span>}
              <span><FiCalendar aria-hidden="true" />{formatDate(timestamp)}</span>
            </div>
          </div>
          <button type="button" className="registration-details__close" onClick={onClose} aria-label="Close registration details">
            <FiX aria-hidden="true" />
          </button>
        </header>

        <div className="registration-details__content">
          <DetailsSection number="01" title="Team Information" icon={<FiUsers />} entries={teamEntries} />
          <DetailsSection number="02" title="Team Leader Information" icon={<FiShield />} entries={leaderEntries} />

          {memberEntry && (
            <section className="registration-details__section">
              <div className="registration-details__section-heading">
                <span className="registration-details__section-number">03</span>
                <span className="registration-details__section-icon" aria-hidden="true"><FiUsers /></span>
                <h3>Team Members</h3>
              </div>
              {members.length ? (
                <div className="registration-details__members">
                  {members.map((member, index) => (
                    <article className="registration-details__member" key={`${member.name}-${index}`}>
                      <span className="registration-details__member-number">{String(index + 2).padStart(2, '0')}</span>
                      <div>
                        <h4>{member.name || `Team member ${index + 1}`}</h4>
                        {member.raw ? (
                          <p>{member.raw}</p>
                        ) : (
                          <div className="registration-details__member-meta">
                            {member.details.map(([label, value]) => <span key={label}><strong>{label}:</strong> {value}</span>)}
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="registration-details__no-members">{memberEntry.value}</p>
              )}
            </section>
          )}

          <DetailsSection number="04" title="Institution Information" icon={<FiShield />} entries={institutionEntries} />
          <DetailsSection number="05" title="Additional Information" icon={<FiFileText />} entries={additionalEntries} />
        </div>
        <footer className="registration-details__footer">
          <FiShield aria-hidden="true" />
          <span>Read-only registration record</span>
          <button type="button" onClick={onClose}>Close details</button>
        </footer>
      </section>
    </div>
  );
}

function RegistrationManagementPage({
  category,
  onBack,
  onLogout,
}: RegistrationPageProps & { category: Category }) {
  const [records, setRecords] = useState<RegistrationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadCount, setReloadCount] = useState(0);
  const [searchBy, setSearchBy] = useState<'team' | 'leader'>('team');
  const [query, setQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<RegistrationRecord | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchRegistrations = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const response = await fetch(`/api/crew-registrations?category=${category}`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
        const payload = await response.json();
        if (!response.ok || payload?.success !== true || !Array.isArray(payload.records)) {
          throw new Error(payload?.message || 'Unable to load registrations. Please try again.');
        }
        if (isMounted) {
          setRecords(payload.records.filter(
            (record: RegistrationRecord) => record && registrationCategoryMatches(record, category),
          ));
        }
      } catch (error) {
        console.error(`[${category}-registrations] failed to load records`, error);
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to load registrations. Please try again.');
          setRecords([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void fetchRegistrations();
    return () => {
      isMounted = false;
    };
  }, [category, reloadCount]);

  const filteredRecords = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return records;
    const aliases = searchBy === 'team' ? teamAliases : leaderAliases;
    return records.filter((record) => getValue(record, aliases).toLocaleLowerCase().includes(needle));
  }, [query, records, searchBy]);

  const title = category === 'school' ? 'School Registrations' : 'University Registrations';
  const institutionAliases = category === 'school'
    ? ['School Name', 'schoolName']
    : ['University / Institute', 'University', 'University Name', 'universityName'];
  const dateAliases = timestampAliases;

  return (
    <div className={`registration-management registration-management--${category}`}>
      <header className="registration-management__topbar">
        <div className="registration-management__brand">
          <BrandLogo variant="withoutCaption" sizes="150px" alt="CINERO'26" className="registration-management__logo" />
          <span><small>J'PURA VOICE</small><strong>CINERO'26</strong></span>
        </div>
        <div className="registration-management__top-actions">
          <button type="button" onClick={onBack}><FiArrowLeft aria-hidden="true" /> Dashboard</button>
          <button type="button" className="registration-management__logout" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <main className="registration-management__main">
        <div className="registration-management__hero">
          <div>
            <span className="registration-management__eyebrow"><span />HR CREW · RECORDS</span>
            <h1>{title}</h1>
            <p>Review and search registered teams. Registration records are available in read-only mode.</p>
          </div>
          <div className={`registration-management__category-mark registration-management__category-mark--${category}`} aria-hidden="true">
            <FiUsers />
            <span>{category === 'school' ? 'SCH' : 'UNI'}</span>
          </div>
        </div>

        <section className="registration-management__panel" aria-label={`${title} list`}>
          <div className="registration-management__toolbar">
            <div className="registration-management__search-tools">
              <div className="registration-management__search-by" role="group" aria-label="Search registrations by">
                <button type="button" aria-pressed={searchBy === 'team'} className={searchBy === 'team' ? 'is-selected' : ''} onClick={() => setSearchBy('team')}>
                  Team Name
                </button>
                <button type="button" aria-pressed={searchBy === 'leader'} className={searchBy === 'leader' ? 'is-selected' : ''} onClick={() => setSearchBy('leader')}>
                  Team Leader
                </button>
              </div>
              <label className="registration-management__search">
                <FiSearch aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={`Search by ${searchBy === 'team' ? 'team name' : 'team leader name'}...`}
                  aria-label={`Search by ${searchBy === 'team' ? 'team name' : 'team leader name'}`}
                />
                {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><FiX /></button>}
              </label>
            </div>
            <div className="registration-management__count">
              <span className={`registration-management__count-dot registration-management__count-dot--${category}`} />
              {isLoading ? 'Loading records' : `${filteredRecords.length} ${filteredRecords.length === 1 ? 'record' : 'records'}`}
            </div>
          </div>

          {errorMessage ? (
            <div className="registration-management__state registration-management__state--error" role="alert">
              <span className="registration-management__state-icon"><FiShield /></span>
              <h2>Records could not be loaded</h2>
              <p>{errorMessage}</p>
              <button type="button" onClick={() => setReloadCount((count) => count + 1)}>Try again <FiChevronRight /></button>
            </div>
          ) : isLoading ? (
            <div className="registration-management__skeletons" aria-label="Loading registrations" role="status">
              {Array.from({ length: 5 }, (_, index) => <div className="registration-management__skeleton" key={index} />)}
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="registration-management__state">
              <span className="registration-management__state-icon"><FiSearch /></span>
              <h2>{records.length === 0 ? `No ${category} registrations yet` : 'No matching registrations'}</h2>
              <p>{records.length === 0
                ? `There are no ${category} records in the registration sheet.`
                : `No ${category} team matches “${query.trim()}”. Try another search or clear it.`}</p>
              {query && <button type="button" onClick={() => setQuery('')}>Clear search <FiX /></button>}
            </div>
          ) : (
            <>
              <div className="registration-management__table-scroll">
                <table className="registration-management__table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Reference ID</th>
                      <th>Team Name</th>
                      <th>Team Leader</th>
                      <th>{category === 'school' ? 'School Name' : 'University / Institute'}</th>
                      {category === 'school' ? <th>District</th> : <th>Faculty</th>}
                      {category === 'school' ? <th>Grade</th> : <th>Year of Study</th>}
                      <th>Team Size</th>
                      <th>Registration Date</th>
                      <th><span className="sr-only">View details</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record, index) => (
                      <tr key={`${getValue(record, referenceAliases)}-${index}`}>
                        <td><span className="registration-management__row-index">{String(index + 1).padStart(2, '0')}</span></td>
                        <td><span className="registration-management__reference">{getValue(record, referenceAliases) || '—'}</span></td>
                        <td><strong className="registration-management__team-name">{getValue(record, teamAliases) || '—'}</strong></td>
                        <td>{getValue(record, leaderAliases) || '—'}</td>
                        <td>{getValue(record, institutionAliases) || '—'}</td>
                        <td>{getValue(record, category === 'school' ? ['School District', 'District', 'district'] : ['Faculty', 'faculty']) || '—'}</td>
                        <td>{getValue(record, category === 'school' ? ['Leader Grade', 'Grade', 'grade'] : ['Year of Study', 'yearOfStudy']) || '—'}</td>
                        <td>{getValue(record, ['Team Size', 'teamSize']) || '—'}</td>
                        <td>{formatDate(getValue(record, dateAliases))}</td>
                        <td>
                          <button
                            type="button"
                            className="registration-management__view-button"
                            onClick={() => setSelectedRecord(record)}
                            aria-label={`View details for ${getValue(record, teamAliases) || 'registration'}`}
                          >
                            <FiEye aria-hidden="true" /><span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="registration-management__mobile-list">
                {filteredRecords.map((record, index) => (
                  <article className="registration-management__mobile-card" key={`mobile-${getValue(record, referenceAliases)}-${index}`}>
                    <div className="registration-management__mobile-card-top">
                      <span className="registration-management__row-index">{String(index + 1).padStart(2, '0')}</span>
                      <span className="registration-management__reference">{getValue(record, referenceAliases) || '—'}</span>
                      <span className={`registration-management__badge registration-management__badge--${category}`}>
                        {category === 'school' ? 'School' : 'University'}
                      </span>
                    </div>
                    <h2>{getValue(record, teamAliases) || 'Unnamed team'}</h2>
                    <p className="registration-management__mobile-leader">{getValue(record, leaderAliases) || '—'}</p>
                    <div className="registration-management__mobile-meta">
                      <span><FiShield aria-hidden="true" />{getValue(record, institutionAliases) || '—'}</span>
                      <span><FiUsers aria-hidden="true" />{getValue(record, ['Team Size', 'teamSize']) || '—'} members</span>
                      <span><FiCalendar aria-hidden="true" />{formatDate(getValue(record, dateAliases))}</span>
                    </div>
                    <button type="button" className="registration-management__mobile-view" onClick={() => setSelectedRecord(record)}>
                      <FiEye aria-hidden="true" /> View registration details <FiChevronRight aria-hidden="true" />
                    </button>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
        <p className="registration-management__footnote"><FiShield aria-hidden="true" /> Records are displayed from the official registration sheet and cannot be changed here.</p>
      </main>

      {selectedRecord && (
        <RegistrationDetails record={selectedRecord} category={category} onClose={() => setSelectedRecord(null)} />
      )}
    </div>
  );
}

export function SchoolRegistrationsPage(props: RegistrationPageProps) {
  return <RegistrationManagementPage {...props} category="school" />;
}

export function UniversityRegistrationsPage(props: RegistrationPageProps) {
  return <RegistrationManagementPage {...props} category="university" />;
}
