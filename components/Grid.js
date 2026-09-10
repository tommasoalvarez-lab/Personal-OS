export function Screen({ children }) {
  return <div className="screen">{children}</div>;
}

export function Grid({ children }) {
  return <div className="grid">{children}</div>;
}

export function Card({ id, title, question, span = 4, className = "", children }) {
  return (
    <div id={id} className={`card col-${span} ${className}`.trim()}>
      {title && <h3>{title}</h3>}
      {question && <p className="card-question">{question}</p>}
      {children}
    </div>
  );
}
