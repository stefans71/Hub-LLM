// Reusable status line preview — HTML/CSS mock of the Claude Code terminal status line
// Used in: Setup wizard (VPSStep), Settings (VPS section), CreateProject (VPS step)

const cssVars = {
  bgPrimary: '#0f1419',
  border: '#2d3748',
  textMuted: '#6b7280'
}

const colors = {
  orange: '#ff8700',
  blue: '#00afff',
  pink: '#ff00ff',
  cyan: '#87ffff',
  yellow: '#ffd700',
  green: '#00ff00',
  white: '#e4e4e4',
  barEmpty: '#4a4a4a'
}

export default function StatusLinePreview({
  serverName = 'VPS',
  folderName = 'my-project',
  branch = 'main',
  model = 'Opus',
  tokensUsed = '128k',
  tokensTotal = '200k'
}) {
  // Calculate bar based on tokens
  const usedNum = parseInt(tokensUsed) || 128
  const totalNum = parseInt(tokensTotal) || 200
  const remaining = Math.max(0, Math.min(1, 1 - usedNum / totalNum))
  const barLength = 10
  const filled = Math.round(remaining * barLength)
  const pct = Math.round(remaining * 100)

  return (
    <div style={{
      background: '#1a1a2e',
      border: `1px solid ${cssVars.border}`,
      borderRadius: '8px',
      padding: '10px 14px',
      fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
      fontSize: '12px',
      lineHeight: '1.6',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px'
      }}>
        {/* Location */}
        <span>
          <span style={{ color: colors.orange }}>⛵</span>
          {' '}
          <span style={{ color: colors.orange, fontWeight: 600 }}>{serverName}</span>
        </span>

        {/* Folder */}
        <span style={{ color: colors.blue }}> {folderName}</span>

        {/* Git branch */}
        <span style={{ color: colors.pink }}> {branch}✦</span>

        {/* Model */}
        <span style={{ color: colors.cyan }}>{model}</span>

        {/* Token usage */}
        <span style={{ color: colors.yellow }}>{tokensUsed}/{tokensTotal}</span>

        {/* Context bar */}
        <span>
          <span style={{ color: colors.green }}>{'█'.repeat(filled)}</span>
          <span style={{ color: colors.barEmpty }}>{'░'.repeat(barLength - filled)}</span>
          {' '}
          <span style={{ color: colors.white }}>{pct}%</span>
        </span>

        {/* LIVE indicator */}
        <span style={{ color: colors.green }}>
          ● LIVE
        </span>
      </div>
    </div>
  )
}
