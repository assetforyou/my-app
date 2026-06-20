import React from 'react';
import { PlusCircle, Upload, MessageCircle } from 'lucide-react';
import '../style/EmptyState.css';

const EmptyState = ({
  icon: Icon = PlusCircle,
  title = 'Nothing here yet',
  description = 'Add your first item to get started.',
  actions = [],
}) => (
  <div className="vk-empty-state">
    <div className="vk-empty-state__icon" aria-hidden>
      <Icon size={40} strokeWidth={1.5} />
    </div>
    <h3 className="vk-empty-state__title">{title}</h3>
    <p className="vk-empty-state__desc">{description}</p>
    {actions.length > 0 && (
      <div className="vk-empty-state__actions">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className={`vk-empty-state__btn ${action.primary ? 'vk-empty-state__btn--primary' : ''}`}
            onClick={action.onClick}
          >
            {action.icon && <action.icon size={18} />}
            {action.label}
          </button>
        ))}
      </div>
    )}
  </div>
);

export const PORTFOLIO_EMPTY_ACTIONS = (handlers) => [
  { label: 'Add an asset', icon: PlusCircle, primary: true, onClick: handlers.onAddAsset },
  { label: 'Import CSV', icon: Upload, onClick: handlers.onImport },
  { label: 'Ask assistant', icon: MessageCircle, onClick: handlers.onChat },
];

export default EmptyState;
