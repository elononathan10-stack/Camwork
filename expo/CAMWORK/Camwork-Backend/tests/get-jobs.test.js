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

describe("Get jobs", () => {
  it("returns public jobs with the newest postings first", async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const employerEmail = `employer-${suffix}@example.com`;
    const createResponse = await supertest(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${createToken(employerEmail)}`)
      .send({
        title: "GET endpoint integration job",
        company: "CamWork Test Company",
        location: "Douala, Littoral",
        category: "Technology",
        type: "Formal",
        salary: "250000 FCFA monthly",
        description: "Build and maintain software features for the team.",
        responsibilities: ["Build features"],
        requirements: ["Relevant experience"],
        skills: ["JavaScript", "Testing"],
      });

    expect(createResponse.status).to.equal(201);

    const response = await supertest(app).get("/api/jobs");

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an("array");
    expect(response.body.some((job) => job.id === createResponse.body.id)).to.be
      .true;
    for (let index = 1; index < response.body.length; index += 1) {
      expect(
        new Date(response.body[index - 1].createdAt).getTime(),
      ).to.be.at.least(new Date(response.body[index].createdAt).getTime());
    }
  });
});
