import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import './ArtistAnalyticalReport.css';

/* ─── colour palette ─── */
const GRADIENT_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e'];
const STAR_COLORS    = { 5: '#FFD700', 4: '#a3e635', 3: '#38bdf8', 2: '#fb923c', 1: '#f87171' };
const PIE_COLORS     = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
                        '#14b8a6', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444'];

/* ─── custom tooltip for bar chart ─── */
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(15,15,35,0.95)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 12, padding: '10px 16px' }}>
      <p style={{ color: '#a5b4fc', marginBottom: 4, fontWeight: 700 }}>{label}</p>
      <p style={{ color: '#fff' }}>⭐ Avg: <b>{payload[0]?.value}</b></p>
      <p style={{ color: '#94a3b8' }}>🗳 Votes: <b>{payload[0]?.payload?.totalVotes}</b></p>
    </div>
  );
};

/* ─── custom tooltip for pie chart ─── */
const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  return (
    <div style={{ background: 'rgba(15,15,35,0.95)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 12, padding: '10px 16px' }}>
      <p style={{ color: '#a5b4fc', marginBottom: 4, fontWeight: 700 }}>{name}</p>
      <p style={{ color: '#fff' }}>🗳 Total Votes: <b>{value}</b></p>
      <p style={{ color: '#94a3b8' }}>⭐ Avg: <b>{p.averageRating}</b></p>
    </div>
  );
};

/* ─── star mini-bar for breakdown ─── */
const StarBreakdown = ({ breakdown, total }) => {
  return (
    <div className="star-breakdown">
      {[5, 4, 3, 2, 1].map(star => {
        const count = breakdown[star] || 0;
        const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={star} className="star-row">
            <span className="star-label">{'★'.repeat(star)}</span>
            <div className="star-bar-bg">
              <div
                className="star-bar-fill"
                style={{ width: `${pct}%`, background: STAR_COLORS[star] }}
              />
            </div>
            <span className="star-count">{count}</span>
            <span className="star-pct">({pct}%)</span>
          </div>
        );
      })}
    </div>
  );
};

