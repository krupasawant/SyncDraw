import SaveDesign from './SaveDesign';

interface HeaderProps {
  currentDesign: string;
}

export default function Header({ currentDesign }: HeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 12px',
        background: '#f0f0f0',
        borderBottom: '1px solid #ccc',
      }}
    >
      <h2 style={{ fontSize: 16, fontWeight: 600 }}>{currentDesign}</h2>
      <SaveDesign />
    </div>
  );
}
