import React from 'react';
import './officer-shell.css';

/**
 * Consistent officer page frame: module purpose, attention signal, next action.
 */
const OfficerShell = ({
  title,
  purpose,
  attention,
  nextAction,
  children,
  actions,
}) => {
  return (
    <div className="op-page">
      <div className="op-page__inner">
        <header className="op-hero">
          <div>
            <h1 className="op-hero__title">{title}</h1>
            {purpose && <p className="op-hero__meta">{purpose}</p>}
          </div>
          {actions}
        </header>

        {(attention || nextAction) && (
          <div className="op-purpose-grid">
            {attention && (
              <div className="op-purpose-card">
                <p className="op-purpose-card__k">Needs attention</p>
                <p className="op-purpose-card__v">{attention}</p>
              </div>
            )}
            {nextAction && (
              <div className="op-purpose-card">
                <p className="op-purpose-card__k">Suggested next step</p>
                <p className="op-purpose-card__v">{nextAction}</p>
              </div>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

export default OfficerShell;
