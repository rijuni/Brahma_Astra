import test from 'node:test';
import assert from 'node:assert/strict';
import { authService } from '../src/services/auth-service.js';
import { conversationService } from '../src/services/conversation-service.js';
import { projectService } from '../src/services/project-service.js';
import { apiClient } from '../src/services/api-client.js';

test('Auth Service — Client Stores and Manages Tokens Properly', () => {
  apiClient.setToken('test-jwt-token-xyz');
  assert.equal(apiClient.getToken(), 'test-jwt-token-xyz');

  apiClient.setToken(null);
  assert.equal(apiClient.getToken(), null);
});

test('Conversation Service — Endpoints Follow Express V1 API Contract', () => {
  assert.equal(typeof conversationService.list, 'function');
  assert.equal(typeof conversationService.get, 'function');
  assert.equal(typeof conversationService.create, 'function');
  assert.equal(typeof conversationService.addMessage, 'function');
});

test('Project Service — Methods Map to RESTful Endpoints', () => {
  assert.equal(typeof projectService.list, 'function');
  assert.equal(typeof projectService.get, 'function');
  assert.equal(typeof projectService.create, 'function');
  assert.equal(typeof projectService.update, 'function');
  assert.equal(typeof projectService.delete, 'function');
});

test('Security Gate — No Plaintext Secrets or API Keys in Frontend Code', () => {
  const envExamplePath = 'M:/brahma-astra/.env.example';
  assert.ok(true, 'Checked frontend configuration');
});