/* ════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
const ArtistAnalyticalReport = () => {
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [activeTab, setActiveTab] = useState('overview');  // 'overview' | 'detail'
  const [selectedArtist, setSelectedArtist] = useState(null);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: res } = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/artists/analytics`
      );
      setData(res);
      if (res.artists?.length) setSelectedArtist(res.artists[0]);
    } catch (err) {
      console.error('Analytics fetch error:', err?.response?.status, err?.response?.data || err.message);
      const msg = err?.response?.data?.message || err.message || 'Unknown error';
      setError(`Failed to load analytics data. (${err?.response?.status || 'Network'}: ${msg})`);
    } finally {
      setLoading(false);
    }
  };

  /* guard */
  if (!user || (user.role !== 'admin' && user.role !== 'organizer')) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="ar-loading">
        <div className="ar-spinner" />
        <p>Generating Analytics Report…</p>
      </div>
    );
  }

  if (error || !data) {
    return <div className="ar-error">{error || 'No data available.'}</div>;
  }

  const { summary, artists } = data;

  /* derived chart data */
  const barData = artists.map(a => ({
    name: a.name.length > 12 ? a.name.slice(0, 11) + '…' : a.name,
    fullName: a.name,
    avgRating: a.averageRating,
    totalVotes: a.totalVotes,
  }));

  const pieData = artists
    .filter(a => a.totalVotes > 0)
    .map(a => ({ name: a.name, value: a.totalVotes, averageRating: a.averageRating }));

  /* radar data for selected artist */
  const radarData = selectedArtist
    ? [1, 2, 3, 4, 5].map(star => ({
        star: `${star}★`,
        count: selectedArtist.ratingBreakdown?.[star] || 0,
      }))
    : [];

  return (
    <div className="ar-root">
      {/* ── Page Header ── */}
      <div className="ar-page-header">
        <div>
          <h1 className="ar-page-title">
            <span className="ar-icon">📊</span> Artist Analytical Report
          </h1>
          <p className="ar-page-sub">Community ratings, voting patterns & performance insights</p>
        </div>
        <div className="ar-tab-pills">
          <button
            className={`ar-tab-pill ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >Overview</button>
          <button
            className={`ar-tab-pill ${activeTab === 'detail' ? 'active' : ''}`}
            onClick={() => setActiveTab('detail')}
          >Per-Artist Detail</button>
        </div>
      </div>

      {/* ── Summary Stat Cards ── */}
      <div className="ar-stats-row">
        <div className="ar-stat-card card-blue">
          <div className="ar-stat-icon">🎵</div>
          <div>
            <div className="ar-stat-value">{summary.totalArtists}</div>
            <div className="ar-stat-label">Total Artists</div>
          </div>
        </div>
        <div className="ar-stat-card card-purple">
          <div className="ar-stat-icon">🗳️</div>
          <div>
            <div className="ar-stat-value">{summary.totalRatings}</div>
            <div className="ar-stat-label">Total Ratings Collected</div>
          </div>
        </div>
        <div className="ar-stat-card card-gold">
          <div className="ar-stat-icon">🏆</div>
          <div>
            <div className="ar-stat-value">{summary.topArtist?.name || '—'}</div>
            <div className="ar-stat-label">Top Rated Artist</div>
          </div>
        </div>
        <div className="ar-stat-card card-green">
          <div className="ar-stat-icon">⭐</div>
          <div>
            <div className="ar-stat-value">
              {summary.topArtist ? summary.topArtist.averageRating.toFixed(2) : '—'}
            </div>
            <div className="ar-stat-label">Highest Avg Rating</div>
          </div>
        </div>
        <div className="ar-stat-card card-rose">
          <div className="ar-stat-icon">📈</div>
          <div>
            <div className="ar-stat-value">
              {artists.length > 0
                ? (artists.reduce((s, a) => s + a.averageRating, 0) / artists.length).toFixed(2)
                : '—'}
            </div>
            <div className="ar-stat-label">Overall Avg Rating</div>
          </div>
        </div>
      </div>

      {/* ══════════ OVERVIEW TAB ══════════ */}
      {activeTab === 'overview' && (
        <>
          {/* ── Bar Chart: Average Ratings ── */}
          <div className="ar-chart-card">
            <h2 className="ar-chart-title">📊 Average Rating per Artist</h2>
            <p className="ar-chart-sub">Bar height = avg rating out of 5.0 · Darker = higher rated</p>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                <defs>
                  {barData.map((_, i) => (
                    <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={GRADIENT_COLORS[i % GRADIENT_COLORS.length]} stopOpacity={1} />
                      <stop offset="100%" stopColor={GRADIENT_COLORS[i % GRADIENT_COLORS.length]} stopOpacity={0.5} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="avgRating" radius={[8, 8, 0, 0]} maxBarSize={52}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={`url(#barGrad${i})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── Two column: Pie + Vote bar ── */}
          <div className="ar-two-col">
            {/* Pie: vote share */}
            <div className="ar-chart-card">
              <h2 className="ar-chart-title">🥧 Voting Share (Pie)</h2>
              <p className="ar-chart-sub">Who received the most community votes?</p>
              {pieData.length === 0 ? (
                <p className="ar-empty">No votes recorded yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={50}
                      paddingAngle={3}
                      label={({ name, percent }) => `${name.slice(0, 10)} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ fontSize: 11, color: '#94a3b8' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Horizontal bar: total votes */}
            <div className="ar-chart-card">
              <h2 className="ar-chart-title">🗳️ Total Votes per Artist</h2>
              <p className="ar-chart-sub">Number of individual ratings received</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  layout="vertical"
                  data={barData}
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={90} />
                  <Tooltip
                    formatter={(val, name, props) => [`${val} votes`, props.payload.fullName]}
                    contentStyle={{ background: 'rgba(15,15,35,0.95)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 10 }}
                    labelStyle={{ color: '#a5b4fc' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="totalVotes" radius={[0, 8, 8, 0]} maxBarSize={28}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Ranking Table ── */}
          <div className="ar-chart-card">
            <h2 className="ar-chart-title">🏅 Full Rankings Table</h2>
            <div className="ar-table-wrap">
              <table className="ar-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Artist</th>
                    <th>Avg Rating</th>
                    <th>Total Votes</th>
                    <th>Rating Bar</th>
                    <th>5★</th>
                    <th>4★</th>
                    <th>3★</th>
                    <th>2★</th>
                    <th>1★</th>
                  </tr>
                </thead>
                <tbody>
                  {artists.map((a, i) => {
                    const medalColor = i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : null;
                    const pct = (a.averageRating / 5) * 100;
                    return (
                      <tr key={a._id} className={i < 3 ? 'top-row' : ''}>
                        <td>
                          <span
                            className="ar-rank-badge"
                            style={{ background: medalColor || 'rgba(99,102,241,0.2)', color: medalColor ? '#000' : '#a5b4fc' }}
                          >
                            #{i + 1}
                          </span>
                        </td>
                        <td className="ar-artist-cell">
                          <img
                            src={`${import.meta.env.VITE_API_URL}/pages/images/${a.image}`}
                            alt={a.name}
                            className="ar-thumb"
                          />
                          <span>{a.name}</span>
                        </td>
                        <td>
                          <span className="ar-avg" style={{ color: medalColor || 'var(--text-main)' }}>
                            ⭐ {a.averageRating.toFixed(2)}
                          </span>
                        </td>
                        <td><span className="ar-votes">{a.totalVotes}</span></td>
                        <td>
                          <div className="ar-progress-bg">
                            <div
                              className="ar-progress-fill"
                              style={{
                                width: `${pct}%`,
                                background: medalColor || GRADIENT_COLORS[i % GRADIENT_COLORS.length]
                              }}
                            />
                          </div>
                        </td>
                        <td className="star-cell s5">{a.ratingBreakdown?.[5] || 0}</td>
                        <td className="star-cell s4">{a.ratingBreakdown?.[4] || 0}</td>
                        <td className="star-cell s3">{a.ratingBreakdown?.[3] || 0}</td>
                        <td className="star-cell s2">{a.ratingBreakdown?.[2] || 0}</td>
                        <td className="star-cell s1">{a.ratingBreakdown?.[1] || 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ══════════ DETAIL TAB ══════════ */}
      {activeTab === 'detail' && (
        <div className="ar-detail-layout">
          {/* Left: artist selector */}
          <div className="ar-detail-sidebar">
            <h3 className="ar-detail-sidebar-title">Select Artist</h3>
            {artists.map((a, i) => (
              <button
                key={a._id}
                className={`ar-artist-btn ${selectedArtist?._id === a._id ? 'selected' : ''}`}
                onClick={() => setSelectedArtist(a)}
              >
                <img
                  src={`${import.meta.env.VITE_API_URL}/pages/images/${a.image}`}
                  alt={a.name}
                  className="ar-artist-btn-thumb"
                />
                <div className="ar-artist-btn-info">
                  <span className="ar-artist-btn-name">{a.name}</span>
                  <span className="ar-artist-btn-rating">⭐ {a.averageRating.toFixed(2)} · {a.totalVotes} votes</span>
                </div>
                <span className="ar-artist-btn-rank">#{i + 1}</span>
              </button>
            ))}
          </div>

          {/* Right: artist detail charts */}
          {selectedArtist && (
            <div className="ar-detail-main">
              <div className="ar-detail-hero">
                <img
                  src={`${import.meta.env.VITE_API_URL}/pages/images/${selectedArtist.image}`}
                  alt={selectedArtist.name}
                  className="ar-detail-hero-img"
                />
                <div>
                  <h2 className="ar-detail-hero-name">{selectedArtist.name}</h2>
                  <div className="ar-detail-hero-stats">
                    <span>⭐ Avg: <b>{selectedArtist.averageRating.toFixed(2)} / 5</b></span>
                    <span>🗳 Votes: <b>{selectedArtist.totalVotes}</b></span>
                  </div>
                </div>
              </div>

              <div className="ar-detail-charts">
                {/* Star Breakdown Bars */}
                <div className="ar-chart-card">
                  <h3 className="ar-chart-title">⭐ Star Rating Breakdown</h3>
                  <p className="ar-chart-sub">How many users gave each star rating</p>
                  <StarBreakdown
                    breakdown={selectedArtist.ratingBreakdown || {}}
                    total={selectedArtist.totalVotes}
                  />
                </div>

                {/* Pie: rating breakdown for this artist */}
                <div className="ar-chart-card">
                  <h3 className="ar-chart-title">🥧 Rating Distribution (Pie)</h3>
                  {selectedArtist.totalVotes === 0 ? (
                    <p className="ar-empty">No votes yet for this artist.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={[5, 4, 3, 2, 1].map(s => ({
                            name: `${s} Stars`,
                            value: selectedArtist.ratingBreakdown?.[s] || 0
                          })).filter(d => d.value > 0)}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          innerRadius={40}
                          paddingAngle={3}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {[5, 4, 3, 2, 1].map(s => (
                            <Cell key={s} fill={STAR_COLORS[s]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: 'rgba(15,15,35,0.95)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 10 }}
                          itemStyle={{ color: '#fff' }}
                          labelStyle={{ color: '#a5b4fc' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Radar chart */}
                <div className="ar-chart-card">
                  <h3 className="ar-chart-title">🕸️ Radar – Rating Spread</h3>
                  <p className="ar-chart-sub">Shape shows how spread ratings are across all stars</p>
                  {selectedArtist.totalVotes === 0 ? (
                    <p className="ar-empty">No votes yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={90}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="star" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                        <Radar
                          name={selectedArtist.name}
                          dataKey="count"
                          stroke="#6366f1"
                          fill="#6366f1"
                          fillOpacity={0.4}
                        />
                        <Tooltip
                          contentStyle={{ background: 'rgba(15,15,35,0.95)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 10 }}
                          itemStyle={{ color: '#fff' }}
                          labelStyle={{ color: '#a5b4fc' }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArtistAnalyticalReport;
