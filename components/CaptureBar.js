export default function CaptureBar() {
  return (
    <div className="capture-bar">
      <div className="capture-status">a riposo</div>
      <button className="capture-mic" aria-label="Registra">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0M12 19v3" />
        </svg>
      </button>
      <input type="text" placeholder="Scrivi o parla — task, persone, finanze, note..." />
      <button className="capture-send" aria-label="Invia">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      </button>
    </div>
  );
}
