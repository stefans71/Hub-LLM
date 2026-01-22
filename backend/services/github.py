"""
GitHub & Codespaces Service

Integrates with GitHub API to:
- List user's Codespaces
- Start/stop Codespaces
- Get SSH connection details for Codespaces
"""
import httpx
from typing import Optional
from dataclasses import dataclass


GITHUB_API_BASE = "https://api.github.com"


@dataclass
class Codespace:
    id: int
    name: str
    display_name: str
    state: str  # Available, Shutdown, Starting, etc.
    repository: str
    branch: str
    machine_type: str
    created_at: str
    updated_at: str
    web_url: str
    ssh_url: Optional[str] = None


class GitHubService:
    """GitHub API client for Codespaces management"""
    
    def __init__(self, token: str):
        self.token = token
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }
    
    async def get_user(self) -> dict:
        """Get authenticated user info"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{GITHUB_API_BASE}/user",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
    
    async def list_codespaces(self) -> list[Codespace]:
        """List all codespaces for the authenticated user"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{GITHUB_API_BASE}/user/codespaces",
                headers=self.headers
            )
            response.raise_for_status()
            data = response.json()
            
            codespaces = []
            for cs in data.get("codespaces", []):
                codespaces.append(Codespace(
                    id=cs["id"],
                    name=cs["name"],
                    display_name=cs.get("display_name", cs["name"]),
                    state=cs["state"],
                    repository=cs["repository"]["full_name"],
                    branch=cs.get("git_status", {}).get("ref", "main"),
                    machine_type=cs.get("machine", {}).get("display_name", "Unknown"),
                    created_at=cs["created_at"],
                    updated_at=cs["updated_at"],
                    web_url=cs["web_url"]
                ))
            
            return codespaces
    
    async def get_codespace(self, codespace_name: str) -> Codespace:
        """Get details for a specific codespace"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{GITHUB_API_BASE}/user/codespaces/{codespace_name}",
                headers=self.headers
            )
            response.raise_for_status()
            cs = response.json()
            
            return Codespace(
                id=cs["id"],
                name=cs["name"],
                display_name=cs.get("display_name", cs["name"]),
                state=cs["state"],
                repository=cs["repository"]["full_name"],
                branch=cs.get("git_status", {}).get("ref", "main"),
                machine_type=cs.get("machine", {}).get("display_name", "Unknown"),
                created_at=cs["created_at"],
                updated_at=cs["updated_at"],
                web_url=cs["web_url"]
            )
    
    async def start_codespace(self, codespace_name: str) -> dict:
        """Start a stopped codespace"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{GITHUB_API_BASE}/user/codespaces/{codespace_name}/start",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
    
    async def stop_codespace(self, codespace_name: str) -> dict:
        """Stop a running codespace"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{GITHUB_API_BASE}/user/codespaces/{codespace_name}/stop",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
    
    async def get_codespace_machines(self, repo_owner: str, repo_name: str) -> list[dict]:
        """Get available machine types for a repository"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{GITHUB_API_BASE}/repos/{repo_owner}/{repo_name}/codespaces/machines",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json().get("machines", [])
    
    async def create_codespace(
        self, 
        repo_owner: str, 
        repo_name: str,
        branch: str = "main",
        machine: str = "basicLinux32gb"
    ) -> Codespace:
        """Create a new codespace for a repository"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{GITHUB_API_BASE}/repos/{repo_owner}/{repo_name}/codespaces",
                headers=self.headers,
                json={
                    "ref": branch,
                    "machine": machine
                }
            )
            response.raise_for_status()
            cs = response.json()
            
            return Codespace(
                id=cs["id"],
                name=cs["name"],
                display_name=cs.get("display_name", cs["name"]),
                state=cs["state"],
                repository=cs["repository"]["full_name"],
                branch=branch,
                machine_type=machine,
                created_at=cs["created_at"],
                updated_at=cs["updated_at"],
                web_url=cs["web_url"]
            )
    
    async def delete_codespace(self, codespace_name: str) -> bool:
        """Delete a codespace"""
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{GITHUB_API_BASE}/user/codespaces/{codespace_name}",
                headers=self.headers
            )
            return response.status_code == 202
    
    async def list_repos(self, per_page: int = 30) -> list[dict]:
        """List repositories accessible to the user"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{GITHUB_API_BASE}/user/repos",
                headers=self.headers,
                params={
                    "per_page": per_page,
                    "sort": "updated",
                    "direction": "desc"
                }
            )
            response.raise_for_status()
            return response.json()


# Note: To SSH into a Codespace, users need to:
# 1. Install GitHub CLI: gh auth login
# 2. Run: gh codespace ssh -c <codespace-name>
# 
# For direct SSH access without gh CLI, users need to:
# 1. Add their SSH key to GitHub
# 2. Use the VS Code Remote SSH extension
#
# The web_url can be used to open the Codespace in browser
