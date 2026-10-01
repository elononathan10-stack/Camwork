import { expect } from "chai";
import { describe, it } from "node:test";
import supertest from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../Server.js";

const createToken = (email) =>
  jwt.sign(
    { id: `test-${Date.now()}`, email },
    process.env.JWT_SECRET || "camwork-secret",
    { expiresIn: "1h" },
  );

describe("Job posting", () => {
  it("creates a job for the authenticated employer", async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const employerEmail = `employer-${suffix}@example.com`;
    const response = await supertest(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${createToken(employerEmail)}`)
      .send({
        title: "Backend integration test job",
        company: "CamWork Test Company",
        location: "Douala, Littoral",
        category: "Technology",
        type: "Formal",
        salary: "250000 FCFA monthly",
        description: "Build and maintain software features for the team.",
        responsibilities: ["Build features", "Review changes"],
        requirements: ["Relevant experience"],
        skills: ["JavaScript", "Testing"],
      });

    expect(response.status).to.equal(201);
    expect(response.body).to.include({
      title: "Backend integration test job",
      postedBy: employerEmail,
      status: "open",
    });
    expect(response.body).to.have.property("id");
  });
});
