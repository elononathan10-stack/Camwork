import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  getAllUsers,
} from "../user/usercontroller.js";
import User from "../user/usermodel.js";

const createMockRes = () => {
  return {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
  };
};

test("register: passes correct where clause to User.findOne and creates user", async () => {
  const originalFindOne = User.findOne;
  const originalCreate = User.create;

  let findOneOptions = null;
  let createPayload = null;

  User.findOne = async (opts) => {
    findOneOptions = opts;
    return null;
  };

  User.create = async (payload) => {
    createPayload = payload;
    return { id: 1, ...payload };
  };

  try {
    const req = {
      body: {
        name: "John Doe",
        email: "JOHN@example.com",
        password: "password123",
        role: "Seeker",
      },
    };
    const res = createMockRes();

    await register(req, res);

    assert.equal(res.statusCode, 201);
    assert.deepEqual(findOneOptions, {
      where: { email: "john@example.com" },
    });
    assert.equal(createPayload.email, "john@example.com");
    assert.equal(createPayload.role, "Seeker");
    assert.ok(createPayload.password !== "password123");
  } finally {
    User.findOne = originalFindOne;
    User.create = originalCreate;
  }
});

test("register: returns 409 when user already exists", async () => {
  const originalFindOne = User.findOne;

  User.findOne = async () => ({ id: 1, email: "exists@example.com" });

  try {
    const req = {
      body: {
        name: "Existing",
        email: "exists@example.com",
        password: "password123",
      },
    };
    const res = createMockRes();

    await register(req, res);

    assert.equal(res.statusCode, 409);
    assert.equal(res.data.message, "Email already exists");
  } finally {
    User.findOne = originalFindOne;
  }
});

test("login: passes correct where clause to User.findOne and verifies password", async () => {
  const originalFindOne = User.findOne;

  let findOneOptions = null;
  const hashedPassword = await bcrypt.hash("correct-password", 10);

  User.findOne = async (opts) => {
    findOneOptions = opts;
    return {
      id: 1,
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
    };
  };

  try {
    const req = {
      body: {
        email: "TEST@EXAMPLE.COM",
        password: "correct-password",
      },
    };
    const res = createMockRes();

    await login(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(findOneOptions, {
      where: { email: "test@example.com" },
    });
    assert.ok(res.data.token);
    assert.equal(res.data.user.email, "test@example.com");
  } finally {
    User.findOne = originalFindOne;
  }
});

test("login: returns 401 on invalid password", async () => {
  const originalFindOne = User.findOne;
  const hashedPassword = await bcrypt.hash("correct-password", 10);

  User.findOne = async () => ({
    id: 1,
    email: "test@example.com",
    password: hashedPassword,
  });

  try {
    const req = {
      body: {
        email: "test@example.com",
        password: "wrong-password",
      },
    };
    const res = createMockRes();

    await login(req, res);

    assert.equal(res.statusCode, 401);
    assert.equal(res.data.error, "Invalid password");
  } finally {
    User.findOne = originalFindOne;
  }
});

test("login: returns 404 when user not found", async () => {
  const originalFindOne = User.findOne;

  User.findOne = async () => null;

  try {
    const req = {
      body: {
        email: "unknown@example.com",
        password: "password123",
      },
    };
    const res = createMockRes();

    await login(req, res);

    assert.equal(res.statusCode, 404);
    assert.equal(res.data.error, "User not found");
  } finally {
    User.findOne = originalFindOne;
  }
});

test("forgotPassword: sets resetToken and uses correct where clause", async () => {
  const originalFindOne = User.findOne;

  let findOneOptions = null;
  let savedUser = null;

  User.findOne = async (opts) => {
    findOneOptions = opts;
    return {
      email: "user@example.com",
      resetToken: null,
      resetTokenExpires: null,
      save: async function () {
        savedUser = this;
        return this;
      },
    };
  };

  try {
    const req = {
      body: {
        email: "USER@EXAMPLE.COM",
      },
    };
    const res = createMockRes();

    await forgotPassword(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(findOneOptions, {
      where: { email: "user@example.com" },
    });
    assert.ok(savedUser.resetToken);
    assert.ok(savedUser.resetTokenExpires instanceof Date);
    assert.equal(res.data.resetToken, savedUser.resetToken);
  } finally {
    User.findOne = originalFindOne;
  }
});

test("resetPassword: verifies token using where clause and updates password", async () => {
  const originalFindOne = User.findOne;

  let findOneOptions = null;
  let savedUser = null;

  User.findOne = async (opts) => {
    findOneOptions = opts;
    return {
      id: 1,
      email: "user@example.com",
      resetToken: "valid-token",
      resetTokenExpires: new Date(Date.now() + 60000),
      save: async function () {
        savedUser = this;
        return this;
      },
    };
  };

  try {
    const req = {
      body: {
        token: "valid-token",
        password: "new-password123",
      },
    };
    const res = createMockRes();

    await resetPassword(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(findOneOptions, {
      where: { resetToken: "valid-token" },
    });
    assert.equal(savedUser.resetToken, null);
    assert.equal(savedUser.resetTokenExpires, null);
    const matches = await bcrypt.compare("new-password123", savedUser.password);
    assert.ok(matches);
  } finally {
    User.findOne = originalFindOne;
  }
});

test("getAllUsers: fetches all users via User.findAll", async () => {
  const originalFindAll = User.findAll;

  User.findAll = async () => [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ];

  try {
    const req = {};
    const res = createMockRes();

    await getAllUsers(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.data.length, 2);
  } finally {
    User.findAll = originalFindAll;
  }
});
