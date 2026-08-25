import test from "node:test";
import assert from "node:assert/strict";
import { forgotPassword } from "../user/usercontroller.js";
import User from "../user/usermodel.js";

test("forgotPassword returns a success message for a valid email", async () => {
  const originalFindOne = User.findOne;

  User.findOne = async () => ({
    email: "user@example.com",
    save: async () => ({ ok: true }),
  });

  try {
    const req = {
      body: {
        email: "user@example.com",
      },
    };

    const res = {
      statusCode: 0,
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

    await forgotPassword(req, res);

    assert.equal(res.statusCode, 200);
    assert.match(res.data.message, /sent|reset/i);
  } finally {
    User.findOne = originalFindOne;
  }
});
