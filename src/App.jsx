import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { CollectionIcon } from "./CollectionIcon.jsx";
import {
  buildPickupCalendar,
  consensusCalendarStreams,
  pickupCalendarFilename
} from "./calendar.mjs";
import {
  CORRIDOR,
  STREAMS,
  WEEKDAYS,
  buildCorridorView,
  buildWeeklyCalendar,
  formatSummary,
  makeReportPayload
} from "./corridor.mjs";
const WestBerkeleyMap = lazy(() => import("./WestBerkeleyMap.jsx").then((module) => ({ default: module.WestBerkeleyMap })));
function LocationPinIcon({ className = "" }) {
  return (
    <svg
      className={["location-pin", className].filter(Boolean).join(" ")}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 14.5S12.5 10.6 12.5 6.5a4.5 4.5 0 1 0-9 0C3.5 10.6 8 14.5 8 14.5Z" />
      <circle cx="8" cy="6.5" r="1.55" />
    </svg>
  );
}

function BlockSummary({ segment, loadFailed }) {
  const total = segment?.totalReports;
  const coverage = segment?.coveredStreams;
  const pending = loadFailed ? "Unavailable" : "Loading…";

  return (
    <div className="block-summary" aria-live="polite">
      <div>
        <span>Selected range</span>
        <strong className="selected-range-value">
          <span id="selected-block">{segment?.block ?? "2100"}</span>
          <span className="selected-street"><LocationPinIcon className="selected-range-pin" />9th Street</span>
        </strong>
      </div>
      <div>
        <span>Recent reports</span>
        <strong id="selected-report-total">{total === null || total === undefined ? pending : total}</strong>
      </div>
      <div>
        <span>Stream coverage</span>
        <strong id="selected-stream-coverage">
          {coverage === null || coverage === undefined ? pending : `${coverage} of 3`}
        </strong>
      </div>
    </div>
  );
}

