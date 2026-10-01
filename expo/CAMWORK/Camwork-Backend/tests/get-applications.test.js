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

const createJobPayload = {
  title: "GET applications integration job",
  company: "CamWork Test Company",
  location: "Douala, Littoral",
  category: "Technology",
  type: "Formal",
  salary: "250000 FCFA monthly",
  description: "Build and maintain software features for the team.",
  responsibilities: ["Build features"],
  requirements: ["Relevant experience"],
  skills: ["JavaScript", "Testing"],
};

describe("Get applications", () => {
  it("returns the seeker's and employer's applications only to authenticated users", async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const employerEmail = `employer-${suffix}@example.com`;
    const applicantEmail = `seeker-${suffix}@example.com`;
    const employerToken = createToken(employerEmail);
    const applicantToken = createToken(applicantEmail);

    const jobResponse = await supertest(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${employerToken}`)
      .send(createJobPayload);

    expect(jobResponse.status).to.equal(201);

    const applicationResponse = await supertest(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${applicantToken}`)
      .send({ jobId: jobResponse.body.id });

    expect(applicationResponse.status).to.equal(201);

    const unauthorizedResponse = await supertest(app).get("/api/applications");
    expect(unauthorizedResponse.status).to.equal(401);

    const seekerResponse = await supertest(app)
      .get("/api/applications?role=seeker")
      .set("Authorization", `Bearer ${applicantToken}`);
    const employerResponse = await supertest(app)
      .get("/api/applications?role=employer")
      .set("Authorization", `Bearer ${employerToken}`);

    expect(seekerResponse.status).to.equal(200);
    expect(employerResponse.status).to.equal(200);
    expect(seekerResponse.body).to.be.an("array");
    expect(employerResponse.body).to.be.an("array");
    expect(
      seekerResponse.body.some(
        (application) => application.id === applicationResponse.body.id,
      ),
    ).to.be.true;
    expect(
      employerResponse.body.some(
        (application) => application.id === applicationResponse.body.id,
      ),
    ).to.be.true;
  });
});
