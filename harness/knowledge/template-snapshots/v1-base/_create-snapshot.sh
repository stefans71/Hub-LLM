#!/bin/bash
# =============================================================================
# Harness Template Snapshot Creator
# =============================================================================
# Extracts all TEMPLATE_* constants from projects.py and creates a versioned
# snapshot directory + ZIP file.
#
# Usage:
#   ./create-snapshot.sh v2-post-feat57
#   ./create-snapshot.sh v3-ralph-loop
#
# Then compare against previous:
#   diff -r v1-base/ v2-post-feat57/
# =============================================================================

set -e

VERSION="${1:?Usage: ./create-snapshot.sh <version-name>}"
PROJECTS_PY="/root/dev/Hub-LLM/backend/routers/projects.py"
SNAPSHOTS_DIR="/root/dev/Hub-LLM/harness/knowledge/template-snapshots"
TARGET="${SNAPSHOTS_DIR}/${VERSION}"

if [ -d "$TARGET" ]; then
    echo "ERROR: ${TARGET} already exists. Choose a different version name."
    exit 1
fi

echo "Creating snapshot: ${VERSION}"
echo "Source: ${PROJECTS_PY}"
echo ""

# Create directory structure
mkdir -p "${TARGET}"/{.claude/commands,.claude/agents,.git/hooks,harness,PRPs,docs,src,director/.claude}

# Extract templates using Python
python3 << PYEOF
import re, os

with open('${PROJECTS_PY}', 'r') as f:
    content = f.read()

pattern = r'(TEMPLATE_\w+)\s*=\s*r?"""(.*?)"""'
matches = re.findall(pattern, content, re.DOTALL)

file_map = {
    'TEMPLATE_CLAUDE_MD': 'CLAUDE.md',
    'TEMPLATE_CLAUDE_SETTINGS': '.claude/settings.json',
    'TEMPLATE_GENERATE_PRP': '.claude/commands/generate-prp.md',
    'TEMPLATE_EXECUTE_PRP': '.claude/commands/execute-prp.md',
    'TEMPLATE_FEATURE_QUEUE': 'harness/feature_queue.json',
    'TEMPLATE_CODEBASE_INDEX': 'harness/CODEBASE_INDEX.yaml',
    'TEMPLATE_LEARNINGS': 'harness/learnings.md',
    'TEMPLATE_README': 'README.md',
    'TEMPLATE_PRE_COMMIT_HOOK': '.git/hooks/pre-commit',
    'TEMPLATE_AUDIT_INDEX': '.claude/commands/audit-index.md',
    'TEMPLATE_PORTABLE_README': '_portable-readme-template.md',
    'TEMPLATE_CODE_RESEARCHER': '.claude/agents/code-researcher.md',
    'TEMPLATE_DIRECTOR_CLAUDE_MD': 'director/CLAUDE.md',
    'TEMPLATE_DIRECTOR_SETTINGS': 'director/.claude/settings.json',
    'TEMPLATE_DIRECTOR_SETTINGS_LOCAL': 'director/.claude/settings.local.json',
    'TEMPLATE_ROADMAP': 'harness/ROADMAP.md',
}

base = '${TARGET}'
extracted = 0
for name, body in matches:
    if name in file_map:
        filepath = os.path.join(base, file_map[name])
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'w') as f:
            f.write(body.strip() + '\n')
        print(f"  Extracted: {name} -> {file_map[name]}")
        extracted += 1
    else:
        print(f"  UNMAPPED: {name} (add to file_map if new)")

print(f"\nTotal templates extracted: {extracted}/{len(matches)}")
PYEOF

# Add .gitkeep files
touch "${TARGET}/PRPs/.gitkeep" "${TARGET}/docs/.gitkeep" "${TARGET}/src/.gitkeep"

# Copy design docs as reference
cp /root/dev/Hub-LLM/harness/knowledge/harness-template-design.md "${TARGET}/_harness-template-design.md"
cp /root/dev/Hub-LLM/harness/knowledge/dogfooding-log.md "${TARGET}/_dogfooding-log.md"

# Copy this script into the snapshot for reproducibility
cp "${SNAPSHOTS_DIR}/create-snapshot.sh" "${TARGET}/_create-snapshot.sh"

# Generate manifest
echo ""
echo "Generating manifest..."
echo "# Snapshot Manifest — ${VERSION}" > "${TARGET}/MANIFEST.md"
echo "**Created**: $(date '+%Y-%m-%d %H:%M')" >> "${TARGET}/MANIFEST.md"
echo "**Source**: backend/routers/projects.py" >> "${TARGET}/MANIFEST.md"
echo "**Branch**: $(cd /root/dev/Hub-LLM && git branch --show-current)" >> "${TARGET}/MANIFEST.md"
echo "**Commit**: $(cd /root/dev/Hub-LLM && git log --oneline -1)" >> "${TARGET}/MANIFEST.md"
echo "" >> "${TARGET}/MANIFEST.md"
echo "## Files" >> "${TARGET}/MANIFEST.md"
echo '```' >> "${TARGET}/MANIFEST.md"
find "${TARGET}" -type f | sort | sed "s|${TARGET}/||" >> "${TARGET}/MANIFEST.md"
echo '```' >> "${TARGET}/MANIFEST.md"
echo "" >> "${TARGET}/MANIFEST.md"
echo "## Compare to previous snapshot" >> "${TARGET}/MANIFEST.md"
echo '```bash' >> "${TARGET}/MANIFEST.md"
echo "diff -r ${SNAPSHOTS_DIR}/v1-base/ ${TARGET}/" >> "${TARGET}/MANIFEST.md"
echo '```' >> "${TARGET}/MANIFEST.md"

# Create ZIP
echo ""
echo "Creating ZIP..."
cd "${SNAPSHOTS_DIR}"
zip -r "template-snapshot-${VERSION}.zip" "${VERSION}/" -x "*.DS_Store" > /dev/null

echo ""
echo "=== Snapshot complete ==="
echo "Directory: ${TARGET}"
echo "ZIP: ${SNAPSHOTS_DIR}/template-snapshot-${VERSION}.zip"
echo "Size: $(du -sh ${TARGET} | cut -f1) (dir) / $(ls -lh ${SNAPSHOTS_DIR}/template-snapshot-${VERSION}.zip | awk '{print $5}') (zip)"
echo ""
echo "To compare against base:"
echo "  diff -r ${SNAPSHOTS_DIR}/v1-base/ ${TARGET}/"