function WeeklyCalendar({ block, blockSchedule, loadFailed }) {
  const calendar = buildWeeklyCalendar(blockSchedule, loadFailed);
  const exportableStreams = consensusCalendarStreams(blockSchedule);
  const canExport = !loadFailed && exportableStreams.length > 0;
  const exportNote = loadFailed
    ? "Calendar export unavailable while community data is unavailable."
    : canExport
      ? `Downloads 26 weekly reminders for ${exportableStreams.length === 1 ? "the consensus pickup" : `${exportableStreams.length} consensus pickups`}.`
      : "Available after community consensus.";

  function downloadCalendar() {
    const content = buildPickupCalendar({ block, blockSchedule });
    if (!content) return;

    const url = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = pickupCalendarFilename(block);
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="calendar-section" aria-labelledby="calendar-title">
      <div className="calendar-heading">
        <div>
          <p className="kicker">Community week</p>
          <h3 id="calendar-title">Pickup calendar · {block}</h3>
        </div>
        <div className="calendar-heading-actions">
          <p>Typical week from recent reports. Holiday changes may not appear.</p>
          <button
            className="calendar-export-button"
            type="button"
            disabled={!canExport}
            aria-describedby="calendar-export-note"
            onClick={downloadCalendar}
          >
            <span aria-hidden="true">↓</span> Add to calendar <small>.ics</small>
          </button>
          <span id="calendar-export-note" className="calendar-export-note">{exportNote}</span>
        </div>
      </div>
      <div className="calendar-grid">
        {calendar.days.map(({ day, streams }) => (
          <article className={`calendar-day${streams.length ? " has-pickup" : ""}`} key={day}>
            <span className="calendar-day-name">{day.slice(0, 3)}</span>
            <div className="calendar-events">
              {streams.map((stream) => (
                <span
                  className={[
                    "calendar-event",
                    `calendar-${stream.id}`,
                    stream.status === "Community consensus" ? "is-consensus" : "is-developing"
                  ].join(" ")}
                  title={`${stream.label}: ${stream.status}, ${stream.total} recent reports`}
                  key={stream.id}
                >
                  <CollectionIcon type={stream.id} />
                  <span>{stream.label}</span>
                  <span className="sr-only"> · {stream.status}, {stream.total} recent reports</span>
                </span>
              ))}
              {!streams.length && (
                <span className="calendar-empty">
                  {calendar.unavailable ? "Unavailable" : "—"}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ScheduleCard({ stream, summary, loadFailed }) {
  const view = formatSummary(summary, loadFailed);
  return (
    <article className="schedule-card" data-stream-card={stream.id}>
      <span className={`stream-icon stream-${stream.id}`}>
        <CollectionIcon type={stream.id} />
      </span>
      <div>
        <h3>{stream.label}</h3>
        <strong className="schedule-day">{view.day}</strong>
        <p className={`schedule-detail ${view.tone === "empty" ? "" : view.tone}`.trim()}>{view.detail}</p>
      </div>
    </article>
  );
}

function ReportForm({ block, onBlockChange, onRecorded }) {
  const formRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ text: "", tone: "" });

  async function submitReport(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = makeReportPayload({
      block: formData.get("block"),
      streams: formData.getAll("streams"),
      day: formData.get("day"),
      website: formData.get("website")
    });

    if (payload.streams.length === 0) {
      setStatus({ text: "Select at least one collection type.", tone: "error" });
      return;
    }

    setSubmitting(true);
    setStatus({ text: "Submitting…", tone: "" });

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Report could not be submitted.");
      const recorded = payload.streams.length;
      setStatus({
        text: `Thank you — ${recorded === 1 ? "your report was" : `${recorded} collection reports were`} recorded.`,
        tone: "success"
      });
      formRef.current?.reset();
      await onRecorded();
    } catch (error) {
      setStatus({ text: error.message || "Report could not be submitted.", tone: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form id="report-form" className="report-form" ref={formRef} onSubmit={submitReport}>
      <div className="form-row">
        <label htmlFor="report-block">Block</label>
        <select id="report-block" name="block" required value={block} onChange={(event) => onBlockChange(event.target.value)}>
          {CORRIDOR.map((segment) => <option value={segment.block} key={segment.block}>{segment.block} block</option>)}
        </select>
      </div>
      <fieldset aria-describedby="collection-types-hint">
        <legend>Collection types</legend>
        <p id="collection-types-hint" className="field-hint">
          Select every cart collected on that day. If days differ, submit another report.
        </p>
        <div className="segmented-control">
          {STREAMS.map((stream) => (
            <label key={stream.id}>
              <input type="checkbox" name="streams" value={stream.id} />
              <span>{stream.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="form-row">
        <label htmlFor="report-day">Observed pickup day</label>
        <select id="report-day" name="day" required defaultValue="">
          <option value="">Choose a day</option>
          {WEEKDAYS.map((day) => <option key={day}>{day}</option>)}
        </select>
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex="-1" autoComplete="off" />
      </div>
      <label className="confirmation">
        <input name="confirmed" type="checkbox" required />
        <span>I observed or confirmed this schedule for the selected block.</span>
      </label>
      <button id="submit-button" className="primary-button" type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit community report"}
      </button>
      <p id="form-status" className={`form-status ${status.tone}`.trim()} role="status">{status.text}</p>
    </form>
  );
}

export default function App() {
  const [block, setBlock] = useState("2100");
  const [schedule, setSchedule] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const response = await fetch("/api/schedule", { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Schedule unavailable");
      setSchedule(await response.json());
    } catch {
      setSchedule(null);
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSchedule(); }, [loadSchedule]);

  const corridor = buildCorridorView(schedule, block, loadFailed);
  const selectedSegment = corridor.find((segment) => segment.selected);

  return (
    <>
      <header className="site-header">
        <a className="brand" href="/" aria-label="Berkeley Trash Day home">
          <img className="brand-mark" src="/berkeley-trash-day-logo.png" alt="" />
          <span>Berkeley Trash Day</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#report">Report a day</a>
          <a href="/privacy.html">Privacy</a>
          <a href="https://github.com/bkubwimana/berkeley-trash-day">GitHub</a>
        </nav>
      </header>

      <main>
        <section className="hero" aria-labelledby="page-title">
          <div>
            <div className="eyebrow-row">
              <span className="pill">Community beta</span>
              <span className="pill pill-muted">Unofficial</span>
            </div>
            <h1 id="page-title">Find your block.<br />Know your day.</h1>
            <p className="lede">A neighbor-powered guide to trash, recycling, and compost pickup days, beginning on 9th Street and built to grow across West Berkeley.</p>
          </div>
          <aside className="official-note">
            <span className="note-icon" aria-hidden="true">i</span>
            <div>
              <strong>Need an official answer?</strong>
              <p>Contact Berkeley Zero Waste at <a href="tel:+15109817270">(510) 981-7270</a> or visit the{" "}
                <a href="https://berkeleyca.gov/city-services/trash-recycling/residential-waste-services">City of Berkeley website</a>.
              </p>
            </div>
          </aside>
        </section>

        <section className="tracker" aria-labelledby="tracker-title">
          <div className="section-heading">
            <div>
              <p className="kicker">West Berkeley · California</p>
              <h2 id="tracker-title">Find your street</h2>
            </div>
            <span className="updated">4 ranges live</span>
          </div>
          <Suspense fallback={<p className="map-module-loading" role="status">Preparing West Berkeley map…</p>}>
            <WestBerkeleyMap selectedBlock={block} onSelect={setBlock} />
          </Suspense>
          <BlockSummary segment={selectedSegment} loadFailed={loadFailed} />
          <WeeklyCalendar block={block} blockSchedule={schedule?.blocks?.[block]} loadFailed={loadFailed} />
          <div className="schedule-heading">
            <strong>Pickup details</strong>
            <span className="status-key"><i className="signal signal-consensus" />Consensus <i className="signal signal-developing" />Developing</span>
          </div>
          <div id="schedule" className="schedule-grid" aria-live="polite" aria-busy={loading}>
            {STREAMS.map((stream) => (
              <ScheduleCard stream={stream} summary={schedule?.blocks?.[block]?.[stream.id]} loadFailed={loadFailed} key={stream.id} />
            ))}
          </div>
        </section>

        <section id="report" className="report-section" aria-labelledby="report-title">
          <div className="report-copy">
            <p className="kicker">Help a neighbor</p>
            <h2 id="report-title">What day are carts collected?</h2>
            <p>Share what you have observed for this block. Three agreeing reports are needed before a day is shown as community consensus.</p>
            <ul className="privacy-points">
              <li>No account required</li><li>No exact address requested</li><li>Reports expire after 180 days</li>
            </ul>
          </div>
          <ReportForm block={block} onBlockChange={setBlock} onRecorded={loadSchedule} />
        </section>

        <section className="method-section" aria-labelledby="method-title">
          <p className="kicker">How confidence works</p>
          <h2 id="method-title">Transparent counts.</h2>
          <div className="method-grid">
            <article><span>01</span><h3>Neighbors report</h3><p>People submit only a block, selected collection types, and observed day.</p></article>
            <article><span>02</span><h3>Reports agree</h3><p>We show the leading day and exactly how many recent reports support it.</p></article>
            <article><span>03</span><h3>Consensus appears</h3><p>At least three reports and two-thirds agreement are required.</p></article>
          </div>
        </section>
      </main>

      <footer>
        <div>
          <strong>Berkeley Trash Day</strong>
          <p>An open-source community project. Not affiliated with the City of Berkeley.</p>
          <p className="map-source">
            Basemap: <a href="https://openfreemap.org/">OpenFreeMap</a> · <a href="https://openmaptiles.org/">© OpenMapTiles</a> · data <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>.<br />
            Expansion reference: <a href="https://berkeleyca.gov/city-services/community-gis-portal">City of Berkeley Community GIS Portal</a>.
          </p>
        </div>
        <div className="footer-links">
          <a href="/privacy.html">Privacy</a>
          <a href="https://github.com/bkubwimana/berkeley-trash-day">Source code</a>
          <a href="https://berkeleyca.gov/city-services/trash-recycling/residential-waste-services">Official service information</a>
        </div>
      </footer>
    </>
  );
}
