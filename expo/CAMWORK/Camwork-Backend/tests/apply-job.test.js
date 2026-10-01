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

const createJobPayload = (suffix) => ({
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

describe("Job applications", () => {
  it("allows a seeker to apply to an open job", async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const employerEmail = `employer-${suffix}@example.com`;
    const applicantEmail = `seeker-${suffix}@example.com`;

    const jobResponse = await supertest(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${createToken(employerEmail)}`)
      .send(createJobPayload(suffix));

    expect(jobResponse.status).to.equal(201);

    const applicationResponse = await supertest(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${createToken(applicantEmail)}`)
      .send({
        jobId: jobResponse.body.id,
        coverNote: "My experience is a good fit for this role.",
      });

    expect(applicationResponse.status).to.equal(201);
    expect(applicationResponse.body).to.include({
      jobId: jobResponse.body.id,
      applicantEmail,
      employerEmail,
      status: "Pending",
    });
  });
});
