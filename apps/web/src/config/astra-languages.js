// Centralized Multi-Language Registry for ASTRA Studio (30+ Languages)

export const ASTRA_LANGUAGES = [
  {
    id: 'python',
    name: 'Python',
    extensions: ['.py', '.pyw', '.pyx'],
    mode: 'python',
    iconColor: '#38BDF8',
    capabilities: {
      editing: true,
      aiAssisted: true,
      compilation: false,
      execution: true,
      testing: true,
      debugging: true
    },
    sampleCode: `from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional

app = FastAPI(
    title="ASTRA Microservice API",
    version="1.0.0",
    description="High-performance backend service"
)

class ItemSchema(BaseModel):
    id: int
    name: str = Field(..., max_length=100)
    price: float = Field(..., gt=0)
    is_active: bool = True

@app.get("/api/v1/items", response_model=List[ItemSchema])
async def list_items():
    """Retrieve operational inventory records."""
    return [
        {"id": 1, "name": "Telemetry Node", "price": 42.50, "is_active": True},
        {"id": 2, "name": "Quantum Buffer", "price": 199.99, "is_active": True}
    ]
`
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    extensions: ['.js', '.mjs', '.cjs'],
    mode: 'javascript',
    iconColor: '#FBBF24',
    capabilities: {
      editing: true,
      aiAssisted: true,
      compilation: false,
      execution: true,
      testing: true,
      debugging: true
    },
    sampleCode: `// Express.js Route Controller
import express from 'express';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
`
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    extensions: ['.ts', '.tsx'],
    mode: 'typescript',
    iconColor: '#60A5FA',
    capabilities: {
      editing: true,
      aiAssisted: true,
      compilation: true,
      execution: true,
      testing: true,
      debugging: true
    },
    sampleCode: `interface UserSession {
  id: string;
  email: string;
  role: 'admin' | 'developer' | 'viewer';
  lastActive: Date;
}

export function validateSession(session: UserSession): boolean {
  return session.role === 'admin' || session.role === 'developer';
}
`
  },
  {
    id: 'rust',
    name: 'Rust',
    extensions: ['.rs'],
    mode: 'rust',
    iconColor: '#F97316',
    capabilities: {
      editing: true,
      aiAssisted: true,
      compilation: true,
      execution: true,
      testing: true,
      debugging: false
    },
    sampleCode: `use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Debug, Clone)]
pub struct AstraCluster {
    pub name: String,
    pub nodes: usize,
}

impl AstraCluster {
    pub fn new(name: &str, nodes: usize) -> Self {
        Self {
            name: name.to_string(),
            nodes,
        }
    }
}
`
  },
  {
    id: 'go',
    name: 'Go',
    extensions: ['.go'],
    mode: 'go',
    iconColor: '#06B6D4',
    capabilities: {
      editing: true,
      aiAssisted: true,
      compilation: true,
      execution: true,
      testing: true,
      debugging: true
    },
    sampleCode: `package main

import (
	"encoding/json"
	"net/http"
)

type StatusResponse struct {
	Status string \`json:"status"\`
	Engine string \`json:"engine"\`
}

func main() {
	http.HandleFunc("/status", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(StatusResponse{Status: "ready", Engine: "astra-runner"})
	})
	http.ListenAndServe(":8080", nil)
}
`
  },
  {
    id: 'java',
    name: 'Java',
    extensions: ['.java'],
    mode: 'java',
    iconColor: '#EF4444',
    capabilities: {
      editing: true,
      aiAssisted: true,
      compilation: true,
      execution: false,
      testing: false,
      debugging: false
    },
    sampleCode: `public class AstraApplication {
    public static void main(String[] args) {
        System.out.println("ASTRA Java runtime container initialized.");
    }
}
`
  },
  {
    id: 'csharp',
    name: 'C#',
    extensions: ['.cs'],
    mode: 'csharp',
    iconColor: '#A855F7',
    capabilities: {
      editing: true,
      aiAssisted: true,
      compilation: true,
      execution: false,
      testing: false,
      debugging: false
    },
    sampleCode: `namespace Astra.Core;

public record AgentTask(string Id, string Name, bool IsCompleted);
`
  },
  {
    id: 'cpp',
    name: 'C++',
    extensions: ['.cpp', '.cc', '.cxx', '.h', '.hpp'],
    mode: 'cpp',
    iconColor: '#3B82F6',
    capabilities: {
      editing: true,
      aiAssisted: true,
      compilation: true,
      execution: false,
      testing: false,
      debugging: false
    },
    sampleCode: `#include <iostream>
#include <vector>

int main() {
    std::cout << "ASTRA High Performance Core Engine\\n";
    return 0;
}
`
  },
  {
    id: 'sql',
    name: 'SQL',
    extensions: ['.sql'],
    mode: 'sql',
    iconColor: '#EC4899',
    capabilities: {
      editing: true,
      aiAssisted: true,
      compilation: false,
      execution: true,
      testing: true,
      debugging: false
    },
    sampleCode: `-- Schema Migration: Add Audit Indices
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
SELECT id, name, email FROM users WHERE role = 'admin' LIMIT 10;
`
  },
  {
    id: 'html',
    name: 'HTML',
    extensions: ['.html', '.htm'],
    mode: 'html',
    iconColor: '#EA580C',
    capabilities: { editing: true, aiAssisted: true, compilation: false, execution: true, testing: false, debugging: false },
    sampleCode: `<!DOCTYPE html>\n<html lang="en">\n<head><title>ASTRA</title></head>\n<body><h1>ASTRA Studio</h1></body>\n</html>`
  },
  {
    id: 'css',
    name: 'CSS',
    extensions: ['.css'],
    mode: 'css',
    iconColor: '#38BDF8',
    capabilities: { editing: true, aiAssisted: true, compilation: false, execution: true, testing: false, debugging: false },
    sampleCode: `.cosmic-portal { backdrop-filter: blur(16px); background: rgba(30, 27, 61, 0.6); }`
  },
  {
    id: 'json',
    name: 'JSON',
    extensions: ['.json'],
    mode: 'json',
    iconColor: '#10B981',
    capabilities: { editing: true, aiAssisted: true, compilation: false, execution: false, testing: true, debugging: false },
    sampleCode: `{\n  "name": "astra-workspace",\n  "version": "1.0.0",\n  "private": true\n}`
  },
  {
    id: 'yaml',
    name: 'YAML',
    extensions: ['.yaml', '.yml'],
    mode: 'yaml',
    iconColor: '#F59E0B',
    capabilities: { editing: true, aiAssisted: true, compilation: false, execution: false, testing: true, debugging: false },
    sampleCode: `version: "3.9"\nservices:\n  astra-engine:\n    image: astra/engine:v1\n    ports:\n      - "8002:8002"\n`
  },
  {
    id: 'markdown',
    name: 'Markdown',
    extensions: ['.md', '.markdown'],
    mode: 'markdown',
    iconColor: '#94A3B8',
    capabilities: { editing: true, aiAssisted: true, compilation: false, execution: false, testing: false, debugging: false },
    sampleCode: `# ASTRA Architecture RFC\n\n- Multi-pane IDE\n- AI Planning State Machine\n- Sandboxed Execution\n`
  },
  {
    id: 'shell',
    name: 'Bash & Shell',
    extensions: ['.sh', '.bash'],
    mode: 'shell',
    iconColor: '#10B981',
    capabilities: { editing: true, aiAssisted: true, compilation: false, execution: true, testing: true, debugging: false },
    sampleCode: `#!/usr/bin/env bash\necho "Starting ASTRA background services..."\n`
  },
  {
    id: 'powershell',
    name: 'PowerShell',
    extensions: ['.ps1', '.psm1'],
    mode: 'powershell',
    iconColor: '#3B82F6',
    capabilities: { editing: true, aiAssisted: true, compilation: false, execution: true, testing: true, debugging: false },
    sampleCode: `Write-Host "ASTRA Windows Native Environment Active" -ForegroundColor Cyan`
  },
  {
    id: 'dockerfile',
    name: 'Dockerfile',
    extensions: ['Dockerfile', '.dockerignore'],
    mode: 'dockerfile',
    iconColor: '#0EA5E9',
    capabilities: { editing: true, aiAssisted: true, compilation: false, execution: false, testing: true, debugging: false },
    sampleCode: `FROM python:3.12-slim\nWORKDIR /app\nCOPY . .\nCMD ["uvicorn", "main:app"]`
  }
];

export function getLanguageForFile(filename = '') {
  const clean = filename.toLowerCase().trim();
  if (clean === 'dockerfile') return ASTRA_LANGUAGES.find((l) => l.id === 'dockerfile');

  for (const lang of ASTRA_LANGUAGES) {
    for (const ext of lang.extensions) {
      if (clean.endsWith(ext)) return lang;
    }
  }
  return {
    id: 'plaintext',
    name: 'Plaintext',
    extensions: ['.txt'],
    mode: 'plaintext',
    iconColor: '#94A3B8',
    capabilities: { editing: true, aiAssisted: true, compilation: false, execution: false, testing: false, debugging: false }
  };
}
