import { AVATARS, type AvatarId } from '../avatars';

interface AvatarPickerProps {
  selected: AvatarId | null;
  onSelect: (id: AvatarId) => void;
}

export function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  return (
    <div className="avatar-picker">
      <span className="avatar-picker-label">KAŞİF SEÇ</span>
      <div className="avatar-picker-grid">
        {AVATARS.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            className={`avatar-option ${selected === avatar.id ? 'selected' : ''}`}
            onClick={() => onSelect(avatar.id)}
            aria-pressed={selected === avatar.id}
            aria-label={avatar.name}
          >
            <span
              className="avatar-circle"
              style={{
                background: `linear-gradient(145deg, ${avatar.color}, ${avatar.ring})`,
                boxShadow: selected === avatar.id ? `0 0 20px ${avatar.ring}` : undefined,
              }}
            >
              {avatar.initial}
            </span>
            <span className="avatar-name">{avatar.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
