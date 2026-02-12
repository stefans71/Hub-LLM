#!/bin/bash
COLS=$(tput cols 2>/dev/null || echo 80)
if [ "$COLS" -ge 62 ]; then
cat <<'LOGO'

    [1;37m██╗  ██╗██╗   ██╗██████╗ [0m[38;2;56;189;248m██╗     ██╗     ███╗   ███╗[0m
    [1;37m██║  ██║██║   ██║██╔══██╗[0m[38;2;56;189;248m██║     ██║     ████╗ ████║[0m
    [1;37m███████║██║   ██║██████╔╝[0m[38;2;56;189;248m██║     ██║     ██╔████╔██║[0m
    [1;37m██╔══██║██║   ██║██╔══██╗[0m[38;2;56;189;248m██║     ██║     ██║╚██╔╝██║[0m
    [1;37m██║  ██║╚██████╔╝██████╔╝[0m[38;2;56;189;248m███████╗███████╗██║ ╚═╝ ██║[0m
    [1;37m╚═╝  ╚═╝ ╚═════╝ ╚═════╝ [0m[38;2;56;189;248m╚══════╝╚══════╝╚═╝     ╚═╝[0m [90m.dev[0m

LOGO
else
cat <<'LOGO'

    [1;37m╦ ╦╦ ╦[0m[38;2;56;189;248m╔╗ ╦  ╦  ╔╦╗[0m
    [1;37m╠═╣║ ║[0m[38;2;56;189;248m╠╩╗║  ║  ║║║[0m
    [1;37m╩ ╩╚═╝[0m[38;2;56;189;248m╚═╝╩═╝╩═╝╩ ╩[0m [90m.dev[0m

LOGO
fi
if [ "$COLS" -ge 62 ]; then
cat <<'TEXT'
  [38;2;249;115;22mWelcome to {{projectName}}![0m

  [38;2;249;115;22mGetting started:[0m [36msee preview panel to the right[0m

  [36mDirector:[0m  [32m{{slug}}-director/[0m
  [36mEngineer:[0m  [32m{{appDir}}/[0m

  You will be managing the Project Director workflow from this panel.

  [38;2;249;115;22mSTARTING:[0m

  1. You will be managing the Project Director workflow from this
     panel/terminal.
     [36mDirector:[0m  [32m{{slug}}-director/[0m

  2. You will manage Lead Engineer workflow in:
     [36mEngineer:[0m  [32m{{appDir}}/[0m
     In the lower-left of the screen, open the [1mLLM-Dev Terminal[0m panel
     and copy and paste this into the terminal:
     [36mcd [32m{{appDir}}[36m && claude[0m

  3. Come back to this terminal and type
     [36mclaude[0m
     Press Enter.
     This will start your AI Coding session with the Project Director
     AI Persona.

  [38;2;249;115;22mNote:[0m
  To copy text in the terminal, highlight it, right-click and
  select '[36mCopy[0m'.
  To paste, right-click in the terminal and select '[36mPaste[0m'.
  For more info, see the [36mGetting Started[0m document in the [36mPreview
  panel[0m (right side).
TEXT
else
cat <<'TEXT'
  [38;2;249;115;22mWelcome to {{projectName}}![0m

  [38;2;249;115;22mGetting started:[0m
  [36msee preview panel â[0m

  [36mDir:[0m [32m{{slug}}-director/[0m
  [36mEng:[0m [32m{{slug}}/[0m

  [38;2;249;115;22mSTARTING:[0m

  1. Director workflow runs here.
     [36mDir:[0m [32m{{slug}}-director/[0m

  2. Engineer workflow:
     [36mEng:[0m [32m{{appDir}}/[0m
     Open [1mLLM-Dev Terminal[0m
     (lower-left), paste:
     [36mcd [32m{{appDir}}[36m && claude[0m

  3. Return here, type:
     [36mclaude[0m then Enter.
     Starts Director AI session.

  [38;2;249;115;22mNote:[0m Copy: highlight,
  right-click â '[36mCopy[0m'.
  Paste: right-click â '[36mPaste[0m'.
  See [36mGetting Started[0m in
  [36mPreview panel[0m (right).
TEXT
fi
