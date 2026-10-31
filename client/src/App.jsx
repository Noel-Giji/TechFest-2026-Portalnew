import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const EVENTS = ["CodeSprint", "RoboRumble", "Designathon", "Tech Quiz", "Project Expo"];
const EMPTY_FORM = {
  studentName: "",
  rollNumber: "",
  email: "",
  mobile: "",
  department: "",
  year: "",
  eventName: ""
};

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed. Please try again.");
  return data;
}

export default function App() {
  const [registrations, setRegistrations] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/api/registrations");
      setRegistrations(data);
    } catch (error) {
      setNotice({ type: "error", text: `${error.message} Check that the backend is running and VITE_API_URL is correct.` });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  const filteredRegistrations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return registrations;
    return registrations.filter((item) =>
      [item.studentName, item.rollNumber, item.email, item.department, item.eventName]
        .some((value) => String(value || "").toLowerCase().includes(query))
    );
  }, [registrations, search]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setNotice({ type: "", text: "" });
    try {
      const path = editingId
        ? `/api/registrations/${editingId}`
        : "/api/registrations";
      await apiRequest(path, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(form)
      });
      setNotice({
        type: "success",
        text: editingId ? "Registration updated successfully." : "Registration submitted successfully."
      });
      resetForm();
      await loadRegistrations();
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(item) {
    setForm({
      studentName: item.studentName || "",
      rollNumber: item.rollNumber || "",
      email: item.email || "",
      mobile: item.mobile || "",
      department: item.department || "",
      year: item.year || "",
      eventName: item.eventName || ""
    });
    setEditingId(item._id);
    document.getElementById("registration")?.scrollIntoView({ behavior: "smooth" });
  }

  async function deleteRegistration(item) {
    const confirmed = window.confirm(`Delete registration for ${item.studentName} (${item.eventName})?`);
    if (!confirmed) return;
    try {
      await apiRequest(`/api/registrations/${item._id}`, { method: "DELETE" });
      setNotice({ type: "success", text: "Registration deleted." });
      if (editingId === item._id) resetForm();
      await loadRegistrations();
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="TechFest home">
          <span className="brand-mark">T</span>
          <span>TECHFEST<span className="brand-year"> ’26</span></span>
        </a>
        <nav>
          <a href="#events">Events</a>
          <a href="#registration">Register</a>
          <a href="#dashboard">Registrations</a>
        </nav>
        <a className="nav-cta" href="#registration">Join the fest <span>↗</span></a>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <div className="eyebrow"><span className="pulse-dot" /> COLLEGE TECHNOLOGY FESTIVAL · 2026</div>
            <h1>Ideas become<br /><span>innovation.</span></h1>
            <p className="hero-description">
              A gathering of builders, thinkers, designers and problem-solvers.
              Find your event, bring your team, and make something remarkable.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#events">Explore events <span>↘</span></a>
              <a className="text-link" href="#registration">Register now <span>→</span></a>
            </div>
            <div className="hero-stats">
              <div><strong>05</strong><span>Featured events</span></div>
              <div><strong>01</strong><span>Big tech energy</span></div>
              <div><strong>∞</strong><span>Ideas to explore</span></div>
            </div>
          </div>
          <div className="hero-art" aria-label="Abstract TechFest artwork">
            <div className="orbit orbit-one"></div>
            <div className="orbit orbit-two"></div>
            <div className="orbit orbit-three"></div>
            <div className="art-core"><span>TF</span><small>BUILD THE<br />FUTURE</small></div>
            <div className="float-tag tag-top">CREATIVITY ↗</div>
            <div className="float-tag tag-bottom">CODE · CREATE · COMPETE</div>
            <span className="spark spark-one">✳</span><span className="spark spark-two">✦</span>
          </div>
          <div className="hero-bottom"><span>SCROLL TO DISCOVER</span><span>01 / 03</span></div>
        </section>

        <section className="section events-section" id="events">
          <div className="section-heading">
            <div><div className="eyebrow muted">WHAT’S ON</div><h2>Choose your <span>challenge.</span></h2></div>
            <p>One festival. Different arenas.<br />Pick the one that sparks you.</p>
          </div>
          <div className="event-grid">
            {[
              { number: "01", name: "CodeSprint", type: "PROGRAMMING", desc: "Think fast. Build smart. Solve real-world problems.", icon: "</>" },
              { number: "02", name: "RoboRumble", type: "ROBOTICS", desc: "Engineer, experiment, and put your machine to the test.", icon: "⌘" },
              { number: "03", name: "Designathon", type: "UI / UX DESIGN", desc: "Turn human problems into thoughtful digital experiences.", icon: "✳" },
              { number: "04", name: "Tech Quiz", type: "TECHNOLOGY QUIZ", desc: "Challenge your curiosity across the world of technology.", icon: "?" },
              { number: "05", name: "Project Expo", type: "INNOVATION", desc: "Showcase your idea, prototype, or next big breakthrough.", icon: "↗" }
            ].map((event) => (
              <article className="event-card" key={event.number}>
                <div className="event-card-top"><span>{event.number} / EVENT</span><span className="event-icon">{event.icon}</span></div>
                <div className="event-type">{event.type}</div>
                <h3>{event.name}</h3>
                <p>{event.desc}</p>
                <button className="card-link" onClick={() => {
                  setForm((current) => ({ ...current, eventName: event.name }));
                  document.getElementById("registration")?.scrollIntoView({ behavior: "smooth" });
                }}>Choose event <span>↗</span></button>
              </article>
            ))}
          </div>
        </section>

        <section className="registration-section" id="registration">
          <div className="registration-intro">
            <div className="eyebrow">YOUR NEXT MOVE</div>
            <h2>{editingId ? "Update your" : "Make it"}<br /><span>{editingId ? "registration." : "mark."}</span></h2>
            <p>Fill in your details and secure your place at TechFest 2026. Make sure your roll number and email are correct.</p>
            <div className="registration-note"><span>✳</span><div><strong>One registration per event</strong><br /><small>Duplicate registrations for the same event are not accepted.</small></div></div>
          </div>
          <form className="registration-form" onSubmit={handleSubmit}>
            <div className="form-heading"><div><span className="step-label">REGISTRATION FORM</span><h3>Student details</h3></div><span className="form-step">01 — 07</span></div>
            <div className="form-grid">
              <label>Student name<input name="studentName" value={form.studentName} onChange={updateField} placeholder="e.g. Alex Thomas" required minLength="2" maxLength="80" /></label>
              <label>Roll number<input name="rollNumber" value={form.rollNumber} onChange={updateField} placeholder="e.g. CS24-042" required maxLength="30" /></label>
              <label>Email address<input type="email" name="email" value={form.email} onChange={updateField} placeholder="you@college.edu" required /></label>
              <label>Mobile number<input type="tel" name="mobile" value={form.mobile} onChange={updateField} placeholder="+91 98765 43210" required /></label>
              <label>Department<input name="department" value={form.department} onChange={updateField} placeholder="e.g. Computer Science" required /></label>
              <label>Year of study<select name="year" value={form.year} onChange={updateField} required><option value="">Select year</option><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option></select></label>
              <label className="full-width">Choose an event<select name="eventName" value={form.eventName} onChange={updateField} required><option value="">Select an event</option>{EVENTS.map((event) => <option key={event}>{event}</option>)}</select></label>
            </div>
            {notice.text && <div className={`notice ${notice.type}`} role="status">{notice.text}</div>}
            <div className="form-actions">
              <button type="button" className="button button-ghost" onClick={() => { resetForm(); setNotice({ type: "", text: "" }); }}>Reset</button>
              <button type="submit" className="button button-primary" disabled={submitting}>{submitting ? "Saving…" : editingId ? "Save changes ↗" : "Submit registration ↗"}</button>
            </div>
          </form>
        </section>

        <section className="section dashboard-section" id="dashboard">
          <div className="section-heading">
            <div><div className="eyebrow muted">LIVE REGISTRATION LIST</div><h2>People making <span>things happen.</span></h2></div>
            <div className="dashboard-count"><strong>{registrations.length.toString().padStart(2, "0")}</strong><span>total registrations</span></div>
          </div>
          <div className="table-toolbar">
            <div className="table-title">Student registrations <span className="count-pill">{filteredRegistrations.length}</span></div>
            <input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, roll no, event…" aria-label="Search registrations" />
            <button className="refresh-button" onClick={loadRegistrations} disabled={loading}>{loading ? "Loading…" : "↻ Refresh"}</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>STUDENT</th><th>ROLL NUMBER</th><th>DEPARTMENT / YEAR</th><th>EVENT</th><th>REGISTERED</th><th>ACTIONS</th></tr></thead>
              <tbody>
                {filteredRegistrations.map((item) => (
                  <tr key={item._id}>
                    <td><div className="student-cell"><span className="avatar">{(item.studentName || "?").slice(0, 1).toUpperCase()}</span><div><strong>{item.studentName}</strong><small>{item.email}</small></div></div></td>
                    <td>{item.rollNumber}</td>
                    <td>{item.department}<small className="table-subline">{item.year}</small></td>
                    <td><span className="event-badge">{item.eventName}</span></td>
                    <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}</td>
                    <td><div className="row-actions"><button onClick={() => startEdit(item)} aria-label={`Edit ${item.studentName}`}>Edit</button><button className="delete-action" onClick={() => deleteRegistration(item)} aria-label={`Delete ${item.studentName}`}>Delete</button></div></td>
                  </tr>
                ))}
                {!loading && filteredRegistrations.length === 0 && <tr><td colSpan="6" className="empty-state">{registrations.length === 0 ? "No registrations yet. Be the first to register above." : "No registrations match your search."}</td></tr>}
                {loading && <tr><td colSpan="6" className="empty-state">Loading registrations…</td></tr>}
              </tbody>
            </table>
          </div>
          <p className="table-footnote">Registration records are stored in MongoDB. Refreshing the page will not remove saved records.</p>
        </section>
      </main>

      <footer className="footer">
        <a className="brand" href="#home"><span className="brand-mark">T</span><span>TECHFEST<span className="brand-year"> ’26</span></span></a>
        <p>Made for curious minds and bold ideas.</p>
        <a href="#home">BACK TO TOP ↑</a>
      </footer>
    </div>
  );
}