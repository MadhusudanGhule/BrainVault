import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

export type StoredUser = { id: string; username: string; hash: string; createdAt: string }

const USERS_FILE = path.join(app.getPath('userData'), 'users.json')
let users: StoredUser[] = []
let currentUserId: string | null = null

async function loadUsers() {
  try {
    const raw = await fs.promises.readFile(USERS_FILE, 'utf8')
    users = JSON.parse(raw) as StoredUser[]
  } catch {
    users = []
    await saveUsers()
  }
}

async function saveUsers() {
  await fs.promises.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8')
}

export async function initAuth() {
  await loadUsers()
}

export async function registerUser(username: string, password: string) {
  username = String(username).trim()
  if (!username || !password) throw new Error('username and password required')
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('username already exists')
  }
  const hash = await bcrypt.hash(password, 10)
  const user: StoredUser = { id: randomUUID(), username, hash, createdAt: new Date().toISOString() }
  users.push(user)
  await saveUsers()
  currentUserId = user.id
  const { hash: _h, ...publicUser } = user
  return publicUser
}

export async function loginUser(username: string, password: string) {
  const user = users.find(u => u.username.toLowerCase() === String(username).toLowerCase())
  if (!user) throw new Error('invalid credentials')
  const ok = await bcrypt.compare(password, user.hash)
  if (!ok) throw new Error('invalid credentials')
  currentUserId = user.id
  const { hash: _h, ...publicUser } = user
  return publicUser
}

export async function getCurrentUser() {
  if (!currentUserId) return null
  const user = users.find(u => u.id === currentUserId)
  if (!user) return null
  const { hash: _h, ...publicUser } = user
  return publicUser
}

export async function logoutUser() {
  currentUserId = null
  return true
}