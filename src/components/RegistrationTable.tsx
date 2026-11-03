import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { CrewRegistration } from '../types/crew';

interface RegistrationTableProps {
  records: CrewRegistration[];
}

function formatDate(value: string) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) {
    return value || 'Not available';
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function RegistrationTable({ records }: RegistrationTableProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState<CrewRegistration | null>(null);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((record) => {
      const matchesSearch = !query ||
        record.teamName.toLowerCase().includes(query) ||
        record.registrationId.toLowerCase().includes(query);
      return matchesSearch && (category === 'all' || record.category === category);
    });
  }, [category, records, search]);

  return (
    <>
      <div className="admin-table-tools">
        <label className="admin-search">
          <Search size={17} aria-hidden="true" />
          <span className="admin-visually-hidden">Search by team name or registration ID</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search teams or registration IDs"
          />
        </label>
        <label className="admin-filter">
          <span className="admin-visually-hidden">Filter by category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">All categories</option>
            <option value="Inter-University">Inter-University</option>
            <option value="Inter-School">Inter-School</option>
          </select>
        </label>
      </div>

      {filteredRecords.length > 0 ? (
        <div className="admin-table-scroll">
          <table className="admin-registration-table">
            <thead>
              <tr>
                <th scope="col">Team / Registration ID</th>
                <th scope="col">Category</th>
                <th scope="col">Institution</th>
                <th scope="col">Team size</th>
                <th scope="col">Registered</th>
                <th scope="col"><span className="admin-visually-hidden">Details</span></th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, index) => (
                <tr key={`${record.registrationId || record.teamName}-${index}`}>
                  <td>
                    <strong className="admin-table-team">{record.teamName}</strong>
                    <span className="admin-table-id">
                      {record.registrationId || 'Registration ID not provided'}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-category-badge admin-category-badge--${record.category === 'Inter-School' ? 'school' : 'university'}`}>
                      {record.category}
                    </span>
                  </td>
                  <td className="admin-table-institution">{record.institution || 'Not provided'}</td>
                  <td>{record.teamSize ?? 'Unavailable'}</td>
                  <td className="admin-table-date">{formatDate(record.registrationDate)}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-table-view"
                      onClick={() => setSelected(record)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-empty-state">
          <span className="admin-empty-state__icon"><Search size={20} /></span>
          <strong>{records.length ? 'No matching registrations' : 'No registrations yet'}</strong>
          <span>
            {records.length
              ? 'Try another team name, registration ID or category.'
              : 'Submitted team registrations will appear here.'}
          </span>
        </div>
      )}

      {selected && (
        <div
          className="admin-detail-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <section className="admin-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-detail-title">
            <div className="admin-detail-dialog__heading">
              <div>
                <span className="admin-eyebrow">REGISTRATION DETAILS</span>
                <h2 id="admin-detail-title">{selected.teamName}</h2>
              </div>
              <button
                type="button"
                className="admin-detail-dialog__close"
                aria-label="Close registration details"
                onClick={() => setSelected(null)}
              >
                <X size={19} />
              </button>
            </div>
            <dl className="admin-detail-list">
              <div><dt>Registration ID</dt><dd>{selected.registrationId || 'Not provided'}</dd></div>
              <div><dt>Category</dt><dd>{selected.categoryLabel}</dd></div>
              <div><dt>Institution</dt><dd>{selected.institution || 'Not provided'}</dd></div>
              <div><dt>Team size</dt><dd>{selected.teamSize ?? 'Unavailable'}</dd></div>
              <div><dt>Registration date</dt><dd>{formatDate(selected.registrationDate)}</dd></div>
            </dl>
            <p className="admin-detail-note">
              Personal contact, student ID and payment information are intentionally not shown here.
            </p>
          </section>
        </div>
      )}
    </>
  );
}
