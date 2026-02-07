#!/usr/bin/env python3
"""
Claude Code Status Line Hook — installed by Hub-LLM
Shows: location, folder, git branch, model, token usage, context bar, LIVE pulse
No external dependencies — stdlib only.
"""
import sys, json, os, socket, time, subprocess

try:
    raw_input = sys.stdin.read()
except:
    raw_input = ""

try:
    if not raw_input.strip():
        sys.exit(0)

    data = json.loads(raw_input)

    # --- Model ---
    raw_model = data.get('model')
    if isinstance(raw_model, list) and len(raw_model) > 0:
        raw_model = raw_model[0]
    if isinstance(raw_model, dict):
        model_str = raw_model.get('id') or raw_model.get('display_name', 'Claude')
    elif isinstance(raw_model, str):
        model_str = raw_model
    else:
        model_str = "Claude"

    model_str_lower = model_str.lower()
    if 'opus' in model_str_lower:
        model = "Opus 4.5" if ('4.5' in model_str or '4-5' in model_str) else "Opus"
    elif 'sonnet' in model_str_lower:
        if '3.5' in model_str or '3-5' in model_str:
            model = "Sonnet 3.5"
        elif '4' in model_str:
            model = "Sonnet 4"
        else:
            model = "Sonnet"
    elif 'haiku' in model_str_lower:
        model = "Haiku"
    else:
        model = model_str.split('-')[0].title() if model_str else "Claude"

    # --- Context / Tokens ---
    ctx_window = data.get('context_window', {}) or {}
    context_size = ctx_window.get('context_window_size', 200000) or 200000
    used_pct = ctx_window.get('used_percentage') or 0
    context_usage = used_pct / 100.0
    current_context_tokens = int(context_size * context_usage)

    # --- Folder ---
    workspace = data.get('workspace', {}) or {}
    folder_path = data.get('cwd') or workspace.get('current_dir') or workspace.get('project_dir') or ''
    folder_name = os.path.basename(folder_path) if folder_path else "Root"
    if not folder_name or folder_name == '/':
        folder_name = "Root"

    # --- Location (auto-detect from hostname) ---
    hostname = socket.gethostname().lower()

    C_WHITE = "\033[38;5;255m"
    C_CYAN = "\033[38;5;51m"
    C_ORANGE = "\033[38;5;208m"
    C_BLUE = "\033[38;5;39m"
    C_GREEN = "\033[38;5;46m"
    C_PINK = "\033[38;5;201m"
    RESET = "\033[0m"

    ICON_CLOUD = "\u2601"
    ICON_SHIP = "\u26f5"
    ICON_HOME = "\u2302"
    ICON_GIT = "\ue0a0"
    ICON_FOLDER = "\uf07b"

    if 'droplet' in hostname or 'digital' in hostname or hostname.startswith('do-'):
        location, loc_icon = "DO", f"{C_ORANGE}{ICON_CLOUD}{RESET}"
    elif 'vultr' in hostname:
        location, loc_icon = "VU", f"{C_BLUE}{ICON_SHIP}{RESET}"
    elif 'linode' in hostname or 'akamai' in hostname:
        location, loc_icon = "LN", f"{C_CYAN}{ICON_CLOUD}{RESET}"
    elif 'aws' in hostname or 'ec2' in hostname or 'amazon' in hostname:
        location, loc_icon = "AWS", f"{C_ORANGE}{ICON_CLOUD}{RESET}"
    elif 'gcp' in hostname or 'google' in hostname:
        location, loc_icon = "GCP", f"{C_BLUE}{ICON_CLOUD}{RESET}"
    elif 'azure' in hostname:
        location, loc_icon = "AZ", f"{C_CYAN}{ICON_CLOUD}{RESET}"
    elif 'codespace' in hostname or 'github' in hostname:
        location, loc_icon = "GH", f"{C_WHITE}\uf09b{RESET}"
    elif 'home' in hostname or hostname in ['homeserver', 'nas', 'local']:
        location, loc_icon = "HOME", f"{C_GREEN}{ICON_HOME}{RESET}"
    else:
        location, loc_icon = "VPS", f"{C_ORANGE}{ICON_CLOUD}{RESET}"

    # --- Git ---
    git_info = ""
    try:
        git_dir = folder_path if folder_path else os.getcwd()
        branch_result = subprocess.run(
            ['git', 'branch', '--show-current'],
            capture_output=True, text=True, cwd=git_dir, timeout=1
        )
        branch = branch_result.stdout.strip()
        if branch:
            status_result = subprocess.run(
                ['git', 'status', '--porcelain'],
                capture_output=True, text=True, cwd=git_dir, timeout=1
            )
            dirty = "\u2726" if status_result.stdout.strip() else ""
            ahead_behind = ""
            try:
                ab_result = subprocess.run(
                    ['git', 'rev-list', '--left-right', '--count',
                     f'{branch}...@{{upstream}}'],
                    capture_output=True, text=True, cwd=git_dir,
                    timeout=1, stderr=subprocess.DEVNULL
                )
                if ab_result.returncode == 0:
                    parts = ab_result.stdout.strip().split()
                    if len(parts) == 2:
                        ahead, behind = int(parts[0]), int(parts[1])
                        if ahead > 0:
                            ahead_behind += f"\u2191{ahead}"
                        if behind > 0:
                            ahead_behind += f"\u2193{behind}"
            except:
                pass
            git_info = f"{C_PINK}{ICON_GIT} {branch}{dirty}{ahead_behind}{RESET}"
    except:
        pass

    # --- Token display ---
    limit_str = f"{context_size // 1000}k" if context_size >= 1000 else str(context_size)
    tokens_fmt = f"{current_context_tokens // 1000}k" if current_context_tokens >= 1000 else str(current_context_tokens)
    token_display = f"{tokens_fmt}/{limit_str}"

    # --- Context bar ---
    context_remaining = 1.0 - context_usage
    percent_remaining = round(context_remaining * 100)
    bar_length = 10
    filled = max(0, min(bar_length, round(context_remaining * bar_length)))
    bar = "\u2588" * filled + "\u2591" * (bar_length - filled)

    # --- LIVE pulse ---
    pulse_phase = int(time.time()) % 4
    pulse_icons = [
        (C_GREEN, "\u25cf"),
        ("\033[38;5;42m", "\u25c9"),
        ("\033[38;5;36m", "\u25cb"),
        ("\033[38;5;42m", "\u25c9"),
    ]
    pulse_color, pulse_icon = pulse_icons[pulse_phase]

    C_MODEL = "\033[38;5;123m"
    C_TOKENS = "\033[38;5;220m"
    C_BAR = C_GREEN
    C_FOLDER = C_BLUE

    segments = [
        f"{loc_icon} {C_ORANGE}{location}{RESET}",
        f"{C_FOLDER}{ICON_FOLDER} {folder_name}{RESET}",
        f"{C_MODEL}{model}{RESET}",
        f"{C_TOKENS}{token_display}{RESET}",
        f"{C_BAR}{bar} {percent_remaining}%{RESET}",
        f"{pulse_color}{pulse_icon} LIVE{RESET}"
    ]

    if git_info:
        segments.insert(2, git_info)

    print("  ".join(segments))

except Exception:
    sys.exit(0)
