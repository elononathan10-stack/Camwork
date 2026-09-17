import { expect } from "chai";
import { describe, it } from "node:test";
import supertest from "supertest";
import { app } from "../Camwork-Backend/Server.js";

describe("Authentication tests", () => {
  it("should create a new user", async () => {
    const response = await supertest(app).post("/api/user/register").send({
      email: "test@example.com",
      password: "password",
      name: "Test User",
      role: "user",
    });
    expect(response.status).to.equal(201);

    console.log("Response body:", response.body); // Log the response body for debugging
  });
});
