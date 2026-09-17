import { expect } from "chai";
import { describe, it } from "node:test";
import supertest from "supertest";
import userRouter from "../user/userroute.js";
import { app } from "../Server.js";

describe("Authentication tests", () => {
  //it("should create a new user", async () => {
  //   const response = await supertest(app)
  //     .post("/api/users/register")
  //   .send({
  //      email: "test@example.com",
  //    password: "password",
  //  name: "Test User" ,
  // role: "user",});
  // expect(response.status).to.equal(201);

  //console.log("Response body:", response.body); // Log the response body for debugging
  //});
  it("should login an existing user", async () => {
    const response = await supertest(app).post("/api/user/login").send({
      email: "test@example.com",
      password: "password",
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.have.property("token");

    console.log("Login response:", response.body);
  });
});
