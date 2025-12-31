// notes-backend/src/models/AuthModel.js

class AuthModel {
  constructor() {
    this.users = this.loadUsers();  // ← Load on startup
  }

  loadUsers() {
    if (!global.persistedUsers) {
      global.persistedUsers = [];
    }
    return global.persistedUsers;
  }

  saveUsers() {
    global.persistedUsers = this.users;  // ← Save to persistent storage
  }

  createUser(userId, email, passwordHash) {
    const newUser = {
      userId,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    this.saveUsers();  // ← KEY FIX: Save after creating
    return newUser;
  }

  findUserByEmail(email) {
    return this.users.find((user) => user.email === email);
  }

  findUserById(userId) {
    return this.users.find((user) => user.userId === userId);
  }

  userExists(email) {
    return this.users.some((user) => user.email === email);
  }

  updateUser(userId, updates) {
    const userIndex = this.users.findIndex((u) => u.userId === userId);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates };
      this.saveUsers();  // ← KEY FIX: Save after updating
      return this.users[userIndex];
    }
    return null;
  }

  getAllUsers() {
    return this.users;
  }

  deleteUser(userId) {
    const index = this.users.findIndex((u) => u.userId === userId);
    if (index !== -1) {
      this.users.splice(index, 1);
      this.saveUsers();  // ← KEY FIX: Save after deleting
      return true;
    }
    return false;
  }
}

module.exports = AuthModel;
