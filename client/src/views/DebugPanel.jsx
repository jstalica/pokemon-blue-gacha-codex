function DebugPanel({
  tickets,
  dust,
  onAddTickets,
  onSetTickets,
  onAddDust,
  onReset,
  onClose
}) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal debug-panel">
        <header>
          <h2>Developer Cheats</h2>
          <button className="ghost" onClick={onClose}>
            Close
          </button>
        </header>

        <section>
          <h3>Tickets</h3>
          <p>Current: {tickets}</p>
          <div className="debug-actions">
            <button className="primary" onClick={() => onAddTickets(1)}>
              +1 Ticket
            </button>
            <button className="ghost" onClick={() => onSetTickets(3)}>
              Set to 3 (Cap)
            </button>
            <button className="ghost" onClick={() => onSetTickets(99)}>
              Set to 99
            </button>
          </div>
        </section>

        <section>
          <h3>Dust</h3>
          <p>Current: {dust}</p>
          <div className="debug-actions">
            <button className="primary" onClick={() => onAddDust(50)}>
              +50 Dust
            </button>
            <button className="ghost" onClick={() => onAddDust(500)}>
              +500 Dust
            </button>
            <button className="ghost" onClick={() => onAddDust(5000)}>
              +5k Dust
            </button>
          </div>
        </section>

        <section>
          <h3>Save Tools</h3>
          <div className="debug-actions">
            <button className="ghost" onClick={onReset}>
              Reset Save
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default DebugPanel;
